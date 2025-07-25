/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains the FishPlayer class, and many player-related functions.
*/

import * as api from "/api";
import { Perm, PermType } from "/commands";
import * as globals from "/globals";
import { FColor, Gamemode, heuristics, localIPAddress, Mode, prefixes, rules, stopAntiEvadeTime, text, tips } from "/config";
import { uuidPattern } from "/globals";
import { Menu } from "/menus";
import { Rank, RankName, RoleFlag, RoleFlagName } from "/ranks";
import type { FishCommandArgType, FishPlayerData, PlayerHistoryEntry } from "/types";
import { cleanText, formatTime, formatTimeRelative, isImpersonator, logAction, logHTrip, match, matchFilter } from "/utils";
import { parseError } from '/funcs';
import { escapeStringColorsClient, escapeStringColorsServer } from '/funcs';
import { crash } from '/funcs';
import { StringIO } from '/funcs';
import { setToArray } from '/funcs';


export class FishPlayer {
	static cachedPlayers:Record<string, FishPlayer> = {};
	static readonly maxHistoryLength = 5;
	static readonly saveVersion = 10;
	static readonly chunkSize = 50000;

	//Static transients
	static stats = {
		numIpsChecked: 0,
		numIpsFlagged: 0,
		numIpsErrored: 0,
	};
	static lastAuthKicked:FishPlayer | null = null;
	//If a new account joins from one of these IPs, the IP gets banned.
	static punishedIPs = [] as [ip:string, uuid:string, expiryTime:number][];
	static flagCount = 0;
	static playersJoinedRecent = 0;
	static antiBotModePersist = false;
	static antiBotModeOverride = false;
	static lastBotWhacked = 0;
	/** Stores the 10 most recent players that left. */
	static recentLeaves:FishPlayer[] = [];
	
	//Transients
	player:mindustryPlayer | null = null;
	pet:string = "";
	watch:boolean = false;
	/** Front-to-back queue of menus to show. */
	activeMenus: {
		callback: (option:number) => void;
	}[] = [];
	tileId = false;
	tilelog:null | "once" | "persist" = null;
	trail: {
		type: string;
		color: Color;
	} | null = null;
	cleanedName:string;
	prefixedName:string;
	/** Used to freeze players when votekicking. */
	frozen:boolean = false;
	usageData: Record<string, {
		lastUsed: number;
		lastUsedSuccessfully: number;
		tapLastUsed: number;
		tapLastUsedSuccessfully: number;
	}> = {};
	tapInfo = {
		commandName: null as string | null,
		lastArgs: {} as Record<string, FishCommandArgType>,
		mode: "once" as "once" | "on",
	};
	lastShownAd:number = globals.maxTime;
	showAdNext:boolean = false;
	tstats = {
		//remember to clear this in updateSavedInfoFromPlayer!
		blocksBroken: 0,
	};
	manualAfk = false;
	shouldUpdateName = true;
	lastMousePosition = [0, 0] as [x:number, y:number];
	lastUnitPosition = [0, 0] as [x:number, y:number];
	lastActive:number = Date.now();
	lastRatelimitedMessage = -1;
	changedTeam = false;
	ipDetectedVpn = false;
	lastPollSent = -1;
	
	//Stored data
	uuid: string;
	name: string;
	muted: boolean;
	autoflagged: boolean;
	unmarkTime: number;
	rank: Rank;
	flags: Set<RoleFlag>;
	highlight: string | null;
	rainbow: {
		speed: number;
	} | null;
	history: PlayerHistoryEntry[];
	usidMapping: Partial<Record<string, string>>;
	chatStrictness: "chat" | "strict" = "chat";
	/** -1 represents unknown */
	lastJoined:number;
	firstJoined:number;
	stats: {
		blocksBroken: number;
		blocksPlaced: number;
		timeInGame: number;
		chatMessagesSent: number;
		/** Does not include RTVs */
		gamesFinished: number;
		gamesWon: number;
	};
	showRankPrefix:boolean;
	/**
	 * 0: unknown
	 * 1: refused / cancelled poll
	 * 2: I won't or can't update to v8
	 * 3: I will update to v8 if Fish updates to v8
	 * 4: I have already updated to v8
	 */
	pollResponse: 0 | 1 | 2 | 3 | 4;

	//TODO: fix this absolute mess of a constructor! I don't remember why this exists
	constructor({
		uuid, name, muted = false, autoflagged = false, unmarkTime: unmarked = -1,
		highlight = null, history = [], rainbow = null, rank = "player", flags = [], usid,
		chatStrictness = "chat", lastJoined, firstJoined, stats, showRankPrefix = true,
		pollResponse = 0,
	}:Partial<FishPlayerData>, player:mindustryPlayer | null){
		this.uuid = uuid ?? player?.uuid() ?? crash(`Attempted to create FishPlayer with no UUID`);
		this.name = name ?? player?.name ?? "Unnamed player [ERROR]";
		this.prefixedName = this.name;
		this.muted = muted;
		this.unmarkTime = unmarked;
		this.lastJoined = lastJoined ?? -1;
		this.firstJoined = firstJoined ?? lastJoined ?? Date.now();
		this.autoflagged = autoflagged;
		this.highlight = highlight;
		this.history = history;
		this.player = player;
		this.rainbow = rainbow;
		this.cleanedName = escapeStringColorsServer(Strings.stripColors(this.name));
		this.rank = Rank.getByName(rank) ?? Rank.player;
		this.flags = new Set(flags.map(RoleFlag.getByName).filter((f):f is RoleFlag => f != null));
		this.usidMapping = typeof usid === "string" ? {[localIPAddress]: usid} : (usid ?? {});
		this.chatStrictness = chatStrictness;
		this.stats = stats ?? {
			blocksBroken: 0,
			blocksPlaced: 0,
			timeInGame: 0,
			chatMessagesSent: 0,
			gamesFinished: 0,
			gamesWon: 0,
		};
		this.showRankPrefix = showRankPrefix;
		this.pollResponse = pollResponse;
	}

	//#region getplayer
	//Contains methods used to get FishPlayer instances.
	static createFromPlayer(player:mindustryPlayer){
		return new this({}, player);
	}
	static createFromInfo(playerInfo:PlayerInfo){
		return new this({
			uuid: playerInfo.id,
			name: playerInfo.lastName,
			usid: playerInfo.adminUsid ?? null
		}, null);
	}
	static getFromInfo(playerInfo:PlayerInfo){
		return this.cachedPlayers[playerInfo.id] ??= this.createFromInfo(playerInfo);
	}
	static get(player:mindustryPlayer):FishPlayer {
		return this.cachedPlayers[player.uuid()] ??= this.createFromPlayer(player);
	}
	static resolve(player:mindustryPlayer | FishPlayer):FishPlayer {
		if(player instanceof FishPlayer) return player;
		else return this.cachedPlayers[player.uuid()] ??= this.createFromPlayer(player);
	}
	static getById(id:string):FishPlayer | null {
		return this.cachedPlayers[id] ?? null;
	}
	/** Returns the FishPlayer representing the first online player matching a given name. */
	static getByName(name:string):FishPlayer | null {
		if(name == "") return null;
		const realPlayer = Groups.player.find(p => {
			return p.name === name ||
				p.name.includes(name) ||
				p.name.toLowerCase().includes(name.toLowerCase()) ||
				Strings.stripColors(p.name).toLowerCase() === name.toLowerCase() ||
				Strings.stripColors(p.name).toLowerCase().includes(name.toLowerCase()) ||
				false;
		});
		return realPlayer ? this.get(realPlayer) : null;
	};
	
