/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the FishPlayer class, and many player-related functions.
*/

import type { Achievement } from "/achievements";
import * as api from "/api";
import { FColor, Gamemode, heuristics, Mode, prefixes, rules, stopAntiEvadeTime, text, tips } from "/config";
import { FishCommandArgType, Perm, PermType } from "/frameworks/commands";
import { Menu } from "/frameworks/menus";
import { crash, Duration, escapeStringColorsClient, parseError, search, setToArray, StringIO } from "/funcs";
import * as globals from "/globals";
import { uuidPattern, FishEvents } from "/globals";
import { Rank, RankName, RoleFlag, RoleFlagName } from "/ranks";
import type { FishPlayerData, PlayerHistoryEntry, Stats, UploadedFishPlayerData } from "/types";
import { cleanText, formatTime, formatTimeRelative, isImpersonator, logAction, logHTrip, matchFilter } from "/utils";


export class FishPlayer {
	//#region Static constants
	/** Save version used for serialized FishPlayers. */
	static readonly saveVersion = 12;
	/** Maximum chunk size used when writing FishPlayer data to Core.settings. */
	static readonly chunkSize = 50000;
	//#endregion
	
	//#region Static transients
	/** Stores all currently loaded FishPlayer objects. */
	static cachedPlayers:Record<string, FishPlayer> = {};
	static stats = {
		numIpsChecked: 0,
		numIpsFlagged: 0,
		numIpsErrored: 0,
	};
	/** The last player that was kicked due to a USID mismatch. */
	static lastAuthKicked:FishPlayer | null = null;
	/**
	 * List of IPs that were recently punished.
	 * If a new account joins from one of these IPs,
	 * we assume they are trying to evade the punishment
	 * and the IP gets banned.
	 */
	static punishedIPs = [] as Array<[ip:string, uuid:string, expiryTime:number]>;
	/** Stores the 10 most recent players that left. */
	static recentLeaves:FishPlayer[] = [];
	//Used for the antibot. Some of these values are reset by timers.
	static flagCount = 0;
	static playersJoinedRecent = 0;
	static antiBotModePersist = false;
	static antiBotModeOverride = false;
	static lastBotWhacked = 0;
	static lastMapStartTime = 0;
	//#endregion
	
	//#region Transient properties
	//Commands framework
	/** Front-to-back queue of menus to show. */
	activeMenus: Array<{
		callback: (option:number) => void;
	}> = [];
	/** Mapping from command to usage data. */
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
	//Misc
	player:mindustryPlayer | null = null;
	/** Used for the /trail command. */
	trail: {
		type: string;
		color: Color;
	} | null = null;
	cleanedName:string = "Unnamed player [ERROR}";
	prefixedName:string = "Unnamed player [ERROR}";
	/** Used to freeze players when votekicking. */
	frozen:boolean = false;
	/** Used to avoid spamming players with ads by the tip message system */
	lastShownAd:number = globals.maxTime;
	/** Used to avoid spamming players with ads by the tip message system */
	showAdNext:boolean = false;
	/** Transient statistics, used by the automatic griefer detection. */
	tstats = {
		//remember to clear this in updateSavedInfoFromPlayer!
		blocksBroken: 0,
		blockInteractionsThisMap: 0,
		lastMapStartTime: 0,
		lastMapPlayedTime: 0,
		wavesSurvived: 0,
	};
	/** Whether the player has manually marked themselves as AFK. */
	manualAfk = false;
	//Used for AFK detection.
	lastMousePosition = [0, 0] as [x:number, y:number];
	lastUnitPosition = [0, 0] as [x:number, y:number];
	lastActive:number = Date.now();
	/** Set this to false to disable automatic name updates. Used for the rename console command. */
	shouldUpdateName = true;
	/** Used by the sendMessage() ratelimit system. */
	lastRatelimitedMessage = -1;
	/** Keeps track of whether a player has changed team this match, for win rate calculation. */
	changedTeam = false;
	/** Whether the player's IP was detected as a VPN. */
	ipDetectedVpn = false;
	/**
	 * If a player's IP is detected as a VPN on their first join,
	 * they are autoflagged and cannot build or talk in chat.
	 */
	autoflagged = false;
	/** The original name that this player used to join the server. */
	originalName?: string;
	// Used by the data syncing framework.
	infoUpdated = false;
	dataSynced = false;
	//#endregion
	
