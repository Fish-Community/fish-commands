/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the main code, which calls other functions and initializes the plugin.
*/

import * as api from "/api";
import { registerAll } from "/commands/aggregate";
import { text } from "/config";
import { handleTapEvent } from "/frameworks/commands";
import * as menus from "/frameworks/menus";
import { FishEvents, fishPlugin, fishState, ipJoins, tileHistory } from "/globals";
import { loadPacketHandlers } from "/packetHandlers";
import { FishPlayer } from "/players";
import * as timers from "/timers";
import { addToTileHistory, fishCommandsRootDirPath, formatTimeRelative, matchFilter, processChat, restartNow, serverRestartLoop } from "/utils";


Events.on(EventType.ConnectionEvent, (e) => {
	if(Vars.netServer.admins.bannedIPs.contains(e.connection.address)){
		api.getBanned({
			ip: e.connection.address,
		}, (banned) => {
			if(!banned){
				//If they were previously banned locally, but the API says they aren't banned, then unban them and clear the kick that the outer function already did
				Vars.netServer.admins.unbanPlayerIP(e.connection.address);
				Vars.netServer.admins.kickedIPs.remove(e.connection.address);
			}
		});
	} else if(api.isVpnCached(e.connection.address) && FishPlayer.shouldWhackFlaggedPlayers()){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kick("You have been DOSblacklisted. Please join our discord for help: " + text.discordURL + "\nYou won't see this message again.");
		Log.info(`&yAntibot killed connection ${e.connection.address} due to flagged while under attack`);
	}
});
Events.on(EventType.PlayerConnect, (e) => {
	if(FishPlayer.shouldKickNewPlayers() && e.player.info.timesJoined == 1){
		//do not use the helper function, for maximum performance
		e.player.kick(Packets.KickReason.kick, 3600_000);
	}
	FishPlayer.onPlayerConnect(e.player);
});
Events.on(EventType.PlayerJoin, (e) => {
	FishPlayer.onPlayerJoin(e.player);
});
Events.on(EventType.PlayerLeave, (e) => {
	FishPlayer.onPlayerLeave(e.player);
});
Events.on(EventType.ConnectPacketEvent, (e: { packet: ConnectPacket; connection: NetConnection }) => {
	if(!FishPlayer.connectRate.allow(5_000, 35)){
		FishPlayer.triggerAntibot(300_000, "Rate of player connections exceeded 35 / 5s", "automatic");
	}
	ipJoins.increment(e.connection.address);
	const info = Vars.netServer.admins.getInfoOptional(e.packet.uuid);
	const underAttack = FishPlayer.antiBotMode();
	const newPlayer = !info || info.timesJoined < 10;
	const longModName = e.packet.mods.contains((str:string) => str.length > 50);
	const veryLongModName = e.packet.mods.contains((str:string) => str.length > 100);
	if(
		(underAttack && e.packet.mods.size > 2) ||
		(underAttack && longModName) ||
		(veryLongModName && (underAttack || newPlayer))
	){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.triggerAntibot(
			60_000,
			(veryLongModName ? "very long mod name" : longModName ? "long mod name" : "it had mods while under attack"),
			"automatic"
		);
		return;
	}
	const suspiciousModName = e.packet.mods.contains((str:string) => str.includes('\x1B'));
	if(suspiciousModName || e.packet.name.includes('\x1B')){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.triggerAntibot(
			5_000,
			"illegal characters in name or mods",
			"automatic"
		);
		return;
	}
	if(ipJoins.get(e.connection.address) >= ( (underAttack || veryLongModName) ? 3 : (newPlayer || longModName) ? 7 : 15 )){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.triggerAntibot(
			5_000,
			"too many connections",
			"automatic"
		);
		return;
	}
	/*if(e.packet.name.includes("discord.gg/GnEdS9TdV6")){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.onBotWhack();
		Log.info(`&yAntibot killed connection ${e.connection.address} due to omni discord link`);
		return;
	}*/
	if(e.packet.name.includes("1`1@everyone")){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.triggerAntibot(-1, "known bad name", "automatic");
		return;
	}
	if(Vars.netServer.admins.isDosBlacklisted(e.connection.address)){
		//threading moment, i think
		e.connection.kicked = true;
		return;
	}
	api.getBanned({
		ip: e.connection.address,
		uuid: e.packet.uuid
	}, (banned) => {
		if(banned){
			Log.info(`&lrSynced ban of ${e.packet.uuid}/${e.connection.address}.`);
			e.connection.kick(Packets.KickReason.banned, 1);
			Vars.netServer.admins.banPlayerIP(e.connection.address);
			Vars.netServer.admins.banPlayerID(e.packet.uuid);
		} else {
			Vars.netServer.admins.unbanPlayerIP(e.connection.address);
			Vars.netServer.admins.unbanPlayerID(e.packet.uuid);
		}
	});
	FishPlayer.onConnectPacket(e.packet);
});
Events.on(EventType.UnitChangeEvent, (e) => {
	FishPlayer.onUnitChange(e.player, e.unit);
});
Events.on(EventType.ContentInitEvent, () => {
	//Unhide latum and renale
	UnitTypes.latum.hidden = false;
	UnitTypes.renale.hidden = false;
});
Events.on(EventType.PlayerChatEvent, (e) => processChat(e.player, e.message, true));