	/** Returns the FishPlayers representing all online players matching a given name. */
	static getAllByName(name:string, strict = true):FishPlayer[] {
		if(name == "") return [];
		const output:FishPlayer[] = [];
		Groups.player.each(p => {
			const fishP = FishPlayer.get(p);
			if(fishP.connected() && fishP.cleanedName.includes(name) || (!strict && fishP.cleanedName.toLowerCase().includes(name)))
				output.push(fishP);
		});
		return output;
	}
	static getOneByString(str:string):FishPlayer | "none" | "multiple" {
		if(str == "") return "none";
		const players = this.getAllOnline();
		let matchingPlayers:FishPlayer[];

		const filters:((p:FishPlayer) => boolean)[] = [
			p => p.uuid === str,
			p => p.player!.id.toString() === str,
			p => p.name.toLowerCase() === str.toLowerCase(),
			// p => p.cleanedName === str,
			p => p.cleanedName.toLowerCase() === str.toLowerCase(),
			p => p.name.toLowerCase().includes(str.toLowerCase()),
			// p => p.cleanedName.includes(str),
			p => p.cleanedName.toLowerCase().includes(str.toLowerCase()),
		];

		for(const filter of filters){
			matchingPlayers = players.filter(filter);
			if(matchingPlayers.length == 1) return matchingPlayers[0];
			else if(matchingPlayers.length > 1) return "multiple";
		}
		return "none";
	}
	static getOneMindustryPlayerByName(str:string):mindustryPlayer | "none" | "multiple" {
		if(str == "") return "none";
		const players = setToArray(Groups.player);
		let matchingPlayers:mindustryPlayer[];

		const filters:((p:mindustryPlayer) => boolean)[] = [
			p => p.name === str,
			// p => Strings.stripColors(p.name) === str,
			p => Strings.stripColors(p.name).toLowerCase() === str.toLowerCase(),
			// p => p.name.includes(str),
			p => p.name.toLowerCase().includes(str.toLowerCase()),
			p => Strings.stripColors(p.name).includes(str),
			p => Strings.stripColors(p.name).toLowerCase().includes(str.toLowerCase()),
		];

		for(const filter of filters){
			matchingPlayers = players.filter(filter);
			if(matchingPlayers.length == 1) return matchingPlayers[0];
			else if(matchingPlayers.length > 1) return "multiple";
		}
		return "none";
	}
	//This method exists only because there is no easy way to turn an entitygroup into an array
	static getAllOnline(){
		let players:FishPlayer[] = [];
		Groups.player.each((p:mindustryPlayer) => {
			const fishP = FishPlayer.get(p);
			if(fishP.connected()) players.push(fishP);
		});
		return players;
	}
	/** Returns all cached FishPlayers with names matching the search string. */
	static getAllOfflineByName(name:string){
		const matching:FishPlayer[] = [];
		for(const [uuid, player] of Object.entries(this.cachedPlayers)){
			if(player.cleanedName.toLowerCase().includes(name)) matching.push(player);
		}
		return matching;
	}
	/** Tries to return one cached FishPlayer with name matching the search string. */
	static getOneOfflineByName(str:string):FishPlayer | "none" | "multiple" {
		if(str == "") return "none";
		const players = Object.values(this.cachedPlayers);
		let matchingPlayers:FishPlayer[];

		const filters:((p:FishPlayer) => boolean)[] = [
			p => p.uuid === str,
			p => p.connected() && p.player!.id.toString() === str,
			p => p.name.toLowerCase() === str.toLowerCase(),
			// p => p.cleanedName === str,
			p => p.cleanedName.toLowerCase() === str.toLowerCase(),
			p => p.name.toLowerCase().includes(str.toLowerCase()),
			// p => p.cleanedName.includes(str),
			p => p.cleanedName.toLowerCase().includes(str.toLowerCase()),
		];

		for(const filter of filters){
			matchingPlayers = players.filter(filter);
			if(matchingPlayers.length == 1) return matchingPlayers[0];
			else if(matchingPlayers.length > 1) return "multiple";
		}
		return "none";
	}
	//#endregion