	//#region Stored data
	uuid: string;
	name: string = "Unnamed player [ERROR}";
	muted: boolean = false;
	unmarkTime: number = -1;
	rank: Rank = Rank.player;
	flags = new Set<RoleFlag>();
	/** Used to color chat messages for the member command */
	highlight: string | null = null;
	/** Used to color the player's name for the member command */
	rainbow: {
		speed: number;
	} | null = null;
	/** List of all moderation actions that have been performed on this player. */
	history: PlayerHistoryEntry[] = [];
	/**
	 * The USID for this player.
	 * USID stands for Unique Server IDentifier. It is like a UUID, but unique to each server (by IP and port).
	 * It cannot be viewed by admins and it cannot be obtained by other servers.
	 */
	usid: string | null = null;
	/** If chat strictness is set to "strict", the player will not be allowed to swear. */
	chatStrictness: "chat" | "strict" = "chat";
	/** -1 represents unknown */
	lastJoined:number = -1;
	/** -1 represents unknown */
	firstJoined:number = -1;
	/** -1 represents unknown */
	globalLastJoined:number = -1;
	/** -1 represents unknown */
	globalFirstJoined:number = -1;
	stats: Stats = {
		blocksBroken: 0,
		blocksPlaced: 0,
		timeInGame: 0,
		chatMessagesSent: 0,
		gamesFinished: 0,
		gamesWon: 0,
	};
	globalStats: Stats = this.stats;
	/** Used for the /vanish command. */
	showRankPrefix:boolean = true;
	achievements: Bits = new Bits();
	//#endregion

	constructor(uuid:string, data:Partial<FishPlayerData>, player:mindustryPlayer | null){
		this.uuid = uuid;
		this.player = player;
		this.updateData(data);
	}

