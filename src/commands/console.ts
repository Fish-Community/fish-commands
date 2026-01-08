/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains all the console commands, which can be run through the server console.
*/

import * as api from "/api";
import { FishServer, Gamemode, Mode } from "/config";
import { updateMaps } from "/files";
import * as fjsContext from "/fjsContext";
import { consoleCommandList, fail } from "/frameworks/commands";
import { Duration, escapeStringColorsServer, to2DArray } from "/funcs";
import { fishState, ipPattern, ipPortPattern, maxTime, tileHistory, uuidPattern } from "/globals";
import { FishPlayer } from "/players";
import { Rank } from "/ranks";
import { colorNumber, fishCommandsRootDirPath, formatTime, formatTimeRelative, formatTimestamp, getAntiBotInfo, getIPRange, logAction, serverRestartLoop, updateBans } from "/utils";


export const commands = consoleCommandList({
	setrank: {
		args: ["player:player", "rank:rank"],
		description: "Set a player's rank.",
		async handler({args, outputSuccess, f}){
			if(args.rank == Rank.pi && !Mode.localDebug) fail(f`Rank ${args.rank} is immutable.`);
			if(args.player.immutable() && !Mode.localDebug) fail(f`Player ${args.player} is immutable.`);

			await args.player.setRank(args.rank);
			logAction(`set rank to ${args.rank.name} for`, "console", args.player);
			outputSuccess(f`Set rank of player ${args.player} to ${args.rank}`);
		}
	},
	admin: {
		args: ["nothing:string?"],
		description: "Use the setrank command instead.",
		handler(){
			fail(`Use the "setrank" command instead. Hint: "setrank player admin"`);
		}
	},
	setflag: {
		args: ["player:player", "flag:roleflag", "value:boolean"],
		description: "Set a player's role flags.",
		async handler({args, outputSuccess, f}){

			await args.player.setFlag(args.flag, args.value);
			logAction(`set roleflag ${args.flag.name} to ${args.value} for`, "console", args.player);
			outputSuccess(f`Set role flag ${args.flag} of player ${args.player} to ${args.value}`);
		}
	},
	savePlayers: {
		args: [],
		description: "Runs FishPlayer.save()",
		handler({outputSuccess}){
			FishPlayer.saveAll();
			outputSuccess(`Successfully wrote fish player data.`);
		}
	},
	info: {
		args: ["player:string"],
		description: "Find player info(s). Displays all names and ips of a player.",
		async handler({args, output, admins}){
			let infoList = admins.findByName(args.player)
				.toSeq().toArray()
				.map(p => [p, FishPlayer.getById(p.id)] as const);
			if(infoList.length == 0) fail(`No players found.`);
			const playersToFetch = infoList.filter(([a, b]) => !b).map(([a, b]) => a);
			if(playersToFetch.length == 0) display(infoList);
			else {
				//Attempt to fetch data
				//If there are too many players, give up
				if(playersToFetch.length > 50) display(infoList);
				output(`Fetching data...`);
				try {
					for(const batch of to2DArray(playersToFetch, 10)){
						await Promise.all(batch.map(async info => {
							const data = await api.getFishPlayerData(info.id);
							if(data){
								const fishP = FishPlayer.createFromInfo(info);
								fishP.updateData(data);
								FishPlayer.cachedPlayers[info.id] = fishP;
							}
						}));
					}
				} catch(err){
					Log.err(err);
				}
				infoList = admins.findByName(args.player)
					.toSeq().toArray()
					.map(p => [p, FishPlayer.getById(p.id)] as const);
				display(infoList);
			}
			function display(infoList: Array<readonly [PlayerInfo, FishPlayer | null]>){
				const outputString:string[] = [""];
				for(const [playerInfo, fishP] of infoList){
					const flagsText = [
						fishP?.marked() && `&lris marked&fr until ${formatTimeRelative(fishP.unmarkTime)}`,
						fishP?.muted && "&lris muted&fr",
						fishP?.hasFlag("member") && "&lmis member&fr",
						fishP?.autoflagged && "&lris autoflagged&fr",
						playerInfo.banned && "&bris UUID banned&fr",
					].filter(Boolean).join(", ");
					const lastJoinedColor = fishP?.lastJoined && fishP.lastJoined !== -1 ? (() => {
						const timeSinceLastJoin = (Date.now() - fishP.lastJoined) / 1000;
						if(timeSinceLastJoin < 3600) return "&br";
						if(timeSinceLastJoin < 24 * 3600) return "&by";
						if(timeSinceLastJoin < 7 * 24 * 3600) return "&lw";
						return "&lk";
					})() : "&fr";
					outputString.push([
						`${lastJoinedColor}Trace info for player &fr&y${playerInfo.id}&fr${lastJoinedColor} / &c"${escapeStringColorsServer(Strings.stripColors(playerInfo.lastName))}" &lk(${escapeStringColorsServer(playerInfo.lastName)})&fr`,
						playerInfo.names.size > 1 && `all names used: ${playerInfo.names.map(escapeStringColorsServer).map((n:string) => `&c"${n}"&fr`).items.join(', ')}`,
						`all IPs used: ${playerInfo.ips.map((n:string) => (n == playerInfo.lastIP ? '&c' : '&w') + n + '&fr').items.join(", ")}`,
						`joined &c${playerInfo.timesJoined}&fr times, kicked &c${playerInfo.timesKicked}&fr times`,
						fishP && fishP.lastJoined !== -1 && `Last joined: ${formatTimeRelative(fishP.lastJoined)}`,
						fishP && fishP.firstJoined !== -1 && formatTimeRelative(fishP.firstJoined),
						fishP && `USID: &c${fishP.usid}&fr`,
						fishP && fishP.rank !== Rank.player && `Rank: &c${fishP.rank.name}&fr`,
						flagsText,
					].filter(Boolean).map((l, i) => i == 0 ? l : '\t' + l).join("\n"));
				}
				output(outputString.join("\n"));
			}
		}
	},
	infoonline: {
		args: ["player:string"],
		description: "Display information about an online player.",
		handler({args, output, admins}){
			const infoList = args.player == "*" ? FishPlayer.getAllOnline() : FishPlayer.getAllByName(args.player, false);
			if(infoList.length == 0) fail(`Nobody with that name could be found.`);
			const outputString:string[] = [""];
			for(const player of infoList){
				const playerInfo = admins.getInfo(player.uuid);
				outputString.push(
`Info for player &c"${player.cleanedName}" &lk(${player.name})&fr
	UUID: &c"${playerInfo.id}"&fr
	USID: &c${player.usid ? `"${player.usid}"` : "unknown"}&fr
	all names used: ${playerInfo.names.map((n:string) => `&c"${n}"&fr`).items.join(', ')}
	all IPs used: ${playerInfo.ips.map((n:string) => (n == playerInfo.lastIP ? '&c' : '&w') + n + '&fr').items.join(", ")}
	joined &c${playerInfo.timesJoined}&fr times, kicked &c${playerInfo.timesKicked}&fr times
	rank: &c${player.rank.name}&fr${(player.marked() ? ", &lris marked&fr" : "") + (player.muted ? ", &lris muted&fr" : "") + (player.hasFlag("member") ? ", &lmis member&fr" : "") + (player.autoflagged ? ", &lris autoflagged&fr" : "")}`
				);
			}
			output(outputString.join("\n"));
		}
	},
	unblacklist: {
		args: ["ip:string"],
		description: "Unblacklists an ip from the DOS blacklist.",
		handler({args, output, admins}){
			if(args.ip === '*'){
				const size = admins.dosBlacklist.size;
				if(size == 0) fail('DOS blacklist is already empty.');
				admins.dosBlacklist.clear();
				output(`Cleared ${size} IPs from the DOS blacklist.`);
			} else {
				if(admins.dosBlacklist.remove(args.ip)) output(`Removed ${args.ip} from the DOS blacklist.`);
				else fail(`IP address ${args.ip} is not DOS blacklisted.`);
			}
		}
	},
	blacklist: {
		args: ["verbose:boolean?"],
		description: "Allows you to view the DOS blacklist.",
		handler({args, output, admins}){
			const blacklist = admins.dosBlacklist;
			if(blacklist.isEmpty()) fail("The blacklist is empty");
			
			if(args.verbose){
				const outputString = ["DOS Blacklist:"];
				blacklist.each((ip:string) => {
					const info = admins.findByIP(ip);
					if(info){
						outputString.push(`IP: &c${ip}&fr UUID: &c"${info.id}"&fr Last name used: &c"${info.plainLastName()}"&fr`);
					}
				});
	
				output(outputString.join("\n"));
				output(`${blacklist.size} blacklisted IPs`);
			} else {
				output(blacklist.toString());
				output(`${blacklist.size} blacklisted IPs`);
			}

		}
	},
	whack: {
		args: ["target:string"],
		description: "Whacks (ipbans) a player.",
		handler({args, output, outputFail, admins}){
			let range:string | null;
			if(ipPattern.test(args.target)){
				//target is an ip
				api.ban({ip: args.target});
				const info = admins.findByIP(args.target);
				if(info) logAction("whacked", "console", info);
				else logAction(`console ip-whacked ${args.target}`);

				if(admins.isIPBanned(args.target)){
					output(`IP &c"${args.target}"&fr is already banned. Ban was synced to other servers.`);
				} else {
					admins.banPlayerIP(args.target);
					output(`&lrIP &c"${args.target}"&lr was banned. Ban was synced to other servers.`);
				}
			} else if((range = getIPRange(args.target)) != null){
				if(admins.subnetBans.contains(ip => ip.replace(/\.$/, "") == range)){
					output(`Subnet &c"${range}"&fr is already banned.`);
				} else {
					admins.subnetBans.add(range);
					output(`&lrIP range &c"${range}"&lr was banned. Subnet bans are not synced.`);
				}
			} else if(uuidPattern.test(args.target)){
				const info = admins.getInfoOptional(args.target);
				if(info) logAction("whacked", "console", info);
				else logAction(`console ip-whacked ${args.target}`);

				if(admins.isIDBanned(args.target)){
					api.ban({uuid: args.target});
					output(`UUID &c"${args.target}"&fr is already banned. Ban was synced to other servers.`);
				} else {
					admins.banPlayerID(args.target);
					if(info){
						admins.banPlayerIP(info.lastIP);
						api.ban({uuid: args.target, ip: info.lastIP});
						output(`&lrUUID &c"${args.target}" &lrwas banned. IP &c"${info.lastIP}"&lr was banned. Ban was synced to other servers.`);
					} else {
						api.ban({uuid: args.target});
						output(`&lrUUID &c"${args.target}" &lrwas banned. Ban was synced to other servers. Warning: no stored info for this UUID, player may not exist. Unable to determine IP.`);
					}
				}
			} else {
				const player = FishPlayer.getOneMindustryPlayerByName(args.target);
				if(player === "none"){
					outputFail(`Could not find a player name matching &c"${args.target}"`);
				} else if(player === "multiple"){
					outputFail(`Name &c"${args.target}"&fr could refer to more than one player.`);
				} else {
					if(player.admin) fail(`Player &c"${player.name}"&fr is an admin, you probably don't want to ban them.`);
					const ip = player.ip();
					const uuid = player.uuid();
					admins.banPlayerID(uuid);
					admins.banPlayerIP(ip);
					logAction(`console whacked ${Strings.stripColors(player.name)} (\`${uuid}\`/\`${ip}\`)`);
					api.ban({uuid, ip});
					output(`&lrIP &c"${ip}"&lr was banned. UUID &c"${uuid}"&lr was banned. Ban was synced to other servers.`);
				}
			}

			updateBans(player => `[scarlet]Player [yellow]${player.name}[scarlet] has been whacked.`);
		}
	},
	unwhack: {
		args: ["target:string"],
		description: "Unbans a player.",
		handler({args, output, admins}){
			let range:string | null;
			if(ipPattern.test(args.target)){
				//target is an ip
				if(FishPlayer.removePunishedIP(args.target)){
					output(`Removed IP &c"${args.target}"&fr from the anti-evasion list.`);
				}
				if(admins.kickedIPs.remove(args.target)){
					output(`Removed temporary kick for IP &c"${args.target}"&fr.`);
				}
				output("Checking ban status...");
				api.getBanned({ip: args.target}, (banned) => {
					if(banned){
						api.unban({ip: args.target});
						logAction(`console unbanned ip \`${args.target}\``);
						output(`IP &c"${args.target}"&fr has been globally unbanned.`);
					} else {
						output(`IP &c"${args.target}"&fr is not globally banned.`);
					}
					if(admins.isIPBanned(args.target)){
						admins.unbanPlayerIP(args.target);
						output(`IP &c"${args.target}"&fr has been locally unbanned.`);
					} else {
						output(`IP &c"${args.target}"&fr was not locally banned.`);
					}
					const size = admins.subnetBans.size;
					admins.subnetBans.removeAll(r => args.target.startsWith(r));
					if(admins.subnetBans.size < size){
						output(`Unbanned IP ranges affecting this IP.`);
					}
				});
			} else if((range = getIPRange(args.target)) != null){
				if(admins.subnetBans.remove(b => b.replace(/\.$/, ".") == range!.replace(/\.$/, "."))){
					output(`IP range &c"${range}"&fr was unbanned.`);
				} else {
					output(`IP range &c"${range}"&fr was not banned.`);
				}
			} else if(uuidPattern.test(args.target)){
				if(FishPlayer.removePunishedUUID(args.target)){
					output(`Removed UUID &c"${args.target}"&fr from the anti-evasion list.`);
				}
				output("Checking ban status...");
				const info = admins.findByIP(args.target);
				api.getBanned({uuid: args.target}, (banned) => {
					if(banned){
						api.unban({uuid: args.target});
						logAction(`console unbanned uuid \`${args.target}\``);
						output(`UUID &c"${args.target}"&fr has been globally unbanned.`);
					} else {
						output(`UUID &c"${args.target}"&fr is not globally banned.`);
					}
					if(admins.isIDBanned(args.target)){
						admins.unbanPlayerID(args.target);
						output(`UUID &c"${args.target}"&fr has been locally unbanned.`);
					} else {
						output(`UUID &c"${args.target}"&fr was not locally banned.`);
					}
					if(info){
						if(info.lastKicked > 0){
							info.lastKicked = 0;
							output(`Removed temporary kick for UUID &c"${args.target}"&fr.`);
						}
						output(`You may also want to consider unbanning the IP "${info.lastIP}".`);
					}
				});
			} else {
				fail(`Cannot unban by name; please use the info or search commands to find the IP and UUID of the player you are looking for.`);
			}
		}

	},
	ban: {
		args: ["any:string"],
		description: "Please use the whack command instead.",
		handler(){
			fail(`Use the whack command instead.`);
		}
	},
	unban: {
		args: ["any:string"],
		description: "Please use the unwhack command instead.",
		handler(){
			fail(`Use the unwhack command instead.`);
		}
	},
	"subnet-ban": {
		args: ["any:string?", "anyb:string?"],
		description: "Please use the whack and unwhack commands instead.",
		handler({args, output, admins}){
			if(args.any) fail(`Use the whack and unwhack commands instead.`);
			output(`List of all subnet bans:`);
			output(admins.subnetBans.toString("\n"));
		}
	},
	joinbell: {
		args: ["on:boolean?"],
		description: "Toggles the join bell function.",
		handler({args:{on = !fishState.joinBell}}){
			fishState.joinBell = on;
			if(fishState.joinBell){
				Log.info(`Enabled sound on new player join. Run "joinbell" again to turn it off.`);
			} else {
				Log.info(`Disabled sound on new player join.`);
			}
		}
	},
	loadfishplayerdata: {
		args: ["areyousure:boolean", "fishplayerdata:string"],
		description: "Overwrites current fish player data.",
		handler({args, output}){
			if(args.areyousure){
				const before = Object.keys(FishPlayer.cachedPlayers).length;
				FishPlayer.loadAll(args.fishplayerdata);
				output(`Loaded fish player data. before:${before}, after:${Object.keys(FishPlayer.cachedPlayers).length}`);
			}
		}
	},
	resetauth: {
		args: ["player:string"],
		description: `Removes the USID of the player provided, use this if they are getting kicked with the message "Authorization failure!". Specify "last" to use the last player that got kicked.`,
		handler({args, outputSuccess, outputFail, admins}){
			const player =
				args.player == "last" ? (FishPlayer.lastAuthKicked ?? fail(`Nobody has been kicked for authorization failure since the last restart.`)) :
				FishPlayer.getById(args.player) ?? fail(
					admins.getInfoOptional(args.player)
					? `Player ${args.player} has joined the server, but their info was not cached, most likely because they have no rank, so there is no stored USID.`
					: `Unknown player ${args.player}`
				);
			if(player.ranksAtLeast("admin")) fail(`Please use the setusid command instead.`);
			const oldusid = player.usid;
			player.usid = null;
			api.setFishPlayerData(player.getData()).then(() => {
				outputSuccess(`Removed the usid of player ${player.name}/${player.uuid} (was ${oldusid})`);
			}).catch(err => {
				Log.err(err);
				outputFail(`Failed to remove the usid, please try running the command again.`);
			});
		}
	},
	setusid: {
		args: ["uuid:string", "usid:string"],
		description: `Sets the USID of a player.`,
		handler({args, outputSuccess, outputFail, f}){
			if(args.usid.length !== 12) fail(`Invalid USID: should be 12 characters ending with an equal sign`);
			const player = FishPlayer.lastAuthKicked ?? fail(`No authorization failures have occurred since the last restart.`);
			const oldusid = player.usid;
			player.usid = args.usid;
			api.setFishPlayerData(player.getData()).then(() => {
				outputSuccess(`Set the usid of player ${player.name}/${player.uuid} to ${args.usid} (was ${oldusid})`);
			}).catch(err => {
				Log.err(err);
				outputFail(`Failed to remove the usid, please try running the command again.`);
			});
		}
	},
	update: {
		args: ["branch:string?"],
		description: "Updates the plugin.",
		handler({args, output, outputSuccess, outputFail}){
			if(Mode.localDebug) fail(`Cannot update in local debug mode.`);
			output("Updating...");
			const path = fishCommandsRootDirPath().toString();
			Threads.thread(() => {
				try {
					const initialVersion = OS.exec("git", "-C", path, "rev-parse", "HEAD");
					const gitFetch = new ProcessBuilder("git", "-C", path, "fetch", "origin")
						.redirectErrorStream(true)
						.redirectOutput(ProcessBuilder.Redirect.INHERIT)
						.start();
					gitFetch.waitFor();
					if(gitFetch.exitValue() == 0){
						outputSuccess(`Fetched data, updating files...`);
					} else {
						outputFail(`Update failed!`);
						return;
					}
					const newVersion = OS.exec("git", "-C", path, "rev-parse", `origin/${args.branch ?? "master"}`);
					if(initialVersion == newVersion){
						outputSuccess("Already up to date.");
						return;
					}
					const gitCheckout = new ProcessBuilder("git", "-C", path, "checkout", "-q", "-f", `origin/${args.branch ?? "master"}`)
						.redirectErrorStream(true)
						.redirectOutput(ProcessBuilder.Redirect.INHERIT)
						.start();
					gitCheckout.waitFor();
					if(gitCheckout.exitValue() == 0){
						outputSuccess(`Updated successfully from ${initialVersion} to ${newVersion}. Restart to apply changes.`);
					} else {
						outputFail(`Update failed!`);
						return;
					}
				} catch(err){
					Log.err(err);
					outputFail("Update failed!");
				}
			});
		}
	},
	restart: {
		args: ["time:number?"],
		description: "Restarts the server.",
		handler({args}){
			fishState.restartLoopTask?.cancel();
			if(Gamemode.pvp()){
				if(Groups.player.isEmpty()){
					Log.info(`Restarting immediately as no players are online.`);
					serverRestartLoop(0);
				} else if(args.time === -1){
					Log.info(`&rRestarting in 15 seconds (this will interrupt the current PVP match).&fr`);
					Call.sendMessage(`[accent]---[[[coral]+++[]]---\n[accent]Server restart imminent. [green]We'll be back after 15 seconds.[]\n[accent]---[[[coral]+++[]]---`);
					serverRestartLoop(15);
				} else {
					Call.sendMessage(`[accent]---[[[coral]+++[]]---\n[accent]Server restart queued. The server will restart after the current match is over.[]\n[accent]---[[[coral]+++[]]---`);
					Log.info(`PVP detected, restart will occur at the end of the current match. Run "restart -1" to override, but &rthat would interrupt the current pvp match, and players would lose their teams.&fr`);
					fishState.restartQueued = true;
				}
			} else {
				const time = args.time ?? 60;
				if(time < 0 || time > 100) fail(`Invalid time: out of valid range.`);
				Call.sendMessage(`[accent]---[[[coral]+++[]]---\n[accent]Server restart imminent. [green]We'll be back with 15 seconds of downtime, and all progress will be saved.[]\n[accent]---[[[coral]+++[]]---`);
				Log.info(`Restarting in ${time} seconds...`);
				serverRestartLoop(time);
			}
		}
	},
	restartcancel: {
		args: [],
		description: "Cancels a planned server restart.",
		handler({outputSuccess}){
			const task = fishState.restartLoopTask ?? fail(`No restart scheduled.`);
			Call.sendMessage(`[scarlet]Aborting...`);
			task.cancel();
			Call.sendMessage(`[scarlet]Server restart canceled.`);
			outputSuccess("Canceled restart.");
		}
	},
	rename: {
		args: ["player:player", "newname:string"],
		description: "Changes the name of a player.",
		handler({args, f, outputSuccess}){
			if(args.player.hasPerm("blockTrolling")) fail(f`Operation aborted: Player ${args.player} is insufficiently trollable.`);
			const oldName = args.player.name;
			args.player.player!.name = args.player.prefixedName = args.newname;
			args.player.shouldUpdateName = false;
			outputSuccess(`Renamed ${oldName} to ${args.newname}.`);
		}
	},
	fjs: {
		args: ["js:string"],
		description: "Executes arbitrary javascript code, but has access to fish-commands's variables.",
		handler({args}){
			fjsContext.runJS(args.js);
		}
	},
	checkmem: {
		args: [],
		description: "Checks memory usage of various objects.",
		handler({output}){
			output(
`Memory usage:
Total: ${Math.round(Core.app.getJavaHeap() / (2 ** 10))} KB
Number of cached fish players: ${Object.keys(FishPlayer.cachedPlayers).length} (stored locally: ${Object.values(FishPlayer.cachedPlayers).filter(p => p.shouldCache()).length})
Fish player data string length: ${FishPlayer.getFishPlayersString.length} (${Core.settings.getInt("fish-subkeys")} subkeys)
Length of tilelog entries: ${Math.round(Object.values(tileHistory).reduce((acc, a) => acc + a.length, 0) / (2 ** 10))} KB`
			);
		}
	},
	stopplayer: {
		args: ['player:player', "time:time?", "message:string?"],
		description: 'Stops a player.',
		async handler({args, f, outputSuccess}){
			if(args.player.marked()){
				//overload: overwrite stoptime
				if(!args.time) fail(f`Player ${args.player} is already marked.`);
				const previousTime = formatTime(args.player.unmarkTime - Date.now());
				await args.player.updateStopTime(args.time);
				outputSuccess(f`Player ${args.player}'s stop time has been updated to ${formatTime(args.time)} (was ${previousTime}).`);

				return;
			}

			const time = args.time ?? Duration.days(7);
			if(time + Date.now() > maxTime) fail(`Error: time too high.`);
			await args.player.stop("console", time, args.message ?? undefined);
			logAction('stopped', "console", args.player, args.message ?? undefined, time);
			Call.sendMessage(`[scarlet]Player "${args.player.prefixedName}[scarlet]" has been marked for ${formatTime(time)}${args.message ? ` with reason: [white]${args.message}[]` : ""}.`);
		}
	},
	stopoffline: {
		args: ["uuid:uuid", "time:time?"],
		description: "Stops a player by uuid.",
		async handler({args:{uuid, time}, outputSuccess, admins}){
			const stopTime = time ?? (maxTime - Date.now() - 10000);
			const info = admins.getInfoOptional(uuid)!;
			if(info == null) fail(`Unknown player ${uuid}`);
			const fishP = FishPlayer.getFromInfo(info);
			await fishP.stop("console", stopTime);
			logAction('stopped', "console", info, undefined, stopTime);
			outputSuccess(`Player "${info.lastName}" was marked for ${formatTime(stopTime)}.`);
		}
	},
	clearfire: {
		args: [],
		description: "Clears all the fires.",
		handler({output, outputSuccess}){
			output(`Removing fires...`);
			let totalRemoved = 0;
			Call.sendMessage("[scarlet][[Fire Department]:[yellow] Fires were reported. Trucks are en-route. Removing all fires shortly.");
			Timer.schedule(() => {
				totalRemoved += Groups.fire.size();
				Groups.fire.each(f => f.remove());
				Groups.fire.clear();
			}, 2, 0.1, 40);
			Timer.schedule(() => {
				outputSuccess(`Removed ${totalRemoved} fires.`);
				Call.sendMessage(`[scarlet][[Fire Department]:[yellow] We've extinguished ${totalRemoved} fires.`);
			}, 6.1);
		}
	},
	status: {
		args: [],
		description: "Displays server status.",
		handler({output}){
			if(Vars.state.isMenu()) fail(`Status: Server closed.`);
			const uptime = Packages.java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
			let numStaff = 0;
			FishPlayer.forEachPlayer(p => {
				if(p.ranksAtLeast("mod")) numStaff ++;
			});
			const uptimeColor =
				uptime < Duration.days(2) ? "" :
				uptime < Duration.days(5) ? "&ly" :
				uptime < Duration.days(9) ? "&y" :
				"&br";
			output(`
Status:
Playing on map &fi${Vars.state.map.plainName()}&fr for ${formatTime(1000 * Vars.state.tick / 60)}
${Vars.state.rules.waves ? `Wave &c${Vars.state.wave}&fr, &c${Math.ceil(Vars.state.wavetime / 60)}&fr seconds until next wave.\n` : ""}\
&c${Groups.unit.size()}&fr units, &c${Vars.state.enemies}&fr enemies, &c${Groups.build.size()}&fr buildings
TPS: ${colorNumber(Core.graphics.getFramesPerSecond(), f => f > 58 ? "&g" : f > 30 ? "&y" : f > 10 ? "&r" : "&br&w", "server")}, \
Memory: &c${Math.round(Core.app.getJavaHeap() / 1048576)}&fr MB
Server uptime: ${uptimeColor}${formatTime(uptime)}&fr (since ${formatTimestamp(Date.now() - uptime)})
${[
	fishState.restartQueued ? "&by&lwRestart queued&fr" : "",
	fishState.restartLoopTask ? "&by&lwRestarting now&fr" : "",
	FishPlayer.antiBotMode() ? "&br&wANTIBOT ACTIVE!&fr" + getAntiBotInfo("server") : "",
].filter(l => l.length > 0).join("\n")}\

${colorNumber(Groups.player.size(), n => n > 0 ? "&c" : "&lr", "server")} players online, ${colorNumber(numStaff, n => n > 0 ? "&c" : "&lr", "server")} staff members.
${FishPlayer.mapPlayers(p =>
	`\t${p.rank.shortPrefix} &c${p.uuid}&fr &c${p.name}&fr`
).join("\n") || "&lrNo players connected.&fr"}
`
			);
		}
	},
	tmux: {
		args: ["attach:string"],
		description: "Oopsie",
		handler(){
			fail(`You are already in the Mindustry server console. Please regain situational awareness before running any further commands.`);
		}
	},
	BEGIN: {
		args: ["transaction:string"],
		description: "Oopsie",
		handler({args}){
			if(args.transaction == "TRANSACTION") fail(`Not possible :( please download and run locally, and make a backup`);
			else fail(`Command not found. Did you mean "BEGIN TRANSACTION"?`);
		}
	},
	prune: {
		args: ["confirm:boolean?"],
		description: "Prunes fish player data",
		handler({args, admins, outputSuccess, outputFail}){
			const playersToPrune = Object.values(FishPlayer.cachedPlayers)
				.filter(player => {
					if(player.hasData()) return false;
					const data = admins.getInfoOptional(player.uuid);
					return (
						!data ||
						data.timesJoined == 1 ||
						(data.timesJoined < 10 &&
							(Date.now() - player.lastJoined) > Duration.months(1)
						)
					);
				});
			if(args.confirm){
				outputSuccess("Creating backup...");
				const backupScript = Core.settings.getDataDirectory().child("backup.sh");
				if(!backupScript.exists()) fail(`./backup.sh does not exist! aborting`);
				const backupProcess = new ProcessBuilder(backupScript.absolutePath())
					.directory(Core.settings.getDataDirectory().file())
					.redirectErrorStream(true)
					.redirectOutput(ProcessBuilder.Redirect.INHERIT)
					.start();
				Threads.daemon(() => { //dont block main thread
					backupProcess.waitFor();
					if(backupProcess.exitValue() == 0){
						outputSuccess(`Successfully created a backup.`);
						Core.app.post(() => { //back to main thread, modifying fish player
							playersToPrune.forEach(u => {delete FishPlayer.cachedPlayers[u.uuid];});
							outputSuccess(`Pruned ${playersToPrune.length} players.`);
						});
					} else {
						outputFail(`Backup failed!`);
					}
				});
			} else {
				outputSuccess(`Pruning would remove fish data for ${playersToPrune.length} players with no data and (1 join or inactive with <10 joins). (Mindustry data will remain.)\nRun "prune y" to prune data.`);
			}
		}
	},
	backup: {
		args: [],
		description: "Creates a backup of the settings.bin file.",
		handler({output, outputFail, outputSuccess}){
			output("Creating backup...");
			const backupScript = Core.settings.getDataDirectory().child("backup.sh");
			if(!backupScript.exists()) fail(`./backup.sh does not exist! aborting`);
			const backupProcess = new ProcessBuilder(backupScript.absolutePath())
				.directory(Core.settings.getDataDirectory().file())
				.redirectErrorStream(true)
				.redirectOutput(ProcessBuilder.Redirect.INHERIT)
				.start();
			Threads.daemon(() => {
				backupProcess.waitFor();
				if(backupProcess.exitValue() == 0) outputSuccess(`Successfully created a backup.`);
				else outputFail(`Backup failed!`);
			});
		}
	},
	updateMaps: {
		args: [],
		description: 'Attempt to fetch and update all map files',
		handler({output, outputSuccess, outputFail}){
			output(`Updating maps... (this may take a while)`);
			updateMaps()
				.then((changed) => outputSuccess(changed ? `Maps were updated.` : `Map update completed, already up to date.`))
				.catch((message) => outputFail(`Map update failed: ${String(message)}`));
		},
	},
	switchall: {
		args: ["server:string"],
		description: "Forces all currently online players to another server.",
		handler({args}){
			if(ipPortPattern.test(args.server)){
				Groups.player.each(target => {
					//direct connect
					Call.connect(target.con, ...args.server.split(":"));
				});
			} else {
				const server = FishServer.byName(args.server)
					?? fail(`Unknown server ${args.server}. Valid options: ${FishServer.all.map(s => s.name).join(", ")}`);
				Groups.player.each(target => {
					Call.connect(target.con, server.ip, server.port);
				});
			}
		}
	},
	mute: {
		args: ['player:player'],
		description: 'Stops a player from chatting.',
		async handler({args, outputSuccess, f}){
			if(args.player.muted) fail(f`Player ${args.player} is already muted.`);
			await args.player.mute("console");
			logAction('muted', "console", args.player);
			outputSuccess(f`Muted player ${args.player}.`);
		}
	},

	unmute: {
		args: ['player:player'],
		description: 'Unmutes a player',
		async handler({args, outputSuccess, f}){
			if(!args.player.muted && args.player.autoflagged) fail(f`Player ${args.player} is not muted, but they are autoflagged. You probably want to free them with /free.`);
			if(!args.player.muted) fail(f`Player ${args.player} is not muted.`);
			await args.player.unmute("console");
			logAction('unmuted', "console", args.player);
			outputSuccess(f`Unmuted player ${args.player}.`);
		}
	},

	free: {
		args: ['player:player'],
		description: 'Frees a player.',
		async handler({args, outputSuccess, outputFail, f}){
			if(args.player.marked()){
				await args.player.free("console");
				logAction('freed', "console", args.player);
				outputSuccess(f`Player ${args.player} has been unmarked.`);
			} else if(args.player.autoflagged){
				args.player.autoflagged = false;
				if(args.player.connected()){
					args.player.sendMessage("[yellow]You have been unflagged.");
					args.player.updateName();
					args.player.forceRespawn();
				}
				outputSuccess(f`Player ${args.player} has been unflagged.`);
			} else {
				outputFail(f`Player ${args.player} is not marked or autoflagged.`);
			}
		}
	},
});