Events.on(EventType.ServerLoadEvent, (e) => {
	const clientHandler = Vars.netServer.clientCommands;
	const serverHandler = ServerControl.instance.handler;

	FishPlayer.loadAll();
	FishEvents.fire("loadData", []);
	timers.initializeTimers();
	menus.registerListeners();

	//Cap delta
	Time.setDeltaProvider(() => Math.min(Core.graphics.getDeltaTime() * 60, 10));

	// Mute muted players
	Vars.netServer.admins.addChatFilter((player, message) => processChat(player, message));
	// Vars.netServer.admins.addChatFilter((p, message) => FishPlayer.get(p).hasPerm("member") ? message : foolifyChat(message));
	// Action filters
	Vars.netServer.admins.addActionFilter((action:PlayerAction) => {
		const player = action.player;
		const fishP = FishPlayer.get(player);

		//prevent stopped players from doing anything other than deposit items.
		if(!fishP.hasPerm("play")){
			action.player.sendMessage('[scarlet]\u26A0 [yellow]You are stopped, you cant perfom this action.');
			return false;
		} else {
			if(action.type === Administration.ActionType.pickupBlock){
				addToTileHistory({
					pos: `${action.tile!.x},${action.tile!.y}`,
					uuid: action.player.uuid(),
					action: "picked up",
					type: action.tile!.block()?.name ?? "nothing",
				});
			} else if(action.type === Administration.ActionType.control && !action.unit?.spawnedByCore && Date.now() < fishP.blockedFromUnitsUntil){
				action.player.sendMessage(`[scarlet]\u26A0 [yellow]You are blocked from controlling units for ${formatTimeRelative(fishP.blockedFromUnitsUntil, true)}`);
				return false;
			} else if(action.type === Administration.ActionType.pingLocation && action.pingText && action.pingText.length < Vars.maxPingTextLength){
				const fishP = FishPlayer.get(action.player);
				if(fishP.muted){
					action.player.sendMessage(`[scarlet]\u26A0 [yellow]You are muted, you cannot send text through location pings.`);
					return false;
				} else if(matchFilter(action.pingText, "chat", false)){
					//Allow it, but replace
					player.pingX = action.pingX;
					player.pingY = action.pingY;
					player.pingTime = 1;
					player.pingText = text.chatFilterReplacement.messageShort();
					return false;
				}
			}
			return true;
		}
	});

	registerAll(clientHandler, serverHandler);
	loadPacketHandlers();

	//Load plugin data
	try {
		const path = fishCommandsRootDirPath();
		fishPlugin.directory = path.toString();
		Threads.daemon(() => {
			try {
				fishPlugin.version = OS.exec("git", "-C", fishPlugin.directory!, "rev-parse", "HEAD");
			} catch {}
		});
	} catch(err){
		Log.err("Failed to get fish plugin information.");
		Log.err(err);
	}

	FishEvents.fire("dataLoaded", []);

	Runtime.getRuntime().addShutdownHook(new Thread(() => {
		try {
			FishPlayer.uploadAll();
		} catch { Log.err("failed to upload"); }
		try {
			FishEvents.fire("saveData", []);
		} catch { Log.err("failed to save misc data"); }
		try {
			FishPlayer.saveAll(false);
		} catch { Log.err("failed to save player data"); }
		Log.info("Saved on exit.");
	}));

});

// Keeps track of any action performed on a tile for use in tilelog.

Events.on(EventType.BlockBuildBeginEvent, addToTileHistory);
Events.on(EventType.BuildRotateEvent, addToTileHistory);
Events.on(EventType.ConfigEvent, addToTileHistory);
Events.on(EventType.PickupEvent, addToTileHistory);
Events.on(EventType.PayloadDropEvent, addToTileHistory);
Events.on(EventType.UnitDestroyEvent, addToTileHistory);
Events.on(EventType.BlockDestroyEvent, addToTileHistory);
Events.on(EventType.UnitControlEvent, addToTileHistory);


Events.on(EventType.TapEvent, handleTapEvent);

Events.on(EventType.GameOverEvent, (e) => {
	for(const key of Object.keys(tileHistory)){
		//clear tilelog
		tileHistory[key] = null!;
		delete tileHistory[key];
	}
	if(fishState.restartQueued){
		//restart
		Call.sendMessage(`[accent]---[[[coral]+++[]]---\n[accent]Server restart imminent. [green]We'll be back after 15 seconds.[]\n[accent]---[[[coral]+++[]]---`);
		serverRestartLoop(12, true);
		Events.on(EventType.WorldLoadBeginEvent, () => {
			//Remove save
			restartNow(true);
		});
	}
	FishPlayer.onGameOver(e.winner as Team);
});
Events.on(EventType.WorldLoadEvent, () => FishPlayer.onGameBegin());
Events.on(EventType.PlayerChatEvent, e => {
	FishPlayer.onPlayerChat(e.player, e.message);
});

