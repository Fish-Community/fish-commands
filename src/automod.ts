/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains automatic moderation and antibot code.
*/

import * as api from "/api";
import { logAction, logHTrip, updateBans } from "/utils";
import { Duration, escapeStringColorsServer, escapeTextDiscord } from "/funcs";
import { FishPlayer } from "/players";
import { FColor, Gamemode, heuristics, text } from "/config";
import { fishState, maxTime, uuidPattern } from "/globals";
import { Menu } from "/frameworks/menus";

export const globalSusChat = new Ratekeeper();
export const votekickActionRate = new Ratekeeper();
export const lastVKActions = [] as Array<{
	type: "vote y" | "start";
	player: FishPlayer;
	playerSusLevel: 0 | 1 | 2 | 3;
	time: number;
	target: mindustryPlayer;
	targetSusLevel: 0 | 1 | 2 | 3;
	reason?: string;
}>;

Events.on(EventType.PlayerChatEvent, ({player, message}) => {
	const fishP = FishPlayer.get(player);
	if(message.trim().toLowerCase().startsWith("/vote y") || message.startsWith("/votekick ")){
		checkVotekickAction(fishP, message);
	}
	if(!message.startsWith("/") || message.startsWith("/t")){
		checkChatMessage(fishP);
	}
});

export const Antibot = {
	antibotExpires: -1,
	kickNewPlayersExpires: -1,
	lastAntibotReason: "",
	connectRate: new Ratekeeper(),
	autoflagRate: new Ratekeeper(),
	antiBotMode(){
		return Date.now() < this.antibotExpires;
	},
	shouldKickNewPlayers(){
		return false;
	},
	shouldWhackFlaggedPlayers(){
		return Date.now() < this.antibotExpires;
	},
	whackFlaggedPlayers(){
		FishPlayer.forEachPlayer(p => {
			if(p.ipDetectedVpn && p.suspicionLevel() == 3){
				Vars.netServer.admins.blacklistDos(p.ip());
				try {
					Vars.netServer.admins.blacklistDos(p.con().connection.getRemoteAddressUDP().getAddress().getHostAddress());
				} catch {}
				Log.info(`&yAntibot killed connection ${p.ip()} due to flagged while under attack`);
				p.player.kick(Packets.KickReason.banned, 10000000);
			}
		});
	},
	triggerAntibot(duration:number, reason:string, category:"manual" | "automatic", kickNewPlayers:boolean, pingConsole = false){
		if(category == "automatic"){
			//Ping reports based on time
			let message;
			if(Date.now() - this.antibotExpires > Duration.hours(1))
				message = `!!! ${text.reportsPing} Possible ongoing bot attack in **${Gamemode.name()}**  Reason: ${escapeTextDiscord(reason)}`;
			else if(Date.now() - this.antibotExpires > Duration.minutes(10))
				message = `!!! Possible ongoing bot attack in **${Gamemode.name()}**  Reason: ${escapeTextDiscord(reason)}`;
			if(message) api.sendModerationMessage(pingConsole ? message + ` <@&1096094397625532558>` : message);
		}
		if(Date.now() > this.antibotExpires || reason != this.lastAntibotReason)
			Log.info(`&yAntibot triggered: ${escapeStringColorsServer(reason)}`);
		this.antibotExpires = Math.max(this.antibotExpires, Date.now() + duration);
		if(kickNewPlayers) this.kickNewPlayersExpires = Date.now() + 8_000;
		this.lastAntibotReason = reason;
		if(this.shouldWhackFlaggedPlayers()) this.whackFlaggedPlayers();
	}
};

