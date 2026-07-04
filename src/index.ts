/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the main code, which calls other functions and initializes the plugin.
*/

import * as api from "/api";
import { registerAll } from "/commands/aggregate";
import { text } from "/config";
import { handleTapEvent } from "/frameworks/commands";
import * as menus from "/frameworks/menus";
import { Duration } from "/funcs";
import { FishEvents, fishPlugin, fishState, ipJoins, joinDemographics, joinDemographics2, tileHistory } from "/globals";
import { PartialMapRun } from "/maps";
import { loadPacketHandlers } from "/packetHandlers";
import { FishPlayer } from "/players";
import * as timers from "/timers";
import { addToTileHistory, fishCommandsRootDirPath, formatTimeRelative, matchFilter, processChat, restartNow, serverRestartLoop, vnwCondition } from "/utils";

const { Menu } = menus;

Events.on(EventType.ConnectionEvent, (e) => {
	if(Vars.netServer.admins.bannedIPs.contains(e.connection.address)){
		api.getBanned({
			ip: e.connection.address,
		}, (banned) => {
			if(!banned){
				//If they were previously banned locally, but the API says they aren't banned, then unban them and clear the kick that the outer function already did
				Vars.netServer.admins.bannedIPs.remove(e.connection.address);
				Vars.netServer.admins.kickedIPs.remove(e.connection.address);
			}
		});
	} else if(api.isVpnCached(e.connection.address) && FishPlayer.shouldWhackFlaggedPlayers()){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		try {
			Vars.netServer.admins.blacklistDos(e.connection.connection.getRemoteAddressUDP().getAddress().getHostAddress());
		} catch {}
		e.connection.kick("You have been DOSblacklisted. Please join our discord for help: " + text.discordURL + "\nYou won't see this message again.");
		Log.info(`&yAntibot killed connection ${e.connection.address} due to flagged while under attack`);
	}
});
Events.on(EventType.PlayerConnect, (e) => {
	if(FishPlayer.shouldKickNewPlayers() && e.player.info.timesJoined == 1){
		//do not use the helper function, for maximum performance
		e.player.kick("Please rejoin the server in 20 seconds. We apologize for the inconvenience, we are currently under DDoS attack.", 3600_000);
	} else FishPlayer.onPlayerConnect(e.player);
});
Events.on(EventType.PlayerJoin, (e) => {
	FishPlayer.onPlayerJoin(e.player);
});
Events.on(EventType.PlayerLeave, (e) => {
	FishPlayer.onPlayerLeave(e.player);
});
Events.on(EventType.ConnectPacketEvent, (e: { packet: ConnectPacket; connection: NetConnection }) => {
	const limit = Packages.java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() > 30_000 ? 6 : 35;
	if(!FishPlayer.connectRate.allow(5_000, limit)){
		FishPlayer.triggerAntibot(300_000, `Rate of player connections exceeded ${limit} / 5s`, "automatic", true);
	}
	ipJoins.increment(e.connection.address);
	if(e.connection.hasBegunConnecting) return; //will get kicked
	const info = Vars.netServer.admins.getInfoOptional(e.packet.uuid);
	const underAttack = FishPlayer.antiBotMode();
	const newPlayer = !info || info.timesJoined < 10;
	const nameBlacklisted = fishState.antibotData.nameBlacklist?.[1]?.matcher(e.packet.name).matches();
	const nameGraylisted = fishState.antibotData.nameGraylist?.[1]?.matcher(e.packet.name).matches();
	if(newPlayer && (nameBlacklisted && FishPlayer.antiBotMode() || nameGraylisted && FishPlayer.shouldKickNewPlayers())){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		let udpAddress;
		try {
			Vars.netServer.admins.blacklistDos(udpAddress = e.connection.connection.getRemoteAddressUDP().getAddress().getHostAddress());
		} catch {}
		Log.info(`Blacklisting ip @ with name @ because it matched the configured regex.`, udpAddress ? e.connection.address + "/" + udpAddress : e.connection.address, e.packet.name);
		return;
	}
	if(newPlayer && (nameBlacklisted || nameGraylisted && FishPlayer.antiBotMode())){
		Log.info(`Temporarily kicking ip @ with name @ because it matched the configured regex.`, e.connection.address, e.packet.name);
		e.connection.kick("Please change your name to something else. We are currently under attack by bots and your name looks similar to the bots' names.", 3000);
		return;
	}
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
			"automatic",
			false
		);
		return;
	}
	const region = (Reflect as any).invoke(e.packet.uuid, "hashCode");
	const cachedRegion = joinDemographics.get(region);
	if(!cachedRegion){
		joinDemographics.put(region, e.packet.uuid);
	} else if(cachedRegion != e.packet.uuid){
		const cachedRegion2 = joinDemographics2.get(region);
		if(!cachedRegion2){
			joinDemographics2.put(region, e.packet.uuid);
		} else if(cachedRegion2 != e.packet.uuid){
			Vars.netServer.admins.blacklistDos(e.connection.address);
			e.connection.kicked = true;
			FishPlayer.triggerAntibot(
				480_000,
				"suspicious UUIDs",
				"automatic",
				false,
				true
			);
		}
	}
	const suspiciousModName = e.packet.mods.contains((str:string) => str.includes('\x1B'));
	if(suspiciousModName || e.packet.name.includes('\x1B')){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.triggerAntibot(
			5_000,
			"illegal characters in name or mods",
			"automatic",
			false,
		);
		return;
	}
	if(ipJoins.get(e.connection.address) >= ( (underAttack || veryLongModName) ? (newPlayer ? 4 : 5) : (newPlayer || longModName) ? 7 : 15 )){
		Vars.netServer.admins.blacklistDos(e.connection.address);
		e.connection.kicked = true;
		FishPlayer.triggerAntibot(
			5_000,
			"too many connections",
			"automatic",
			false
		);
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
			Vars.netServer.admins.bannedIPs.add(e.connection.address);
			Vars.netServer.admins.banPlayerID(e.packet.uuid);
		} else {
			Vars.netServer.admins.bannedIPs.remove(e.connection.address);
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
	Time.mark();
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

		//prevent stopped players from doing anything
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
			} else if(action.type === Administration.ActionType.control && !action.unit?.spawnedByCore && Date.now() < fishP.blockedFromPossessingUnitsUntil){
				action.player.sendMessage(`[scarlet]\u26A0 [yellow]You are blocked from controlling units for ${formatTimeRelative(fishP.blockedFromPossessingUnitsUntil, true)}`);
				return false;
			} else if(action.type === Administration.ActionType.commandUnits && Date.now() < fishP.blockedFromCommandingUnitsUntil){
				action.player.sendMessage(`[scarlet]\u26A0 [yellow]You are blocked from commanding units for ${formatTimeRelative(fishP.blockedFromCommandingUnitsUntil, true)}`);
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

	Vars.netServer.assigner = (player, players) => {
		if(Vars.state.rules.pvp){
			//find team with minimum amount of players and auto-assign player to that.
			const fishP = FishPlayer.get(player);
			let preferredTeam: Team | null = null;
			if(fishP.restoreTeam && (Date.now() - fishP.restoreTeam[1] < Duration.minutes(5)) && fishP.restoreTeam[2] == PartialMapRun.current?.startTime)
				preferredTeam = fishP.restoreTeam[0];
			const re = Vars.state.teams.getActive().select(data => !(
				(Vars.state.rules.waveTeam == data.team && Vars.state.rules.waves) ||
				!data.hasCore() ||
				data.team == Team.derelict ||
				!data.team.rules().protectCores
			)).min(floatf(data => {
				//Only if the team is valid
				if(data.team == preferredTeam) return -1;
				let count = 0;
				players.forEach(other => {
					if(other.team() == data.team && other != player){
						count ++;
					}
				});
				return count + Mathf.random(-0.1, 0.1);
			}));
			return re == null ? Vars.state.rules.defaultTeam : re.team;
		} else {
			return Vars.state.rules.defaultTeam;
		}
	};

	Log.info("fish-commands: initialized in @ms (incl previous)", Time.elapsed());
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
Events.on(EventType.PlayEvent, () => {
	fishState.startTime = Date.now();
});

Events.on(EventType.WaveEvent, () => {
	if (Vars.state.rules.mode().name() === "survival") vnwCondition.onWaveStart();
});

Events.on(EventType.AdminRequestEvent, e => {
	if(e.action == Packets.AdminAction.wave){
		const fishP = FishPlayer.get(e.player);
		if(Date.now() > fishP.autoConfirmSkipWaveUntil){
			Menu.buttons(fishP, "Confirm", "Are you sure you want to skip the wave?", [
				[{data: "yes", text: "[orange]Yes"}],
				[{data: "suppress", text: "[orange]Yes, don't ask again"}],
				[{data: null, text: "[green]Cancel"}],
			] as const, {
				onCancel: "null",
			}).then(d => {
				if(!d) return;
				Vars.logic.skipWave();
				Log.info("&lc@ &fi&lk[&lb@&fi&lk]&fb has skipped a wave.", e.player.plainName(), fishP.uuid);
				if(d == "suppress"){
					fishP.sendMessage("Wave skipped. You won't be asked again for the next 1 minute.");
					fishP.autoConfirmSkipWaveUntil = Date.now() + Duration.minutes(1);
				} else fishP.sendMessage("Wave skipped.");
			}).catch(Log.err);
			// throw new ValidateException(e.player, "Skip wave admin action blocked, requesting confirmation");
			//Bizarre hack
			//We cannot throw a validate exception directly because it gets wrapped by rhino
			//so we send invalid data to this random java function so it can throw the exception for us
			Packages.mindustry.input.InputHandler.tileConfig(null, null, null);
		}
	}
});

Log.info("fish-commands: parsing done in @ms", Date.now() - (this as any)._startTime);