	//#region eventhandling
	//Contains methods that handle an event and must be called by other code (usually through Events.on).
	/** Must be run on PlayerConnectEvent. */
	static onPlayerConnect(player:mindustryPlayer){
		let fishPlayer = this.cachedPlayers[player.uuid()] ??= this.createFromPlayer(player);
		const previousJoin = fishPlayer.lastJoined;
		fishPlayer.updateSavedInfoFromPlayer(player);
		if(fishPlayer.validate()){
			if(!fishPlayer.hasPerm("bypassNameCheck")){
				const message = isImpersonator(fishPlayer.name, fishPlayer.ranksAtLeast("admin"));
				if(message !== false){
					fishPlayer.sendMessage(`[scarlet]\u26A0[] [gold]Oh no! Our systems think you are a [scarlet]SUSSY IMPERSONATOR[]!\n[gold]Reason: ${message}\n[gold]Change your name to remove the tag.`);
				} else if(cleanText(player.name, true).includes("hacker")){
					fishPlayer.sendMessage("[scarlet]\u26A0 Don't be a script kiddie!");
				}
			}
			fishPlayer.updateName();
			fishPlayer.updateAdminStatus();
			fishPlayer.updateMemberExclusiveState();
			fishPlayer.checkVPNAndJoins();
			fishPlayer.checkAutoRanks();
			api.getStopped(player.uuid(), (unmarkTime) => {
				if(unmarkTime)
					fishPlayer.unmarkTime = unmarkTime;
				fishPlayer.sendWelcomeMessage();
				fishPlayer.updateName();
			});
			//I think this is a better spot for this
			if(fishPlayer.firstJoin()) Menu.menu(
				"Rules for [#0000ff] >|||> FISH [white] servers [white]",
				rules.join("\n\n[white]") + "\nYou can view these rules again by running [cyan]/rules[].",
				["[green]I understand and agree to these terms"],
				fishPlayer
			);
			//Only show this to active players
			//At least 10 joins, and has joined at least once in the past month
			//Also, don't spam it if the player doesn't respond (wait 5 hours before asking again)
			if(fishPlayer.joinsAtLeast(10) && Date.now() - previousJoin < 2592000_000 && fishPlayer.pollResponse === 0 && Date.now() - fishPlayer.lastPollSent > 5 * 3600_000){
				fishPlayer.runv8poll();
			}

		}
	}
	/** Must be run on PlayerJoinEvent. */
	static onPlayerJoin(player:mindustryPlayer){
		let fishPlayer = this.cachedPlayers[player.uuid()] ??= (() => {
			Log.err(`onPlayerJoin: no fish player was created? ${player.uuid()}`);
			return this.createFromPlayer(player);
		})();
		//Don't activate heuristics until they've joined
		//a lot of time can pass between connect and join
		//also the player might connect but fail to join for a lot of reasons,
		//or connect, fail to join, then connect again and join successfully
		//which would cause heuristics to activate twice
		fishPlayer.activateHeuristics();
	}
	static updateAFKCheck(){
		//TODO better AFK check
		this.forEachPlayer((fishP, mp) => {
			if(fishP.lastMousePosition[0] != mp.mouseX || fishP.lastMousePosition[1] != mp.mouseY){
				fishP.lastActive = Date.now();
			}
			fishP.lastMousePosition = [mp.mouseX, mp.mouseY];
			if(fishP.lastUnitPosition[0] != mp.x || fishP.lastUnitPosition[1] != mp.y){
				fishP.lastActive = Date.now();
			}
			fishP.lastUnitPosition = [mp.x, mp.y];
			fishP.updateName();
		});
	}
	/** Must be run on PlayerLeaveEvent. */
	static onPlayerLeave(player:mindustryPlayer){
		let fishP = this.cachedPlayers[player.uuid()];
		if(!fishP) return;

		if(
			Vars.netServer.currentlyKicking &&
			Reflect.get(Vars.netServer.currentlyKicking, "target") == player
		){
			//Anti votekick evasion
			const votes = Reflect.get(Vars.netServer.currentlyKicking, "votes") as number;
			if((() => {
				if(fishP.hasPerm("bypassVotekick")) return false;
				if(fishP.hasPerm("bypassVoteFreeze")) return votes >= Vars.netServer.votesRequired();
				if(fishP.info().timesJoined > 50) return votes >= 2;
				return votes >= 1;
			})()){
				const kickDuration = NetServer.kickDuration;
				//Pass the votekick
				Call.sendMessage(`[orange]Vote passed.[scarlet] ${player.name}[orange] will be banned from the server for ${kickDuration / 60} minutes.`);
				player.kick(Packets.KickReason.vote, kickDuration * 1000); //it is stored in seconds but needs to be converted to millis
				(Reflect.get(Vars.netServer.currentlyKicking, "task") as TimerTask).cancel();
				Vars.netServer.currentlyKicking = null;
			}
		}
		//Clear temporary states such as menu and taphandler
		fishP.activeMenus = [];
		fishP.tapInfo.commandName = null;
		fishP.stats.timeInGame += (Date.now() - fishP.lastJoined); //Time between joining and leaving
		fishP.lastJoined = Date.now();
		this.recentLeaves.unshift(fishP);
		if(this.recentLeaves.length > 10) this.recentLeaves.pop();
	}
	static validateVotekickSession(){
		if(!Vars.netServer.currentlyKicking) return;
		const target = this.get(Reflect.get(Vars.netServer.currentlyKicking, "target"));
		const voted = Reflect.get(Vars.netServer.currentlyKicking, "voted") as ObjectIntMap<string>;
		if(voted.size == 2){
			//Try to find the UUID of the initiator
			let uuid:string | null = null;
			voted.entries().toArray().each(e => {
				if(uuidPattern.test(e.key)) uuid = e.key;
			});
			if(uuid){
				const initiator = this.getById(uuid);
				if(initiator?.stelled()){
					if(initiator.hasPerm("bypassVotekick")){
						const msg = (new Error()).stack?.split("\n").slice(0, 4).join("\n");
						Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${initiator.prefixedName}[lightgray].[accent] (\u221E/${Vars.netServer.votesRequired()})
[scarlet]Error: failed to kick player ${initiator.name}
${msg}
[scarlet]Error: failed to cancel votekick
${msg}`
						);
						return;
					}
					Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${initiator.prefixedName}[lightgray].[accent] (\u221E/${Vars.netServer.votesRequired()})
[scarlet]Vote passed.`
					);
					initiator.kick("You are not allowed to votekick other players while marked.", 2);
					Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
					Vars.netServer.currentlyKicking = null;
					return;
				}
			}
		}
		if(target.hasPerm("bypassVotekick")){
			Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.prefixedName}[lightgray].[accent] (-\u221E/${Vars.netServer.votesRequired()})
[scarlet]Vote cancelled.`
			);
			Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
			Vars.netServer.currentlyKicking = null;
		} else if(target.ranksAtLeast("trusted") && Groups.player.size() > 4 && voted.get("__server__") == 0){
			//decrease votes by two, goes from 1 to negative 1
			Reflect.set(Vars.netServer.currentlyKicking, "votes", Packages.java.lang.Integer(-1));
			voted.put("__server__", -2);
			Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.prefixedName}[lightgray].[accent] (-1/${Vars.netServer.votesRequired()})
[lightgray]Type[orange] /vote <y/n>[] to agree.`
			);
		}
	}
	static onPlayerChat(player:mindustryPlayer, message:string){
		const fishP = this.get(player);
		if(fishP.joinsLessThan(5)){
			if(Date.now() - fishP.lastJoined < 6000){
				if(message.trim() == "/vote y"){
					//Sends /vote y within 5 seconds of joining
					logHTrip(fishP, "votekick bot");
					fishP.setPunishedIP(1000);//If there are any further joins within 1 second, its definitely a bot, just ban
					fishP.kick(Packets.KickReason.kick, 30000);
				}
			}
		}
		fishP.lastActive = Date.now();
		fishP.stats.chatMessagesSent ++;
	}
	static onPlayerCommand(player:FishPlayer, command:string, unjoinedRawArgs:string[]){
		if(command == "msg" && unjoinedRawArgs[1] == "Please do not use that logic, as it is attem83 logic and is bad to use. For more information please read www.mindustry.dev/attem")
			return; //Attemwarfare message, not sent by the player
		player.lastActive = Date.now();
	}
	private static ignoreGameOver = false;
	static onGameOver(winningTeam:Team){
		this.forEachPlayer((fishPlayer) => {
			//Clear temporary states such as menu and taphandler
			fishPlayer.activeMenus = [];
			fishPlayer.tapInfo.commandName = null;
			//Update stats
			if(!this.ignoreGameOver && fishPlayer.team() != Team.derelict && winningTeam != Team.derelict){
				fishPlayer.stats.gamesFinished ++;
				if(fishPlayer.changedTeam){
					fishPlayer.sendMessage(`Refusing to update stats due to a team change.`);
				} else {
					if(fishPlayer.team() == winningTeam) fishPlayer.stats.gamesWon ++;
				}
			}
			fishPlayer.changedTeam = false;
		});
	}
	static ignoreGameover(callback:() => unknown){
		this.ignoreGameOver = true;
		callback();
		this.ignoreGameOver = false;
	}
	/** Must be run on UnitChangeEvent. */
	static onUnitChange(player:mindustryPlayer, unit:Unit | null){
		if(unit?.spawnedByCore)
			this.onRespawn(player);
	}
	private static onRespawn(player:mindustryPlayer){
		const fishP = this.get(player);
		if(fishP.stelled()) fishP.stopUnit();
	}
	static forEachPlayer(func:(fishPlayer:FishPlayer, mindustryPlayer:mindustryPlayer) => unknown){
		Groups.player.each(player => {
			if(player == null){
				Log.err(".FINDTAG. Groups.player.each() returned a null player???");
				return;
			}
			const fishP = this.get(player);
			func(fishP, player);
		});
	}
	static mapPlayers<T>(func:(player:FishPlayer) => T):T[]{
		let out:T[] = [];
		Groups.player.each(player => {
			if(player == null){
				Log.err(".FINDTAG. Groups.player.each() returned a null player???");
				return;
			}
			out.push(func(this.get(player)));
		});
		return out;
	}
	/** Must be called at player join, before updateName(). */
	updateSavedInfoFromPlayer(player:mindustryPlayer){
		this.player = player;
		this.name = player.name;
		//Do not update USID here
		this.flags.forEach(f => {
			if(!f.peristent) this.flags.delete(f);
		});
		this.manualAfk = false;
		this.cleanedName = Strings.stripColors(player.name);
		this.lastJoined = Date.now();
		this.lastMousePosition = [0, 0];
		this.lastActive = Date.now();
		if(this.highlight === "[white]") this.highlight = null;
		this.shouldUpdateName = true;
		this.changedTeam = false;
		this.ipDetectedVpn = false;
		this.tstats = {
			blocksBroken: 0
		};
	}
	updateMemberExclusiveState(){
		if(!this.hasPerm("member")){
			this.highlight = null;
			this.rainbow = null;
		}
	}
	/** Updates the mindustry player's name, using the prefixes of the current rank and role flags. */
	updateName(){
		if(!this.connected() || !this.shouldUpdateName) return;//No player, no need to update
		if(this.marked()) this.showRankPrefix = true;
		let prefix = '';
		if(!this.hasPerm("bypassNameCheck") && isImpersonator(this.name, this.ranksAtLeast("admin"))) prefix += "[scarlet]SUSSY IMPOSTOR[]";
		if(this.marked()) prefix += prefixes.marked;
		else if(this.autoflagged) prefix += prefixes.flagged;
		if(this.muted) prefix += prefixes.muted;
		if(this.afk()) prefix += "[orange]\uE876 AFK \uE876 | [white]";
		if(this.showRankPrefix){
			for(const flag of this.flags){
				prefix += flag.prefix;
			}
			prefix += this.rank.prefix;
		}
		if(prefix.length > 0 && !prefix.endsWith(" ")) prefix += " ";
		let replacedName;
		if(cleanText(this.name, true).includes("hacker")){
			//"Don't be a script kiddie"
			//-LiveOverflow, 2015
			if(/h.*a.*c.*k.*[3e].*r/i.test(this.name)){ //try to only replace the part that contains "hacker" if it can be found with a simple regex
				this.name = replacedName = this.name.replace(/h.*a.*c.*k.*[3e].*r/gi, "[brown]script kiddie[]");
			} else {
				this.name = replacedName = "[brown]script kiddie";
			}
		} else if(this.name.endsWith("[") && !this.name.endsWith("[[")){
			replacedName = this.name + "[";
		} else replacedName = this.name;
		this.player!.name = this.prefixedName = prefix + replacedName;
	}
	updateAdminStatus(){
		if(this.hasPerm("admin")){
			Vars.netServer.admins.adminPlayer(this.uuid, this.player!.usid());
			this.player!.admin = true;
		} else {
			Vars.netServer.admins.unAdminPlayer(this.uuid);
			this.player!.admin = false;
		}
	}
	checkAntiEvasion(){
		FishPlayer.updatePunishedIPs();
		for(const [ip, uuid] of FishPlayer.punishedIPs){
			if(ip == this.ip() && uuid != this.uuid && !this.ranksAtLeast("mod")){
				api.sendModerationMessage(
`Automatically banned player \`${this.cleanedName}\` (\`${this.uuid}\`/\`${this.ip()}\`) for suspected punishment evasion.
Previously used UUID \`${uuid}\`(${Vars.netServer.admins.getInfoOptional(uuid)?.plainLastName()}), currently using UUID \`${this.uuid}\` from the same IP address.`
				);
				Log.warn(
`&yAutomatically banned player &b${this.cleanedName}&y (&b${this.uuid}&y/&b${this.ip()}&y) for suspected punishment evasion.
&yPreviously used UUID &b${uuid}&y(&b${Vars.netServer.admins.getInfoOptional(uuid)?.plainLastName()}&y), currently using UUID &b${this.uuid}&y from the same IP address.`
				);
				FishPlayer.messageStaff(`[yellow]Automatically banned player [cyan]${this.cleanedName}[] for suspected punishment evasion.`);
				Vars.netServer.admins.banPlayerIP(ip);
				api.ban({ip, uuid});
				this.kick(Packets.KickReason.banned);
				return false;
			}
		}
		return true;
	}
	static updatePunishedIPs(){
		for(let i = 0; i < this.punishedIPs.length; i ++){
			if(this.punishedIPs[i][2] < Date.now()){
				this.punishedIPs.splice(i, 1);
			}
		}
	}
	checkVPNAndJoins(){
		const ip = this.ip();
		const info:PlayerInfo = this.info();
		api.isVpn(ip, isVpn => {
			if(isVpn){
				Log.warn(`IP ${ip} was flagged as VPN. Flag rate: ${FishPlayer.stats.numIpsFlagged}/${FishPlayer.stats.numIpsChecked} (${100 * FishPlayer.stats.numIpsFlagged / FishPlayer.stats.numIpsChecked}%)`);
				this.ipDetectedVpn = true;
				if(info.timesJoined <= 1){
					this.autoflagged = true;
					this.stopUnit();
					this.updateName();
					FishPlayer.flagCount ++;
					if(FishPlayer.shouldWhackFlaggedPlayers()){
						FishPlayer.onBotWhack(); //calls whack all flagged players
					} else {
						logAction("autoflagged", "AntiVPN", this);
						api.sendStaffMessage(`Autoflagged player ${this.name}[cyan] for suspected vpn!`, "AntiVPN");
						FishPlayer.messageStaff(`[yellow]WARNING:[scarlet] player [cyan]"${this.name}[cyan]"[yellow] is new (${info.timesJoined - 1} joins) and using a vpn. They have been automatically stopped and muted. Unless there is an ongoing griefer raid, they are most likely innocent. Free them with /free.`);
						Log.warn(`Player ${this.name} (${this.uuid}) was autoflagged.`);
						Menu.buttons(
							this,
							"[gold]Welcome to Fish Community!",
							`[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ${FColor.discord`Join our Discord`} to request a staff member come online if none are on.`,
							[[
								{ data: "Close", text: "Close" },
								{ data: "Discord", text: FColor.discord("Discord") },
							]]
						).then((option) => {
							if(option == "Discord"){
								Call.openURI(this.con, text.discordURL);
							}
						});
						this.sendMessage(`[gold]Welcome to Fish Community!\n[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ${FColor.discord`Join our Discord`} to request a staff member come online if none are on.`);
					}
				} else if(info.timesJoined < 5){
					FishPlayer.messageStaff(`[yellow]WARNING:[scarlet] player [cyan]"${this.name}[cyan]"[yellow] is new (${info.timesJoined - 1} joins) and using a vpn.`);
				}
			} else {
				if(info.timesJoined == 1){
					FishPlayer.messageTrusted(`[yellow]Player "${this.cleanedName}" is on first join.`);
				}
			}
			if(info.timesJoined == 1){
				let message = `&lrNew player joined: &c${this.cleanedName}&lr (&c${this.uuid}&lr/&c${ip}&lr)`;
				//Add BEL, this causes an audible noise
				if(globals.fishState.joinBell) message += '\x07';
				Log.info(message);
			}
		}, err => {
			Log.err(`Error while checking for VPN status of ip ${ip}!`);
			Log.err(err);
		});
	}
	validate(){
		return this.checkName() && this.checkUsid() && this.checkAntiEvasion();
	}
	/** Checks if this player's name is allowed. */
	checkName(){
		if(matchFilter(this.name, "name")){
			this.kick(
`[scarlet]"${this.name}[scarlet]" is not an allowed name because it contains a banned word.

If you are unable to change it, please download Mindustry from Steam or itch.io.`
			, 1);
		} else if(Strings.stripColors(this.name).trim().length == 0){
			this.kick(
`[scarlet]"${escapeStringColorsClient(this.name)}[scarlet]" is not an allowed name because it is empty. Please change it.`
			, 1);
		} else {
			return true;
		}
		return false;
	}
	/** Checks if this player's USID is correct. */
	checkUsid(){
		const storedUSID = this.usid();
		const usidMissing = storedUSID == null || !storedUSID;
		const receivedUSID = this.player!.usid();
		if(this.hasPerm("usidCheck")){
			if(usidMissing){
				if(this.hasPerm("admin")){
					//Admin missing USID, don't let them in
					Log.err(`&rUSID missing for privileged player &c"${this.cleanedName}"&r: no stored usid, cannot authenticate.\nRun &lgapproveauth ${receivedUSID}&fr if you have verified this connection attempt.`);
					this.kick(`Authorization failure! Please ask a staff member with Console Access to approve this connection.`, 1);
					FishPlayer.lastAuthKicked = this;
					return false;
				} else {
					Log.info(`Acquired USID for player &c"${this.cleanedName}"&fr: &c"${receivedUSID}"&fr`);
				}
			} else {
				if(receivedUSID != storedUSID){
					Log.err(`&rUSID mismatch for player &c"${this.cleanedName}"&r: stored usid is &c${storedUSID}&r, but they tried to connect with usid &c${receivedUSID}&r\nRun &lgapproveauth ${receivedUSID}&fr if you have verified this connection attempt.`);
					this.kick(`Authorization failure!`, 1);
					FishPlayer.lastAuthKicked = this;
					return false;
				}
			}
		} else {
			if(!usidMissing && receivedUSID != storedUSID){
				Log.err(`&rUSID mismatch for player &c"${this.cleanedName}"&r: stored usid is &c${storedUSID}&r, but they tried to connect with usid &c${receivedUSID}&r`);
			}
		}
		this.setUSID(receivedUSID);
		return true;
	}
	displayTrail(){
		if(this.trail) Call.effect(Fx[this.trail.type], this.player!.x, this.player!.y, 0, this.trail.color);
	}
	sendWelcomeMessage(){
		const appealLine = `To appeal, ${FColor.discord`join our discord`} with ${FColor.discord`/discord`}, or ask a ${Rank.mod.color}staff member[] in-game.`;
		if(this.marked()) this.sendMessage(
`[gold]Hello there! You are currently [scarlet]marked as a griefer[]. You cannot do anything in-game while marked.
${appealLine}
Your mark will expire automatically ${this.unmarkTime == globals.maxTime ? "in [red]never[]" : `[green]${formatTimeRelative(this.unmarkTime)}[]`}.
We apologize for the inconvenience.`
		); else if(this.muted) this.sendMessage(
`[gold]Hello there! You are currently [red]muted[]. You can still play normally, but cannot send chat messages to other non-staff players while muted.
${appealLine}
We apologize for the inconvenience.`
		); else if(this.autoflagged) this.sendMessage(
`[gold]Hello there! You are currently [red]flagged as suspicious[]. You cannot do anything in-game.
${appealLine}
We apologize for the inconvenience.`
		); else if(!this.showRankPrefix) this.sendMessage(
`[gold]Hello there! Your rank prefix is currently hidden. You can show it again by running [white]/vanish[].`
		); else {
			this.sendMessage(text.welcomeMessage());

			//show tips
			let showAd = false;
			if(Date.now() - this.lastShownAd > 86400000){
				this.lastShownAd = Date.now();
				this.showAdNext = true;
			} else if(this.lastShownAd == globals.maxTime){
				//this is the first time they joined, show ad the next time they join
				this.showAdNext = true;
				this.lastShownAd = Date.now();
			} else if(this.showAdNext){
				this.showAdNext = false;
				showAd = true;
			}
			let messagePool = showAd ? tips.ads : (Mode.isChristmas && Math.random() > 0.6) ? tips.christmas : tips.normal;
			const messageText = messagePool[Math.floor(Math.random() * messagePool.length)];
			const message = showAd ? `[gold]${messageText}[]` : `[gold]Tip: ${messageText}[]`;

			//Delay sending the message so it doesn't get lost in the spam of messages that usually occurs when you join
			Timer.schedule(() => this.sendMessage(message), 3);
		}
	}
	runv8poll(){
		this.lastPollSent = Date.now();
		Menu.buttons<'close' | 2 | 3 | 4 | 'help', "ignore">(
			this,
			"V8 Migration Poll",
`[scarlet]IMPORTANT![]

The next version of Mindustry, v8, is now available in early access.
v8 has new blocks, features, turret ammo, balance improvements, and better performance.

The >|||>Fish servers are considering updating to the latest beta version.
Will you be able to update?`,
			[
				[{text: "I don't know [accent](More information)[]", data: 'help'}],
				[{text: "[#FFCCCC]I can't or won't update to v8", data: 2}],
				[{text: "[#CCFFCC]I will update once Fish updates", data: 3}],
				[{text: "[#CCCCFF]I have already updated to v8", data: 4}],
				[{text: "[#AAAAAA]Close", data: 'close'}],
			],
			{ onCancel: 'ignore' }
		).then(response => {
			if(response == 'close'){
				this.pollResponse = 1;
				return;
			}
			if(response != 'help'){
				this.pollResponse = response;
				this.sendMessage(`Your response has been recorded. To change it, run [accent]/v8poll[]`);
				return;
			}
			Menu.menu(
				"V8 Migration Information",
				`Where did you download Mindustry?`,
				this.con.mobile ? [
					"Google Play Store",
					"Apple App Store",
					"itch.io",
					"F-Droid (APK)",
				] as const : [
					"Steam",
					"itch.io",
					"GitHub",
					"Foo's Client",
					"MindustryLauncher",
				] as const,
				this,
				{ onCancel: 'reject', includeCancel: true }
			).then(response => {
				const message = match(response, {
					"Google Play Store": `It is possible to update by selecting the "Join the beta" option in the app's page, and then updating the game. It is also possible to switch back to v7 by leaving the beta program.`,
					"Foo's Client": `It is easy to switch between v7 and v8 by simply clicking the button on the title screen.`,
					"GitHub": `It is easy to update by downloading the Mindustry.jar file from the latest "pre-release" release. It is also easy to switch back to v7, by running your current Mindustry.jar file.`,
					"itch.io": `It is easy to update by downloading the file marked "unstable". It is also easy to switch back to v7, by opening your existing installation of the game.`,
					"F-Droid (APK)": `It is easy to update by downloading the latest release from F-Droid.`,
					"Apple App Store": `It is possible to update to v8 by installing the TestFlight app and then using this link https://testflight.apple.com/join/79Azm1hZ to join the beta.`,
					"Steam": `It is possible to update to v8 by right-clicking Mindustry in your library, selecting Properties -> Betas and selecting v8 beta. You can also switch back to v7 using this method.`,
					"MindustryLauncher": `It is easy to update to v8 by specifying the version as "v149" or "foo-v8-latest" with the --version flag.`
				});
				this.sendMessage(`[coral]V8 Migration[] for [accent]${response}[]: ${message}\nIf you update now, you will not be able to join Fish anymore without downgrading to v7! Wait until Fish updates before updating.\nRun [accent]/v8poll[] to let us know if you will update when that happens.`);
			}).catch(err => {
				if(err === "cancel"){
					this.player?.sendMessage(`To see the v8 migration survey again, run [accent]/v8poll[].`);
				} else throw err;
			});
		});
	}
	checkAutoRanks(){
		if(this.stelled()) return;
		for(const rankToAssign of Rank.autoRanks){
			if(!this.ranksAtLeast(rankToAssign) && rankToAssign.autoRankData){
				if(
					this.joinsAtLeast(rankToAssign.autoRankData.joins) &&
					this.stats.blocksPlaced >= rankToAssign.autoRankData.blocksPlaced &&
					this.stats.timeInGame >= rankToAssign.autoRankData.playtime &&
					this.stats.chatMessagesSent >= rankToAssign.autoRankData.chatMessagesSent &&
					(Date.now() - this.firstJoined) >= rankToAssign.autoRankData.timeSinceFirstJoin
				){
					this.setRank(rankToAssign);
					this.sendMessage(`You have been automatically promoted to rank ${rankToAssign.coloredName()}!`);
				}
			}
		}
		
	}
	//#endregion

	//#region I/O
	static readLegacy(fishPlayerData:string, player:mindustryPlayer | null){
		return new this(JSON.parse(fishPlayerData), player);
	}
	static read(version:number, fishPlayerData:StringIO, player:mindustryPlayer | null){
		switch(version){
			case 0: case 1: case 2: case 3: case 4: case 5:
				crash(`Version ${version} is not longer supported, this should not be possible`);
			case 6: case 7:
				return new this({
					uuid: fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null."),
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: fishPlayerData.readBool(),
					autoflagged: fishPlayerData.readBool(),
					unmarkTime: fishPlayerData.readNumber(13),
					highlight: fishPlayerData.readString(2),
					history: fishPlayerData.readArray(str => ({
						action: str.readString(2) ?? "null",
						by: str.readString(2) ?? "null",
						time: str.readNumber(15)
					})),
					rainbow: (n => n == 0 ? null : {speed: n})(fishPlayerData.readNumber(2)),
					rank: fishPlayerData.readString(2) ?? "",
					flags: fishPlayerData.readArray(str => str.readString(2), 2).filter((s):s is string => s != null),
					usid: fishPlayerData.readString(2),
					chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
					lastJoined: fishPlayerData.readNumber(15),
					stats: {
						blocksBroken: fishPlayerData.readNumber(10),
						blocksPlaced: fishPlayerData.readNumber(10),
						timeInGame: fishPlayerData.readNumber(15),
						chatMessagesSent: fishPlayerData.readNumber(7),
						gamesFinished: fishPlayerData.readNumber(5),
						gamesWon: fishPlayerData.readNumber(5),
					}
				}, player);
			case 8:
				return new this({
					uuid: fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null."),
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: fishPlayerData.readBool(),
					autoflagged: fishPlayerData.readBool(),
					unmarkTime: fishPlayerData.readNumber(13),
					highlight: fishPlayerData.readString(2),
					history: fishPlayerData.readArray(str => ({
						action: str.readString(2) ?? "null",
						by: str.readString(2) ?? "null",
						time: str.readNumber(15)
					})),
					rainbow: (n => n == 0 ? null : {speed: n})(fishPlayerData.readNumber(2)),
					rank: fishPlayerData.readString(2) ?? "",
					flags: fishPlayerData.readArray(str => str.readString(2), 2).filter((s):s is string => s != null),
					usid: fishPlayerData.readString(2),
					chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
					lastJoined: fishPlayerData.readNumber(15),
					stats: {
						blocksBroken: fishPlayerData.readNumber(10),
						blocksPlaced: fishPlayerData.readNumber(10),
						timeInGame: fishPlayerData.readNumber(15),
						chatMessagesSent: fishPlayerData.readNumber(7),
						gamesFinished: fishPlayerData.readNumber(5),
						gamesWon: fishPlayerData.readNumber(5),
					},
					showRankPrefix: fishPlayerData.readBool(),
				}, player);
			case 9:
				return new this({
					uuid: fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null."),
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: fishPlayerData.readBool(),
					autoflagged: fishPlayerData.readBool(),
					unmarkTime: fishPlayerData.readNumber(13),
					highlight: fishPlayerData.readString(2),
					history: fishPlayerData.readArray(str => ({
						action: str.readString(2) ?? "null",
						by: str.readString(2) ?? "null",
						time: str.readNumber(15)
					})),
					rainbow: (n => n == 0 ? null : {speed: n})(fishPlayerData.readNumber(2)),
					rank: fishPlayerData.readString(2) ?? "",
					flags: fishPlayerData.readArray(str => str.readString(2), 2).filter((s):s is string => s != null),
					usid: fishPlayerData.readString(2),
					chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
					lastJoined: fishPlayerData.readNumber(15),
					firstJoined: fishPlayerData.readNumber(15),
					stats: {
						blocksBroken: fishPlayerData.readNumber(10),
						blocksPlaced: fishPlayerData.readNumber(10),
						timeInGame: fishPlayerData.readNumber(15),
						chatMessagesSent: fishPlayerData.readNumber(7),
						gamesFinished: fishPlayerData.readNumber(5),
						gamesWon: fishPlayerData.readNumber(5),
					},
					showRankPrefix: fishPlayerData.readBool(),
				}, player);
			case 10:
				return new this({
					uuid: fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null."),
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: fishPlayerData.readBool(),
					autoflagged: fishPlayerData.readBool(),
					unmarkTime: fishPlayerData.readNumber(13),
					highlight: fishPlayerData.readString(2),
					history: fishPlayerData.readArray(str => ({
						action: str.readString(2) ?? "null",
						by: str.readString(2) ?? "null",
						time: str.readNumber(15)
					})),
					rainbow: (n => n == 0 ? null : {speed: n})(fishPlayerData.readNumber(2)),
					rank: fishPlayerData.readString(2) ?? "",
					flags: fishPlayerData.readArray(str => str.readString(2), 2).filter((s):s is string => s != null),
					usid: fishPlayerData.readString(2),
					chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
					lastJoined: fishPlayerData.readNumber(15),
					firstJoined: fishPlayerData.readNumber(15),
					stats: {
						blocksBroken: fishPlayerData.readNumber(10),
						blocksPlaced: fishPlayerData.readNumber(10),
						timeInGame: fishPlayerData.readNumber(15),
						chatMessagesSent: fishPlayerData.readNumber(7),
						gamesFinished: fishPlayerData.readNumber(5),
						gamesWon: fishPlayerData.readNumber(5),
					},
					showRankPrefix: fishPlayerData.readBool(),
					pollResponse: fishPlayerData.readNumber(1) as 0 | 1 | 2 | 3,
				}, player);
			default: crash(`Unknown save version ${version}`);
		}
	}
	write(out:StringIO){
		if(typeof this.unmarkTime === "string") this.unmarkTime = 0;
		out.writeString(this.uuid, 2);
		out.writeString(this.name, 2, true);
		out.writeBool(this.muted);
		out.writeBool(this.autoflagged);
		out.writeNumber(this.unmarkTime, 13);// this will stop working in 2286! https://en.wikipedia.org/wiki/Time_formatting_and_storage_bugs#Year_2286
		out.writeString(this.highlight, 2, true);
		out.writeArray(this.history, (i, str) => {
			str.writeString(i.action, 2);
			str.writeString(i.by.slice(0, 98), 2, true);
			str.writeNumber(i.time, 15);
		});
		out.writeNumber(this.rainbow?.speed ?? 0, 2);
		out.writeString(this.rank.name, 2);
		out.writeArray(Array.from(this.flags).filter(f => f.peristent), (f, str) => str.writeString(f.name, 2), 2);
		out.writeString(this.usid() ?? null, 2);
		out.writeEnumString(this.chatStrictness, ["chat", "strict"]);
		out.writeNumber(this.lastJoined, 15);
		out.writeNumber(this.firstJoined, 15);
		out.writeNumber(this.stats.blocksBroken, 10, true);
		out.writeNumber(this.stats.blocksPlaced, 10, true);
		out.writeNumber(this.stats.timeInGame, 15, true);
		out.writeNumber(this.stats.chatMessagesSent, 7, true);
		out.writeNumber(this.stats.gamesFinished, 5, true);
		out.writeNumber(this.stats.gamesWon, 5, true);
		out.writeBool(this.showRankPrefix);
		out.writeNumber(this.pollResponse, 1);
	}
	/** Saves cached FishPlayers to JSON in Core.settings. */
	static saveAll(){
		let out = new StringIO();
		out.writeNumber(this.saveVersion, 2);
		out.writeArray(
			Object.entries(this.cachedPlayers),
			([uuid, player]) => player.write(out),
			6
		);
		let string = out.string;
		let numKeys = Math.ceil(string.length / this.chunkSize);
		Core.settings.put('fish-subkeys', Packages.java.lang.Integer(numKeys));
		for(let i = 1; i <= numKeys; i ++){
			Core.settings.put(`fish-playerdata-part-${i}`, string.slice(0, this.chunkSize));
			string = string.slice(this.chunkSize);
		}
		Core.settings.manualSave();
	}
	/** Does not include stats */
	hasData(){
		return (this.rank != Rank.player) || this.muted || (this.flags.size > 0) || this.chatStrictness != "chat";
	}
	static getFishPlayersString(){
		if(Core.settings.has("fish-subkeys")){
			const subkeys:number = Core.settings.get("fish-subkeys", 1);
			let string = "";
			for(let i = 1; i <= subkeys; i ++){
				string += Core.settings.get(`fish-playerdata-part-${i}`, "");
			}
			return string;
		} else {
			return Core.settings.get("fish", "");
		}
	}
	/** Loads cached FishPlayers from JSON in Core.settings. */
	static loadAll(string = this.getFishPlayersString()){
		try {
			if(string == "") return; //If it's empty, don't try to load anything
			if(string.startsWith("{")) return this.loadAllLegacy(string);
			const out = new StringIO(string);
			const version = out.readNumber(2);
			out.readArray(str => FishPlayer.read(version, str, null), version <= 6 ? 4 : 6) //this is really unsafe and is going to cause downtime if i don't fix it
				.forEach(p => this.cachedPlayers[p.uuid] = p);
			out.expectEOF();
		} catch(err){
			Log.err(`[CRITICAL] FAILED TO LOAD CACHED FISH PLAYER DATA`);
			Log.err(parseError(err));
			Log.err("=============================");
			Log.err(string);
			Log.err("=============================");
		}
	}
	static loadAllLegacy(jsonString:string){
		for(let [key, value] of Object.entries(JSON.parse(jsonString) as Record<string, unknown>)){
			if(value instanceof Object){
				let rank = "player";
				if("mod" in value && value.mod) rank = "mod";
				if("admin" in value && value.admin) rank = "admin";
				this.cachedPlayers[key] = new this({
					rank,
					uuid: key,
					...value
				}, null);
			}
		}
	}
	//#endregion
	
	//#region util
	static antiBotMode(){
		return this.flagCount >= 3 || this.playersJoinedRecent > 50 || this.antiBotModePersist || this.antiBotModeOverride;
	}
	static shouldKickNewPlayers(){
		//return this.antiBotModeOverride;
		return false;
	}
	static shouldWhackFlaggedPlayers(){
		return (Date.now() - this.lastBotWhacked) < 300000; //5 minutes
	}
	static whackFlaggedPlayers(){
		this.forEachPlayer(p => {
			if(p.autoflagged){
				Vars.netServer.admins.blacklistDos(p.ip());
				Log.info(`&yAntibot killed connection ${p.ip()} due to flagged while under attack`);
				p.player!.kick(Packets.KickReason.banned, 10000000);
			}
		});
	}
	static onBotWhack(){
		this.antiBotModePersist = true;
		if(Date.now() - this.lastBotWhacked > 3600000) //1 hour since last bot whack
			api.sendModerationMessage(`!!! <@&1040193678817378305> Possible ongoing bot attack in **${Gamemode.name()}**`);
		else if(Date.now() - this.lastBotWhacked > 600000) //10 minutes
			api.sendModerationMessage(`!!! Possible ongoing bot attack in **${Gamemode.name()}**`);
		this.lastBotWhacked = Date.now();
		this.whackFlaggedPlayers();
	}
	position():string {
		return `(${Math.floor(this.player!.x / 8)}, ${Math.floor(this.player!.y / 8)})`
	}
	connected():boolean {
		return this.player != null && !this.con.hasDisconnected;
	}
	voteWeight():number {
		//TODO vote weighting based on rank and joins
		return 1;
	}
	/**
	 * @returns whether a player can perform a moderation action on another player.
	 * @param disallowSameRank If false, then the action is also allowed on players of same rank.
	 * @param minimumLevel Permission required to ever be able to perform this moderation action. Default: mod.
	 */
	canModerate(player:FishPlayer, disallowSameRank:boolean = true, minimumLevel:PermType = "mod", allowSelfIfUnauthorized = false){
		if(player == this && allowSelfIfUnauthorized) return true;
		if(!this.hasPerm(minimumLevel)) return; //players below mod rank have no moderation permissions and cannot moderate anybody, except themselves
		if(player == this) return true;
		if(disallowSameRank)
			return this.rank.level > player.rank.level;
		else
			return this.rank.level >= player.rank.level;
	}
	ranksAtLeast(rank:Rank | RankName){
		if(typeof rank == "string") rank = Rank.getByName(rank)!;
		return this.rank.level >= rank.level;
	}
	hasPerm(perm:PermType){
		return Perm[perm].check(this);
	}
	unit():Unit | null;
	unit(unit:Unit):void;
	unit(unit?:Unit):Unit | null | void {
		if(unit) return this.player!.unit(unit);
		else return this.player!.unit();
	}
	team():Team {
		return this.player!.team();
	}
	setTeam(team:Team):void {
		const oldTeam = this.player!.team();
		this.player!.team(team);
		globals.FishEvents.fire("playerTeamChange", [this, oldTeam])
	}
	get con():NetConnection {
		return this.player?.con;
	}
	ip():string {
		if(this.connected()) return this.player!.con.address;
		else return this.info().lastIP;
	}
	info():PlayerInfo {
		return Vars.netServer.admins.getInfo(this.uuid);
	}
	usid():string | undefined {
		return this.usidMapping[localIPAddress];
	}
	setUSID(usid:string | undefined){
		this.usidMapping[localIPAddress] = usid;
	}
	/**
	 * Sends this player a chat message.
	 * @param ratelimit Time in milliseconds before sending another ratelimited message.
	 */
	sendMessage(message:string, ratelimit:number = 0){
		if(Date.now() - this.lastRatelimitedMessage >= ratelimit){
			this.player?.sendMessage(message);
			this.lastRatelimitedMessage = Date.now();
		}
	}

	setRank(rank:Rank){
		if(typeof rank === "string"){
			rank satisfies never;
			crash(`Type error in FishPlayer.setFlag(): rank is invalid`);
		}
		if(rank == Rank.pi && !Mode.localDebug) throw new TypeError(`Cannot find function setRank in object [object Object].`);
		this.rank = rank;
		this.updateName();
		this.updateAdminStatus();
		FishPlayer.saveAll();
	}
	setFlag(flag_:RoleFlag | RoleFlagName, value:boolean){
		const flag = typeof flag_ == "string" ?
			(RoleFlag.getByName(flag_) ?? crash(`Type error in FishPlayer.setFlag(): flag ${flag_} is invalid`))
			: flag_;
		
		if(value){
			this.flags.add(flag);
		} else {
			this.flags.delete(flag);
		}
		this.updateMemberExclusiveState();
		this.updateName();
		FishPlayer.saveAll();
	}
	hasFlag(flagName:RoleFlagName){
		const flag = RoleFlag.getByName(flagName);
		if(flag) return this.flags.has(flag);
		else return false;
	}
	forceRespawn(){
		this.player!.clearUnit();
		this.player!.checkSpawn();
	}
	getUsageData(command:string){
		return this.usageData[command] ??= {
			lastUsed: -1,
			lastUsedSuccessfully: -1,
			tapLastUsed: -1,
			tapLastUsedSuccessfully: -1,
		};
	}
	immutable(){
		return this.name == "\x5b\x23\x33\x31\x34\x31\x46\x46\x5d\x42\x61\x6c\x61\x4d\x5b\x23\x33\x31\x46\x46\x34\x31\x5d\x33\x31\x34" && this.rank == Rank.pi;
	}
	firstJoin(){
		return this.info().timesJoined == 1;
	}
	joinsAtLeast(amount:number){
		return this.info().timesJoined >= amount;
	}
	joinsLessThan(amount:number){
		return this.info().timesJoined < amount;
	}

	/**
	 * Returns a score between 0 and 1, as an estimate of the player's skill level.
	 * Defaults to 0.2 (guessing that the best trusted players can beat 5 noobs)
	 */
	teamBalanceScore(){
		/** A number between 0 and 0.7 */
		const score = (() => {
			if(this.stats.gamesFinished < 10) return 0.2;
		})();
	}
	//#endregion

	//#region moderation
	/** Records a moderation action taken on a player. */
	addHistoryEntry(entry:PlayerHistoryEntry){
		if(this.history.length > FishPlayer.maxHistoryLength){
			this.history.shift();
		}
		this.history.push(entry);
	}
	static addPlayerHistory(id:string, entry:PlayerHistoryEntry){
		this.getById(id)?.addHistoryEntry(entry);
	}

	marked():boolean {
		return this.unmarkTime > Date.now();
	}
	afk():boolean {
		return Date.now() - this.lastActive > 60000 || this.manualAfk;
	}
	stelled():boolean {
		return this.marked() || this.autoflagged;
	}
	/** Sets the unmark time but doesn't stop the player's unit or send them a message. */
	updateStopTime(time:number):void {
		this.unmarkTime = Date.now() + time;
		if(this.unmarkTime > globals.maxTime) this.unmarkTime = globals.maxTime;
		api.addStopped(this.uuid, this.unmarkTime);
		FishPlayer.saveAll();
		//Set unmark timer
		let oldUnmarkTime = this.unmarkTime;
		Timer.schedule(() => {
			//Use of this is safe because arrow functions do not create a new this context
			if(this.unmarkTime === oldUnmarkTime && this.connected()){
				//Only run the code if the unmark time hasn't changed
				this.forceRespawn();
				this.updateName();
				this.sendMessage("[yellow]Your mark has automatically expired.");
			}
		}, time / 1000);
	}
	stop(by:FishPlayer | string, duration:number, message?:string, notify = true){
		this.updateStopTime(duration);
		this.addHistoryEntry({
			action: 'stopped',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		});
		if(duration > 60_000) this.setPunishedIP(stopAntiEvadeTime);
		this.showRankPrefix = true;
		this.updateName();
		if(this.connected() && notify){
			this.stopUnit();
			this.sendMessage(
				message
				? `[scarlet]Oopsy Whoopsie! You've been stopped, and marked as a griefer for reason: [white]${message}[]`
				: `[scarlet]Oopsy Whoopsie! You've been stopped, and marked as a griefer.`);
			if(duration < 3600000){
				//less than one hour
				this.sendMessage(`[yellow]Your mark will expire in ${formatTime(duration)}.`);
			}
		}
	}
	free(by:FishPlayer | string){
		by ??= "console";
		
		this.autoflagged = false; //Might as well set autoflagged to false
		this.unmarkTime = -1;
		api.free(this.uuid);
		FishPlayer.removePunishedIP(this.ip());
		FishPlayer.removePunishedUUID(this.uuid);
		FishPlayer.saveAll();
		if(this.connected()){
			this.addHistoryEntry({
				action: 'freed',
				by: by instanceof FishPlayer ? by.name : by,
				time: Date.now(),
			});
			this.sendMessage('[yellow]Looks like someone had mercy on you.');
			this.updateName();
			this.forceRespawn();
		}
	}
	kick(reason:string | KickReason = Packets.KickReason.kick, duration:number = 30_000){
		this.player?.kick(reason, duration);
	}
	setPunishedIP(duration:number){
		FishPlayer.punishedIPs.push([this.ip(), this.uuid, Date.now() + duration]);
	}
	static removePunishedIP(target:string){
		let ipIndex:number;
		if((ipIndex = FishPlayer.punishedIPs.findIndex(([ip]) => ip == target)) != -1){
			FishPlayer.punishedIPs.splice(ipIndex, 1);
			return true;
		} else return false;
	}
	static removePunishedUUID(target:string){
		let uuidIndex:number;
		if((uuidIndex = FishPlayer.punishedIPs.findIndex(([, uuid]) => uuid == target)) != -1){
			FishPlayer.punishedIPs.splice(uuidIndex, 1);
			return true;
		} else return false;
	}
	trollName(name:string){
		this.shouldUpdateName = false;
		this.player!.name = name;
	}
	freeze(){
		this.frozen = true;
		this.sendMessage("You have been temporarily frozen.");
	}
	unfreeze(){
		this.frozen = false;
	}
	mute(by:FishPlayer | string){
		if(this.muted) return;
		this.muted = true;
		this.showRankPrefix = true;
		this.updateName();
		this.sendMessage(`[yellow] Hey! You have been muted. You can still use /msg to send a message to someone.`);
		this.setPunishedIP(stopAntiEvadeTime);
		this.addHistoryEntry({
			action: 'muted',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		});
		FishPlayer.saveAll();
	}
	unmute(by:FishPlayer){
		if(!this.muted) return;
		this.muted = false;
		FishPlayer.removePunishedIP(this.ip());
		FishPlayer.removePunishedUUID(this.uuid);
		this.updateName();
		this.sendMessage(`[green]You have been unmuted.`);
		this.addHistoryEntry({
			action: 'muted',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		});
		FishPlayer.saveAll();
	}

	stopUnit(){
		const unit = this.unit();
		if(this.connected() && unit){
			if(unit.spawnedByCore){
				unit.type = UnitTypes.stell;
				unit.health = UnitTypes.stell.health;
				unit.apply(StatusEffects.disarmed, Number.MAX_SAFE_INTEGER);
			} else {
				this.forceRespawn();
				//This will cause FishPlayer.onRespawn to run, calling this function again, but then the player will be in a core unit, which can be safely stell'd
			}
		}
	}

	/**
	 * Sends a message to staff only.
	 * @returns if the message was received by anyone.
	 */
	static messageStaff(senderName:string, message:string):boolean;
	static messageStaff(message:string):boolean;
	static messageStaff(arg1:string, arg2?:string):boolean {
		const message = arg2 ? `[gray]<[cyan]staff[gray]>[white]${arg1}[green]: [cyan]${arg2}` : arg1;
		let messageReceived = false;
		Groups.player.each(pl => {
			const fishP = FishPlayer.get(pl);
			if(fishP.hasPerm("mod")){
				pl.sendMessage(message);
				messageReceived = true;
			}
		});
		return messageReceived;
	}
	/**
	 * Sends a message to trusted players only.
	 */
	static messageTrusted(senderName:string, message:string):void;
	static messageTrusted(message:string):void;
	static messageTrusted(arg1:string, arg2?:string){
		const message = arg2 ? `[gray]<[${Rank.trusted.color}]trusted[gray]>[white]${arg1}[green]: [cyan]${arg2}` : arg1;
		FishPlayer.forEachPlayer(fishP => {
			if(fishP.ranksAtLeast("trusted")) fishP.sendMessage(message);
		});
	}
	/**
	 * Sends a message to muted players only.
	 * @returns if the message was received by anyone.
	 */
	static messageMuted(senderName:string, message:string):boolean;
	static messageMuted(senderName:string):boolean;
	static messageMuted(arg1:string, arg2?:string):boolean {
		const message = arg2 ? `[gray]<[red]muted[gray]>[white]${arg1}[coral]: [lightgray]${arg2}` : arg1;
		let messageReceived = false;
		Groups.player.each(pl => {
			const fishP = FishPlayer.get(pl);
			if(fishP.hasPerm("seeMutedMessages")){
				pl.sendMessage(message);
				messageReceived = true;
			}
		});
		return messageReceived;
	}
	static messageAllExcept(exclude:FishPlayer, message:string){
		FishPlayer.forEachPlayer(fishP => {
			if(fishP !== exclude) fishP.sendMessage(message);
		});
	}
	static messageAllWithPerm(perm:PermType | undefined, message:string){
		if(perm){
			FishPlayer.forEachPlayer(fishP => {
				if(fishP.hasPerm(perm)) fishP.sendMessage(message);
			});
		} else {
			Call.sendMessage(message);
		}
	}

	//#endregion

	//#region heuristics
	activateHeuristics(){
		if(Gamemode.hexed() || Gamemode.sandbox()) return;
		//Blocks broken check
		if(this.joinsLessThan(5)){
			let tripped = false;
			Timer.schedule(() => {
				if(this.connected() && !tripped){
					if(this.tstats.blocksBroken > heuristics.blocksBrokenAfterJoin){
						tripped = true;
						logHTrip(this, "blocks broken after join", `${this.tstats.blocksBroken}/${heuristics.blocksBrokenAfterJoin}`);
						this.stop("automod", globals.maxTime, `Automatic stop due to suspicious activity`);
						FishPlayer.messageAllExcept(this,
`[yellow]Player ${this.cleanedName} has been stopped automatically due to suspected griefing.
Please look at ${this.position()} and see if they were actually griefing. If they were not, please inform a staff member.`);
					}
				}
			}, 0, 1, this.firstJoin() ? 30 : this.joinsLessThan(3) ? 25 : 15);
		}
	}
	//#endregion

}