function checkVotekickAction(fishP:FishPlayer, message:string){
	const sus = fishP.suspicionLevel();
	const timeSinceJoin = Date.now() - fishP.lastJoined;
	let target: mindustryPlayer;
	if(message.startsWith("/votekick")){
		const id = Number(message.split(" ")[1]?.split("#")[1]);
		if(isNaN(id)) return;
		target = Groups.player.getByID(id);
		if(!target) return; //invalid votekick command, harmless
	} else { //TODO these "harmless" actions could be indications of a malfunctioning vkbot and should be logged if they repeat a lot (eg more than 5 times per minute)
		if(!Vars.netServer.currentlyKicking) return; //nobody to votekick, harmless
		target = Reflect.get(Vars.netServer.currentlyKicking, "target");
	}
	const targetSusLevel = FishPlayer.get(target).suspicionLevel();

	//Evaluate if this action should be blocked
	if(sus <= 1) return;
	let reason: string | undefined = undefined;
	if(!votekickActionRate.allow(108_000, 8))
		reason = "Exceeded 8 votekick actions in the last 2 minutes";
	else if(sus == 3 && lastVKActions.find(a => Date.now() - a.time < 10_000 && a.playerSusLevel == 3) && timeSinceJoin < 6_000)
		reason = "Performed votekick within 6 seconds of joining and there was a recent suspicious vote";
	else if(sus == 3 && timeSinceJoin < 80000 && lastVKActions.find(a => a.player == fishP) && targetSusLevel <= 1)
		reason = "Two votekick actions within 80 seconds of joining and the target is not suspicious";
	else if(sus >= 2 && lastVKActions.filter(a => a.playerSusLevel == 3 && Date.now() - a.time < 33_000).length >= 3)
		reason = "More than 3 recent votekick actions by suspicious players";
	else if(sus >= 2 && lastVKActions.filter(a => a.playerSusLevel >= 2).length >= 6 && lastVKActions.filter(a => a.player == fishP).length >= 3)
		reason = "More than 6 slightly suspicious votekick actions within the past 20 minutes and this player has already performed 3 of them";
	if(reason != undefined){
		//Should we ban everyone?
		const suspiciousActions = lastVKActions.filter(action =>
			(action.playerSusLevel == 3 || (action.targetSusLevel <= 2 && action.playerSusLevel >= 2) || action.player == fishP) && Date.now() - action.time < 78_000
		);
		if(suspiciousActions.length >= 3){
			//Ban everyone
			const playersToBan = suspiciousActions.map(a => a.player).reduce((map, p) => {
				map.set(p, (map.get(p) ?? 0) + 1);
				return map;
			}, new Map<FishPlayer, number>());
			//Only ban players that appeared in the list twice or are high suslevel
			const { admins } = Vars.netServer;
			for(const [p, times] of playersToBan){
				if(p.suspicionLevel() == 3 || p.suspicionLevel() == 2 && times > 1){
					admins.banPlayerID(p.uuid);
					admins.bannedIPs.add(p.ip());
					api.ban({ ip: p.ip(), uuid: p.uuid });
					logHTrip(p, "votekick abuse",
						(p == fishP ? `Player banned automatically` : `Player banned automatically based on previous activity`) +
						`. Trigger reason: ${reason}`
					);
				}
			}
			updateBans(player => `[scarlet]Player [yellow]${player.name}[scarlet] has been whacked automatically for suspected votekick abuse.`);
			//Pardon most of the votekick targets (the ones that weren't voted on by a non-sus player)
			const candidatePardons = new Set(lastVKActions.map(a => a.target));
			for(const action of lastVKActions){
				if(action.playerSusLevel <= 1) candidatePardons.delete(action.target);
			}
			const playersToPardon = [...candidatePardons].map(FishPlayer.get);
			//Don't pardon players with suslevel 3
			for(const p of playersToPardon){
				if(!p.isSuspicious("high")){
					p.info().lastKicked = 0;
					admins.kickedIPs.remove(p.ip());
					Log.info("Pardoned player @ (@/@)", p.name, p.uuid, p.ip());
					logAction("pardoned", "automod", p, "kicked by suspected votekick bot");
				}
			}
		} else {
			//Just kick the player
			logHTrip(fishP, "votekick abuse", `sus=${sus}`);
			fishP.kick(`You have been kicked [accent]automatically[] due to suspicious behavior. Please wait [accent]35[] seconds before rejoining.`, 30_000);
			Call.sendMessage(`[scarlet]Player [yellow]${fishP.prefixedName}[scarlet] was kicked due to suspected votekick abuse.`);
			//If this message is going to start a votekick, cancel it
			if(message.startsWith("/votekick") && Vars.netServer.currentlyKicking == null) Core.app.post(() => {
				Call.sendMessage(
	`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.name}[lightgray].[accent] (-\u221E/${Vars.netServer.votesRequired()})
	[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff.`
				);
				if(Vars.netServer.currentlyKicking) Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
				Vars.netServer.currentlyKicking = null;
			});
			//If there is an ongoing votekick and the initiator is suspicious, cancel that
			else if(lastVKActions.slice().reverse().find(a => a.type == "start")?.playerSusLevel == 3){
				Call.sendMessage(
	`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.name}[lightgray].[accent] (-\u221E/${Vars.netServer.votesRequired()})
	[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff.`
				);
				if(Vars.netServer.currentlyKicking) Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
				Vars.netServer.currentlyKicking = null;
			}
			//Otherwise, revoke the vote
			else Core.app.post(() => {
				if(Vars.netServer.currentlyKicking){
					const votes = Reflect.get(Vars.netServer.currentlyKicking, "votes") - 1;
					Reflect.set(Vars.netServer.currentlyKicking, "votes", votes);
					const voted = Reflect.get(Vars.netServer.currentlyKicking, "voted");
					voted.put(fishP.uuid, 0);
					voted.put(fishP.ip(), 0);
					Call.sendMessage(`[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff.`);
				}
			});
		}
	}

	//Update state to catch future actions
	lastVKActions.push({
		player: fishP,
		playerSusLevel: sus,
		target,
		targetSusLevel,
		time: Date.now(),
		type: message.startsWith("/votekick") ? "start" : "vote y",
		reason: message.startsWith("/votekick") ? message.split(" ").slice(2).join(" ") : undefined
	});

	lastVKActions.splice(0, lastVKActions.length,
		...lastVKActions.filter(a => Date.now() - a.time < Duration.minutes(10))
	);
}