	//#region getplayer
	//Contains methods used to get FishPlayer instances.
	static createFromPlayer(player:mindustryPlayer){
		return new this(player.uuid(), {}, player);
	}
	static createFromInfo(playerInfo:PlayerInfo){
		return new this(playerInfo.id, {
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
	static search = search<FishPlayer>(
		(p, str) => p.uuid === str,
		(p, str) => p.player!.id.toString() === str,
		(p, str) => p.name.toLowerCase() === str.toLowerCase(),
		// (p, str) => p.cleanedName === str,
		(p, str) => p.cleanedName.toLowerCase() === str.toLowerCase(),
		(p, str) => p.name.toLowerCase().includes(str.toLowerCase()),
		// (p, str) => p.cleanedName.includes(str),
		(p, str) => p.cleanedName.toLowerCase().includes(str.toLowerCase()),
	);
	static getOneMindustryPlayerByName(str:string):mindustryPlayer | "none" | "multiple" {
		if(str == "") return "none";
		const players = setToArray(Groups.player);
		let matchingPlayers:mindustryPlayer[];

		const filters:Array<(p:mindustryPlayer) => boolean> = [
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
		const players:FishPlayer[] = [];
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

		const filters:Array<(p:FishPlayer) => boolean> = [
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

	//#region datasync
	//Please see docs/data-management.md for a description of the update syncing algorithm.
	static dataFetchFailedUuids = new Set();
	static onConnectPacket({uuid, name}:ConnectPacket){
		const entry = this.cachedPlayers[uuid];
		if(entry){
			entry.infoUpdated = false;
			entry.dataSynced = false;
			entry.name = name;
		}
		api.getFishPlayerData(uuid).then(data => {
			if(!data) return; //nothing to sync
			let fishP;
			if(!(uuid in this.cachedPlayers)){
				fishP = new FishPlayer(uuid, data, null);
				fishP.originalName = name;
				fishP.dataSynced = true;
				this.cachedPlayers[uuid] = fishP;
			} else {
				fishP = this.cachedPlayers[uuid];
				fishP.dataSynced = true;
				fishP.updateData(data);
				if(fishP.infoUpdated){
					//Player has already connected
					//Run it again
					if(fishP.player) fishP.updateSavedInfoFromPlayer(fishP.player, true);
				} else {
					//Player has not connected yet, nothing further needed
				}
			}
			if(fishP.connected()){
				fishP.checkUsid();
				fishP.updateMemberExclusiveState();
				fishP.updateName();
				fishP.updateAdminStatus();
				fishP.checkAutoRanks();
				fishP.sendWelcomeMessage();
			}
		}, () => {
			const fishP = this.cachedPlayers[uuid];
			fishP.updateAdminStatus();
			fishP.sendWelcomeMessage();
			if(fishP?.player) fishP.player.sendMessage(text.dataFetchFailed);
			else this.dataFetchFailedUuids.add(uuid);
		});
	}
	/** Must be called at player join, before updateName(). */
	updateSavedInfoFromPlayer(player:mindustryPlayer, repeated = false){
		this.player = player;
		if(repeated){
			this.name = this.originalName!;
		} else {
			this.originalName = this.name = player.name;
		}
		if(this.firstJoined < 1) this.firstJoined = Date.now();

		//Do not update USID here
		this.manualAfk = false;
		this.cleanedName = Strings.stripColors(player.name);
		this.lastJoined = Date.now();
		this.lastMousePosition = [0, 0];
		this.lastActive = Date.now();
		if(this.highlight === "[white]") this.highlight = null;
		this.shouldUpdateName = true;
		this.changedTeam = false;
		this.ipDetectedVpn = false;
		this.tstats.blocksBroken = 0;
		if(this.tstats.lastMapPlayedTime != FishPlayer.lastMapStartTime){
			this.tstats.blockInteractionsThisMap = 0;
			this.tstats.lastMapPlayedTime = FishPlayer.lastMapStartTime;
		}
		this.infoUpdated = true;
	}
	updateData(data: Partial<FishPlayerData>){
		if(data.name != undefined) this.name = data.name;
		if(data.muted != undefined) this.muted = data.muted;
		if(data.unmarkTime != undefined) this.unmarkTime = data.unmarkTime;
		if(data.lastJoined != undefined) this.lastJoined = data.lastJoined;
		if(data.firstJoined != undefined) this.firstJoined = data.firstJoined;
		if(data.globalLastJoined != undefined) this.globalLastJoined = data.globalLastJoined;
		if(data.globalFirstJoined != undefined) this.globalFirstJoined = data.globalFirstJoined;
		if(data.highlight != undefined) this.highlight = data.highlight;
		if(data.history != undefined) this.history = data.history;
		if(data.rainbow != undefined) this.rainbow = data.rainbow;
		if(data.usid != undefined) this.usid = data.usid;
		if(data.chatStrictness != undefined) this.chatStrictness = data.chatStrictness;
		if(data.stats != undefined) this.stats = data.stats;
		if(data.globalStats != undefined) this.globalStats = data.globalStats;
		if(data.showRankPrefix != undefined) this.showRankPrefix = data.showRankPrefix;
		if(data.rank != undefined) this.rank = Rank.getByName(data.rank) ?? Rank.player;
		if(data.flags != undefined) this.flags = new Set(data.flags.map(RoleFlag.getByName).filter(Boolean));
		if(data.achievements != undefined) this.achievements = JsonIO.read(Bits, data.achievements);
	}
	getData():UploadedFishPlayerData {
		const { uuid, name, muted, unmarkTime, rank, flags, highlight, rainbow, history, usid, chatStrictness, lastJoined, firstJoined, stats, showRankPrefix } = this;
		return {
			uuid, name, muted, unmarkTime, highlight, rainbow, history, usid, chatStrictness, lastJoined, firstJoined, stats, showRankPrefix,
			rank: rank.name,
			flags: [...flags.values()].map(f => f.name),
			achievements: JsonIO.write(this.achievements)
		};
	}
	/** Warning: the "update" callback is run twice. */
	async updateSynced(
		update: (fishP:FishPlayer) => void,
		beforeFetch?: (fishP:FishPlayer) => void,
		afterFetch?: (fishP:FishPlayer) => void,
	){
		update(this);
		beforeFetch?.(this);
		const data = await api.getFishPlayerData(this.uuid);
		if(data) this.updateData(data);
		update(this);
		//of course, this is a race condition
		//but it's unlikely to happen
		//could be fixed by transmitting the update operation to the server as a mongo update command
		afterFetch?.(this);
		await api.setFishPlayerData(this.getData());
	}
	//#endregion

	//#region actively synced data updates
	stop(by:FishPlayer | string, duration:number, message?:string, notify = true){
		if(duration > 60_000) this.setPunishedIP(stopAntiEvadeTime);
		this.showRankPrefix = true;
		return this.updateSynced(() => {
			this.unmarkTime = Date.now() + duration;
			if(this.unmarkTime > globals.maxTime) this.unmarkTime = globals.maxTime;
			this.updateName();
		}, () => {
			this.setUnmarkTimer(duration);
			if(this.connected() && notify){
				this.stopUnit();
				this.sendMessage(
					message
					? `[scarlet]Oopsy Whoopsie! You've been stopped, and marked as a griefer for reason: [white]${message}[]`
					: `[scarlet]Oopsy Whoopsie! You've been stopped, and marked as a griefer.`);
				if(duration < Duration.hours(1)){
					//less than one hour
					this.sendMessage(`[yellow]Your mark will expire in ${formatTime(duration)}.`);
				}
			}
		}, () => this.addHistoryEntry({
			action: 'stopped',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		}));
	}
	free(by:FishPlayer | string){
		by ??= "console";
		
		this.autoflagged = false; //Might as well set autoflagged to false
		FishPlayer.removePunishedIP(this.ip());
		FishPlayer.removePunishedUUID(this.uuid);
		return this.updateSynced(() => {
			this.unmarkTime = -1;
		}, () => {
			if(this.connected()){
				this.sendMessage('[yellow]Looks like someone had mercy on you.');
				this.updateName();
				this.forceRespawn();
			}
		}, () => this.addHistoryEntry({
			action: 'freed',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		}));
	}
	async setRank(rank:Rank){
		if(typeof rank === "string"){
			rank satisfies never;
			crash(`Type error in FishPlayer.setFlag(): rank is invalid`);
		}
		if(rank == Rank.pi && !Mode.localDebug) throw new TypeError(`Cannot find function setRank in object [object Object].`);
		await this.updateSynced(() => {
			this.rank = rank;
			this.updateName();
			this.updateAdminStatus();
		}, () => FishPlayer.saveAll());
	}
	async setFlag(flag_:RoleFlag | RoleFlagName, value:boolean){
		const flag = typeof flag_ == "string" ?
			(RoleFlag.getByName(flag_) ?? crash(`Type error in FishPlayer.setFlag(): flag ${flag_} is invalid`))
			: flag_;
		
		await this.updateSynced(() => {
			if(value){
				this.flags.add(flag);
			} else {
				this.flags.delete(flag);
			}
			this.updateMemberExclusiveState();
			this.updateName();
		});
	}
	mute(by:FishPlayer | string){
		if(this.muted) return;
		this.showRankPrefix = true;
		return this.updateSynced(() => {
			this.muted = true;
			this.updateName();
		}, () => {
			this.sendMessage(`[yellow]Hey! You have been muted. You cannot send messages to other players. You can still send messages to staff members.`);
			this.setPunishedIP(stopAntiEvadeTime);
		}, () => this.addHistoryEntry({
			action: 'muted',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		}));
	}
	unmute(by:FishPlayer | string){
		if(!this.muted) return;
		FishPlayer.removePunishedIP(this.ip());
		FishPlayer.removePunishedUUID(this.uuid);
		return this.updateSynced(() => {
			this.muted = false;
			this.updateName();
		}, () => {
			this.sendMessage(`[green]You have been unmuted.`);
		}, () => this.addHistoryEntry({
			action: 'muted',
			by: by instanceof FishPlayer ? by.name : by,
			time: Date.now(),
		}));
	}
	//#endregion
	
	//#region eventhandling
	//Contains methods that handle an event and must be called by other code (usually through Events.on).
	/** Must be run on PlayerConnectEvent. */
	static onPlayerConnect(player:mindustryPlayer){
		const fishPlayer = this.cachedPlayers[player.uuid()] ??= this.createFromPlayer(player);
		const previousJoin = fishPlayer.lastJoined;
		fishPlayer.updateSavedInfoFromPlayer(player);
		if(fishPlayer.validate()){
			if(!fishPlayer.hasPerm("bypassNameCheck")){
				const message = isImpersonator(fishPlayer.name, fishPlayer.ranksAtLeast("admin"));
				if(message !== false){
					fishPlayer.sendMessage(`[scarlet]\u26A0[] [gold]Oh no! Our systems think you are a [scarlet]SUSSY IMPERSONATOR[]!\n[gold]Reason: ${message}\n[gold]Change your name to remove the tag.`);
				} else if(cleanText(player.name, true).includes("hacker")){
					fishPlayer.sendMessage("[scarlet]\u26A0 Don't be a script kiddie!");
					FishEvents.fire("scriptKiddie", [fishPlayer]);
				}
			}
			fishPlayer.updateAdminStatus();
			fishPlayer.checkVPNAndJoins();
			fishPlayer.updateName();
			//I think this is a better spot for this
			if(fishPlayer.firstJoin()) void Menu.menu(
				"Rules for [#0000ff] >|||> FISH [white] servers [white]",
				rules.join("\n\n[white]") + "\nYou can view these rules again by running [cyan]/rules[].",
				["[green]I understand and agree to these terms"],
				fishPlayer
			);

		}
	}
	/** Must be run on PlayerJoinEvent. */
	static onPlayerJoin(player:mindustryPlayer){
		const fishPlayer = this.cachedPlayers[player.uuid()] ??= (() => {
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
		const fishP = this.cachedPlayers[player.uuid()];
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
		fishP.updateStats(stats => stats.timeInGame += (Date.now() - fishP.lastJoined)); //Time between joining and leaving
		fishP.lastJoined = Date.now();
		this.recentLeaves.unshift(fishP);
		if(this.recentLeaves.length > 10) this.recentLeaves.pop();
		void api.setFishPlayerData(fishP.getData(), 1, true);
	}
	static easterEggVotekickTarget: FishPlayer | null = null;
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
						if(target !== this.easterEggVotekickTarget){
							this.easterEggVotekickTarget = target;
							const msg = (new Error()).stack?.split("\n").slice(0, 4).join("\n");
							Call.sendMessage(
	`[scarlet]Server[lightgray] has voted on kicking[orange] ${initiator.prefixedName}[lightgray].[accent] (\u221E/${Vars.netServer.votesRequired()})
	[scarlet]Error: failed to kick player ${initiator.name}
	${msg}
	[scarlet]Error: failed to cancel votekick
	${msg}`
							);
						}
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
				} else if(initiator?.hasPerm("immediatelyVotekickNewPlayers") && target.firstJoin() && !target.hasPerm("bypassVotekick")){
					Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.prefixedName}[lightgray].[accent] (${Vars.netServer.votesRequired()}/${Vars.netServer.votesRequired()})
[scarlet]Vote passed.`
					);
					target.kick(Packets.KickReason.vote, Duration.minutes(30));
					Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
					Vars.netServer.currentlyKicking = null;
					return;
				} else if(target.firstJoin() && !target.hasPerm("bypassVotekick") && !target.ranksAtLeast("trusted")){
					//Increase votes by 1, from 1 to 2
					Reflect.set(Vars.netServer.currentlyKicking, "votes", Packages.java.lang.Integer(2));
					voted.put("__server__", 1);
					Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.prefixedName}[lightgray].[accent] (2/${Vars.netServer.votesRequired()})
[lightgray]Type[orange] /vote <y/n>[] to agree.`
					);
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
			if(Date.now() - fishP.lastJoined < 6_000){
				if(message.trim() == "/vote y"){
					//Sends /vote y within 5 seconds of joining
					logHTrip(fishP, "votekick bot");
					fishP.setPunishedIP(1000);//If there are any further joins within 1 second, its definitely a bot, just ban
					fishP.kick(Packets.KickReason.kick, 30_000);
				}
			}
		}
		fishP.lastActive = Date.now();
		fishP.updateStats(stats => stats.chatMessagesSent ++);
	}
	static onPlayerCommand(player:FishPlayer, command:string, unjoinedRawArgs:string[]){
		if(command == "msg" && unjoinedRawArgs[1] == "Please do not use that logic, as it is attem83 logic and is bad to use. For more information please read www.mindustry.dev/attem")
			return; //Attemwarfare message, not sent by the player
		player.lastActive = Date.now();
	}
	private static ignoreGameOver = false;
	static onGameOver(winningTeam:Team){
		FishEvents.fire("gameOver", [winningTeam]);
		this.forEachPlayer((fishPlayer) => {
			//Clear temporary states such as menu and taphandler
			fishPlayer.activeMenus = [];
			fishPlayer.tapInfo.commandName = null;
			//Update stats
			if(!this.ignoreGameOver && fishPlayer.team() != Team.derelict && winningTeam != Team.derelict){
				fishPlayer.updateStats(stats => stats.gamesFinished ++);
				if(fishPlayer.changedTeam){
					fishPlayer.sendMessage(`Refusing to update stats due to a team change.`);
				} else {
					if(fishPlayer.team() == winningTeam) fishPlayer.updateStats(stats => stats.gamesWon ++);
				}
			}
			fishPlayer.changedTeam = false;
			fishPlayer.tstats.wavesSurvived = 0;
			fishPlayer.tstats.blockInteractionsThisMap = 0;
		});
	}
	static ignoreGameover(callback:() => unknown){
		this.ignoreGameOver = true;
		callback();
		this.ignoreGameOver = false;
	}
	static onGameBegin(){
		const startTime = Date.now();
		FishPlayer.lastMapStartTime = startTime;
		//wait 7 seconds for players to join
		Timer.schedule(() => FishPlayer.forEachPlayer(p => p.tstats.lastMapStartTime = startTime), 7);
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
		const out:T[] = [];
		Groups.player.each(player => {
			if(player == null){
				Log.err(".FINDTAG. Groups.player.each() returned a null player???");
				return;
			}
			out.push(func(this.get(player)));
		});
		return out;
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
		const name = this.originalName ?? this.name;
		if(this.marked()) this.showRankPrefix = true;
		let prefix = '';
		if(!this.hasPerm("bypassNameCheck") && isImpersonator(name, this.ranksAtLeast("admin")))
			prefix += "[scarlet]SUSSY IMPOSTOR[]";
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
		if(cleanText(name, true).includes("hacker")){
			//"Don't be a script kiddie"
			//-LiveOverflow, 2015
			if(/h.*a.*c.*k.*[3e].*r/i.test(name)){ //try to only replace the part that contains "hacker" if it can be found with a simple regex
				replacedName = name.replace(/h.*a.*c.*k.*[3e].*r/gi, "[brown]script kiddie[]");
			} else {
				replacedName = "[brown]script kiddie";
			}
		} else if(this.name.endsWith("[") && !this.name.endsWith("[[")){
			replacedName = name + "[";
		} else replacedName = name;
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
						void Menu.buttons(
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

If you are unable to change it, please download Mindustry from Steam or itch.io.`,
			1);
		} else if(Strings.stripColors(this.name).trim().length == 0){
			this.kick(
`[scarlet]"${escapeStringColorsClient(this.name)}[scarlet]" is not an allowed name because it is empty. Please change it.`,
			1);
		} else {
			return true;
		}
		return false;
	}
	/** Checks if this player's USID is correct. */
	checkUsid(){
		const storedUSID = this.usid;
		const usidMissing = storedUSID == null || !storedUSID;
		const receivedUSID = this.player!.usid();
		if(this.hasPerm("usidCheck")){
			if(usidMissing){
				if(this.hasPerm("mod")){
					//Staff missing USID, don't let them in
					Log.err(`&rUSID missing for privileged player &c"${this.cleanedName}"&r: no stored usid, cannot authenticate.\nRun &lgsetusid ${this.uuid} ${receivedUSID}&fr if you have verified this connection attempt.`);
					this.kick(`Authorization failure! Please ask a staff member with Console Access to approve this connection.`, 1);
					FishPlayer.lastAuthKicked = this;
					return false;
				} else {
					Log.info(`Acquired USID for player &c"${this.cleanedName}"&fr: &c"${receivedUSID}"&fr`);
				}
			} else {
				if(receivedUSID != storedUSID){
					Log.err(`&rUSID mismatch for player &c"${this.cleanedName}"&r: stored usid is &c${storedUSID}&r, but they tried to connect with usid &c${receivedUSID}&r\nRun &lgsetusid ${this.uuid} ${receivedUSID}&fr if you have verified this connection attempt.`);
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
		this.usid = receivedUSID;
		return true;
	}
	displayTrail(){
		if(this.trail) Call.effect(Fx[this.trail.type], this.player!.x, this.player!.y, 0, this.trail.color);
	}
	sendWelcomeMessage(){
		const appealLine = `To appeal, ${FColor.discord`join our discord`} with ${FColor.discord`/discord`}, or ask a ${Rank.mod.color}staff member[] in-game.`;
		if(FishPlayer.dataFetchFailedUuids.has(this.uuid)){
			this.sendMessage(text.dataFetchFailed);
			FishPlayer.dataFetchFailedUuids.delete(this.uuid);
		}
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
			if(Date.now() - this.lastShownAd > Duration.days(1)){
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
			const messagePool = showAd ? tips.ads : (Mode.isChristmas && Math.random() > 0.6) ? tips.christmas : tips.normal;
			const messageText = messagePool[Math.floor(Math.random() * messagePool.length)];
			const message = showAd ? `[gold]${messageText}[]` : `[gold]Tip: ${messageText}[]`;

			//Delay sending the message so it doesn't get lost in the spam of messages that usually occurs when you join
			Timer.schedule(() => this.sendMessage(message), 3);
		}
	}
	checkAutoRanks(){
		if(this.stelled()) return;
		for(const rankToAssign of Rank.autoRanks){
			if(!this.ranksAtLeast(rankToAssign) && rankToAssign.autoRankData){
				if(
					this.joinsAtLeast(rankToAssign.autoRankData.joins) &&
					this.globalStats.blocksPlaced >= rankToAssign.autoRankData.blocksPlaced &&
					this.globalStats.timeInGame >= rankToAssign.autoRankData.playtime &&
					this.globalStats.chatMessagesSent >= rankToAssign.autoRankData.chatMessagesSent &&
					(Date.now() - this.globalFirstJoined) >= rankToAssign.autoRankData.timeSinceFirstJoin
				){
					void this.setRank(rankToAssign).then(() =>
						this.sendMessage(`You have been automatically promoted to rank ${rankToAssign.coloredName()}!`)
					);
				}
			}
		}
		
	}
	//#endregion

	//#region I/O
	static read(version:number, fishPlayerData:StringIO, player:mindustryPlayer | null):FishPlayer {
		switch(version){
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 9:
				crash(`Version ${version} is not longer supported, this should not be possible`);
				break;
			case 10: {
				const uuid = fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null.");
				const fishP = new this(uuid, {
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: (() => {
						const muted = fishPlayerData.readBool();
						void fishPlayerData.readBool(); //discard the stored data for autoflagged
						return muted;
					})(),
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
				fishPlayerData.readNumber(1); //discard pollResponse
				return fishP;
			}
			case 11: {
				const uuid = fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null.");
				return new this(uuid, {
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: (() => {
						const muted = fishPlayerData.readBool();
						void fishPlayerData.readBool(); //discard the stored data for autoflagged
						return muted;
					})(),
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
			}
			case 12: {
				const uuid = fishPlayerData.readString(2) ?? crash("Failed to deserialize FishPlayer: UUID was null.");
				return new this(uuid, {
					name: fishPlayerData.readString(2) ?? "Unnamed player [ERROR]",
					muted: fishPlayerData.readBool(),
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
			}
			default: crash(`Unknown save version ${version}`);
		}
	}
	write(out:StringIO){
		if(typeof this.unmarkTime === "string") this.unmarkTime = 0;
		out.writeString(this.uuid, 2);
		out.writeString(this.name, 2, true);
		out.writeBool(this.muted);
		out.writeNumber(this.unmarkTime, 13);// this will stop working in 2286! https://en.wikipedia.org/wiki/Time_formatting_and_storage_bugs#Year_2286
		out.writeString(this.highlight, 2, true);
		out.writeArray(this.history.slice(-5), (i, str) => {
			str.writeString(i.action, 2);
			str.writeString(i.by.slice(0, 98), 2, true);
			str.writeNumber(i.time, 15);
		});
		out.writeNumber(this.rainbow?.speed ?? 0, 2);
		out.writeString(this.rank.name, 2);
		out.writeArray(Array.from(this.flags), (f, str) => str.writeString(f.name, 2), 2);
		out.writeString(this.usid, 2);
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
	}
	/** Saves cached FishPlayers to JSON in Core.settings. */
	static saveAll(forceSaveSettings = true){
		const out = new StringIO();
		out.writeNumber(this.saveVersion, 2);
		out.writeArray(
			Object.entries(this.cachedPlayers).filter(([uuid, fishP]) => fishP.shouldCache()),
			([uuid, player]) => player.write(out),
			6
		);
		let string = out.string;
		const numKeys = Math.ceil(string.length / this.chunkSize);
		Core.settings.put('fish-subkeys', Packages.java.lang.Integer(numKeys));
		for(let i = 1; i <= numKeys; i ++){
			Core.settings.put(`fish-playerdata-part-${i}`, string.slice(0, this.chunkSize));
			string = string.slice(this.chunkSize);
		}
		if(forceSaveSettings) Core.settings.manualSave();
	}
	shouldCache(){
		return this.ranksAtLeast("mod");
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
			const out = new StringIO(string);
			const version = out.readNumber(2);
			const players = out.readArray(str => FishPlayer.read(version, str, null), 6);
			out.expectEOF();
			players.forEach(p => this.cachedPlayers[p.uuid] = p);
		} catch(err){
			Log.err(`[CRITICAL] FAILED TO LOAD CACHED FISH PLAYER DATA`);
			Log.err(parseError(err));
			Log.err("=============================");
			Log.err(string);
			Log.err("=============================");
		}
	}
	//#endregion
	
	//#region antibot
	static antiBotMode(){
		return this.flagCount >= 3 || this.playersJoinedRecent > 50 || this.antiBotModePersist || this.antiBotModeOverride;
	}
	static shouldKickNewPlayers(){
		//return this.antiBotModeOverride;
		return false;
	}
	static shouldWhackFlaggedPlayers(){
		return (Date.now() - this.lastBotWhacked) < Duration.minutes(5); //5 minutes
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
		if(Date.now() - this.lastBotWhacked > Duration.hours(1))
			api.sendModerationMessage(`!!! <@&1040193678817378305> Possible ongoing bot attack in **${Gamemode.name()}**`);
		else if(Date.now() - this.lastBotWhacked > Duration.minutes(10))
			api.sendModerationMessage(`!!! Possible ongoing bot attack in **${Gamemode.name()}**`);
		this.lastBotWhacked = Date.now();
		this.whackFlaggedPlayers();
	}
	//#endregion
	
	//#region util
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
	position():string {
		return `(${Math.floor(this.player!.x / 8)}, ${Math.floor(this.player!.y / 8)})`;
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
		globals.FishEvents.fire("playerTeamChange", [this, oldTeam]);
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

	updateStats(func:(stats:Stats) => void):void {
		func(this.stats);
		func(this.globalStats);
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
		this.history.push(entry);
	}
	static addPlayerHistory(id:string, entry:PlayerHistoryEntry){
		this.getById(id)?.addHistoryEntry(entry);
	}

	marked():boolean {
		return this.unmarkTime > Date.now();
	}
	afk():boolean {
		return Date.now() - this.lastActive > 60_000 || this.manualAfk;
	}
	stelled():boolean {
		return this.marked() || this.autoflagged;
	}
	setUnmarkTimer(duration:number){
		const oldUnmarkTime = this.unmarkTime;
		Timer.schedule(() => {
			if(this.unmarkTime === oldUnmarkTime && this.connected()){
				//Only run the code if the unmark time hasn't changed
				this.forceRespawn();
				this.updateName();
				this.sendMessage("[yellow]Your mark has automatically expired.");
			}
		}, duration / 1000);
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
	/** Sets the unmark time but doesn't stop the player's unit or send them a message. */
	updateStopTime(duration:number):Promise<void> {
		return this.updateSynced(() => {
			const time = Math.min(Date.now() + duration, globals.maxTime);
			this.unmarkTime = time;
			this.updateName();
		}, () => this.setUnmarkTimer(duration));
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
						void this.stop("automod", globals.maxTime, `Automatic stop due to suspicious activity`);
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

//TODO convert all the unnecessary event handlers to simple calls to Events.on
Events.on(EventType.WaveEvent, () => FishPlayer.forEachPlayer(p => p.tstats.wavesSurvived ++));