function checkChatMessage(fishP:FishPlayer){
	const susLevel = fishP.suspicionLevel();
	if(!fishP.chatSpam.allow(14_300, susLevel == 3 ? 3 : susLevel == 2 ? 5 : 30)){
		if(susLevel == 3 || Date.now() > fishP.kickForSpamAt!){
			fishP.kick("You have been kicked for spamming.", 30_000);
			if(Antibot.antiBotMode()) Vars.netServer.admins.blacklistDos(fishP.ip());
		} else {
			fishP.sendMessage("[scarlet]You are sending chat messages too quickly.");
			fishP.kickForSpamAt = Date.now() + 3_000;
		}
	}
	if(susLevel >= 2 && !globalSusChat.allow(30_000, 20)){
		Antibot.triggerAntibot(Duration.minutes(2), "too many chat messages", "automatic", true);
	}
}

export function checkVPNAndJoins(fishP:FishPlayer){
	const ip = fishP.ip();
	const info:PlayerInfo = fishP.info();
	api.isVpn(ip, isVpn => {
		if(isVpn){
			Log.warn(`IP ${ip} was flagged as VPN. Flag rate: ${FishPlayer.stats.numIpsFlagged}/${FishPlayer.stats.numIpsChecked} (${100 * FishPlayer.stats.numIpsFlagged / FishPlayer.stats.numIpsChecked}%)`);
			fishP.ipDetectedVpn = true;
			if(!Antibot.autoflagRate.allow(30_000, 5)){
				Antibot.triggerAntibot(Duration.minutes(3), "rate of flagged IPs exceeded 5 / 30s", "automatic", false);
				return;
			}
			if(
				(info.timesJoined <= 1 || (Antibot.autoflagRate.occurences > 3 && info.timesJoined <= 10)) //is this smart?
				&& !fishP.ranksAtLeast("active")
				&& Automod.shouldAutoflag()
			){
				fishP.autoflagged = true;
				if(fishP.connected()) fishP.stopUnit();
				fishP.updateName();
				if(Antibot.shouldWhackFlaggedPlayers()){
					Antibot.whackFlaggedPlayers(); //calls whack all flagged players
				} else {
					logAction("autoflagged", "AntiVPN", fishP);
					void api.sendStaffMessage(`Autoflagged player ${fishP.cleanedName}[cyan] for suspected vpn!`, "AntiVPN", true);
					if(!Antibot.antiBotMode()) FishPlayer.messageStaff(`[yellow]WARNING:[scarlet] player [cyan]"${fishP.prefixedName}[cyan]"[yellow] is new (${info.timesJoined - 1} joins) and using a vpn. Unless there is an ongoing griefer raid, they are most likely innocent. Free them with /free.`);
					Log.warn(`Player ${fishP.cleanedName} (${fishP.uuid}) was autoflagged.`);
					if(fishP.connected()) void Menu.buttons(
						fishP,
						"[gold]Welcome to Fish Community!",
						`[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ${FColor.discord`Join our Discord`} to request a staff member come online if none are on.`,
						[[
							{ data: "Close", text: "Close" },
							{ data: "Discord", text: FColor.discord("Discord") },
						]]
					).then((option) => {
						if(option == "Discord"){
							Call.openURI(fishP.con(), text.discordURL);
						}
					});
					fishP.sendMessage(`[gold]Welcome to Fish Community!\n[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ${FColor.discord`Join our Discord`} to request a staff member come online if none are on.`);
				}
			} else if(info.timesJoined < 5){
				FishPlayer.messageStaff(`[yellow]WARNING:[scarlet] player [cyan]"${fishP.prefixedName}[cyan]"[yellow] is new (${info.timesJoined - 1} joins) and using a vpn.`);
			}
		} else {
			if(info.timesJoined == 1){
				FishPlayer.messageTrusted(`[yellow]Player "${fishP.prefixedName}[yellow]" is on first join.`);
			}
		}
		if(info.timesJoined == 1){
			let message = `&lrNew player joined: &c${fishP.cleanedName}&lr (&c${fishP.uuid}&lr/&c${ip}&lr)`;
			//Add BEL, this causes an audible noise
			if(fishState.joinBell) message += '\x07';
			Log.info(message);
		}
	}, err => {
		Log.err(`Error while checking for VPN status of ip ${ip}!`);
		Log.err(err);
	});
}


let easterEggVotekickTarget: FishPlayer | null = null;
function validateVotekickSession(){
	if(!Vars.netServer.currentlyKicking) return;
	const target = FishPlayer.get(Reflect.get(Vars.netServer.currentlyKicking, "target"));
	const voted = Reflect.get(Vars.netServer.currentlyKicking, "voted") as ObjectIntMap<string>;
	if(voted.size == 2){
		//Try to find the UUID of the initiator
		let uuid:string | null = null;
		voted.entries().toArray().each(e => {
			if(uuidPattern.test(e.key)) uuid = e.key;
		});
		if(uuid){
			const initiator = FishPlayer.getById(uuid);
			if(initiator?.stelled()){
				if(initiator.hasPerm("bypassVotekick")){
					if(target !== easterEggVotekickTarget){
						easterEggVotekickTarget = target;
						const msg = (new Error()).stack?.split("\n").slice(0, 4).join("\n");
						Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${initiator.prefixedName}[lightgray].[accent] (\u221E/${Vars.netServer.votesRequired()})
[scarlet]Error: failed to kick player ${initiator.prefixedName}[scarlet]
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
			} else if(initiator?.hasPerm("immediatelyVotekickNewPlayers") && target.isSuspicious("high")){
				Call.sendMessage(
`[scarlet]Server[lightgray] has voted on kicking[orange] ${target.prefixedName}[lightgray].[accent] (${Vars.netServer.votesRequired()}/${Vars.netServer.votesRequired()})
[scarlet]Vote passed.`
				);
				target.kick(Packets.KickReason.vote, Duration.minutes(30));
				Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
				Vars.netServer.currentlyKicking = null;
				return;
			} else if(target.isSuspicious("high") && !target.hasPerm("bypassVotekick")){
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
Timer.schedule(validateVotekickSession, 1, 0.3);

export const Automod = {
	/**
	 * List of IPs that were recently punished.
	 * If a new account joins from one of these IPs,
	 * we assume they are trying to evade the punishment
	 * and the IP gets banned.
	 */
	punishedIPs: [] as Array<[ip:string, uuid:string, expiryTime:number]>,
	updatePunishedIPs(){
		for(let i = 0; i < this.punishedIPs.length; i ++){
			if(this.punishedIPs[i][2] < Date.now()){
				this.punishedIPs.splice(i, 1);
			}
		}
	},
	checkAntiEvasion(fishP:FishPlayer){
		this.updatePunishedIPs();
		for(const [ip, uuid] of this.punishedIPs){
			if(ip == fishP.ip() && uuid != fishP.uuid && !fishP.ranksAtLeast("mod")){
				api.sendModerationMessage(
	`Automatically banned player \`${fishP.cleanedName}\` (\`${fishP.uuid}\`/\`${fishP.ip()}\`) for suspected punishment evasion.
	Previously used UUID \`${uuid}\`(${Vars.netServer.admins.getInfoOptional(uuid)?.plainLastName()}), currently using UUID \`${fishP.uuid}\` from the same IP address.`
				);
				Log.warn(
	`&yAutomatically banned player &b${fishP.cleanedName}&y (&b${fishP.uuid}&y/&b${fishP.ip()}&y) for suspected punishment evasion.
	&yPreviously used UUID &b${uuid}&y(&b${Vars.netServer.admins.getInfoOptional(uuid)?.plainLastName()}&y), currently using UUID &b${fishP.uuid}&y from the same IP address.`
				);
				FishPlayer.messageStaff(`[yellow]Automatically banned player [white]${fishP.name}[yellow] for suspected punishment evasion.`);
				Vars.netServer.admins.bannedIPs.add(ip);
				api.ban({ip, uuid});
				fishP.kick(Packets.KickReason.banned);
				return false;
			}
		}
		return true;
	},
	shouldAutoflag(){
		return this.punishedIPs.length > 0;
	},
	removePunishedIP(target:string){
		let ipIndex:number;
		if((ipIndex = this.punishedIPs.findIndex(([ip]) => ip == target)) != -1){
			this.punishedIPs.splice(ipIndex, 1);
			return true;
		} else return false;
	},
	removePunishedUUID(target:string){
		let uuidIndex:number;
		if((uuidIndex = this.punishedIPs.findIndex(([, uuid]) => uuid == target)) != -1){
			this.punishedIPs.splice(uuidIndex, 1);
			return true;
		} else return false;
	}
};

export const Heuristics = {
	chatSpam: new Ratekeeper(),
	chatSpamSlow: new Ratekeeper(),
	activateHeuristics(fishP:FishPlayer){
		if(Gamemode.hexed() || Gamemode.sandbox() || Gamemode.testsrv()) return;
		//Blocks broken check
		if(fishP.joinsLessThan(5)){
			let tripped = false;
			fishP.tstats.blocksBroken = 0;
			Timer.schedule(() => {
				if(fishP.connected() && !tripped){
					const limit = fishP.firstJoin() && Antibot.antiBotMode() ?
						Date.now() < Antibot.kickNewPlayersExpires + 30_000 ? 1 : 25
					: heuristics.blocksBrokenAfterJoin;
					if(fishP.tstats.blocksBroken > limit){
						tripped = true;
						logHTrip(fishP, "blocks broken after join", `${fishP.tstats.blocksBroken}/${limit}`);
						void fishP.stop("automod", fishP.tstats.blocksBroken > 40 ? maxTime : Duration.minutes(3), `Automatic stop due to suspicious activity`);
						FishPlayer.messageAllExcept(fishP,
`[yellow]Player ${fishP.cleanedName} has been stopped automatically due to suspected griefing.
Please look at ${fishP.position()} and see if they were actually griefing. If they were not, please inform a staff member.`);
					}
				}
			}, 0, 1, (fishP.firstJoin() && !fishP.joinedAlready) ? 30 : fishP.joinsLessThan(3) ? 25 : 15);
		}
		if(fishP.firstJoin() && !fishP.joinedAlready){
			fishP.joinedAlready = true;
			let tripped = false;
			Timer.schedule(() => {
				if(fishP.stats.chatMessagesSent >= 3 && !tripped){
					tripped = true;
					if(Antibot.antiBotMode()) Vars.netServer.admins.dosBlacklist.add(fishP.ip());
					else if(!this.chatSpam.allow(10_000, 1)){
						Vars.netServer.admins.dosBlacklist.add(fishP.ip());
						Antibot.triggerAntibot(Duration.minutes(15), "multiple players spamming chat", "automatic", true);
					} else {
						void fishP.mute("automod", Duration.months(1));
						logHTrip(fishP, "new player spamming chat");
					}
				}
			}, 1, 1, 4);
			Timer.schedule(() => {
				if(fishP.stats.chatMessagesSent >= 4 && !tripped){
					tripped = true;
					if(!this.chatSpamSlow.allow(30_000, 2)){
						Vars.netServer.admins.dosBlacklist.add(fishP.ip());
						Antibot.triggerAntibot(Duration.minutes(15), "multiple players spamming chat slowly", "automatic", true);
					}
				}
			}, 1, 2, 10);
		}
	}
};
Events.on(EventType.PlayerJoin, (e) => {
	//Don't activate heuristics until they've joined
	//a lot of time can pass between connect and join
	//also the player might connect but fail to join for a lot of reasons,
	//or connect, fail to join, then connect again and join successfully
	//which would cause heuristics to activate twice
	Heuristics.activateHeuristics(FishPlayer.get(e.player));
});

