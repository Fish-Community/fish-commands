/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the in-game chat commands that can be run by trusted staff.
*/

import * as api from "/api";
import { Gamemode, Mode, rules, stopAntiEvadeTime } from "/config";
import { updateMaps } from "/files";
import * as fjsContext from "/fjsContext";
import { command, commandList, fail, Perm, Req } from "/frameworks/commands";
import { Menu } from "/frameworks/menus";
import { crash, Duration, escapeStringColorsClient, escapeTextDiscord, parseError, setToArray } from "/funcs";
import { FishEvents, fishState, ipPattern, maxTime, uuidPattern } from "/globals";
import { FishPlayer } from "/players";
import { Rank } from "/ranks";
import { addToTileHistory, applyEffectMode, definitelyRealMemoryCorruption, formatTime, formatTimeRelative, getAntiBotInfo, logAction, match, serverRestartLoop, untilForever, updateBans } from "/utils";

export const commands = commandList({
	warn: {
		args: ['player:player', 'message:string?'],
		description: 'Sends the player a warning (menu popup).',
		perm: Perm.warn,
		requirements: [Req.cooldown(3000)],
		handler({args, sender, outputSuccess, f}){
			if(args.player.hasPerm("blockTrolling")) fail(f`Player ${args.player} is insufficiently trollable.`);

			const message = args.message ?? "You have been warned. I suggest you stop what you're doing";
			Menu.menu('Warning', message, ["[green]Accept"], args.player, { onCancel: 'null' })
				.then(() => outputSuccess('Player acknowledged the warning.'));
			logAction('warned', sender, args.player, message);
			outputSuccess(f`Warned player ${args.player} for "${message}"`);
		}
	},

	mute: {
		args: ['player:player'],
		description: 'Stops a player from chatting.',
		perm: Perm.mod,
		requirements: [Req.moderate("player")],
		async handler({args, sender, outputSuccess, f}){
			if(args.player.muted) fail(f`Player ${args.player} is already muted.`);
			await args.player.mute(sender);
			logAction('muted', sender, args.player);
			outputSuccess(f`Muted player ${args.player}.`);
		}
	},

	unmute: {
		args: ['player:player'],
		description: 'Unmutes a player',
		perm: Perm.mod,
		async handler({args, sender, outputSuccess, f}){
			if(!args.player.muted && args.player.autoflagged) fail(f`Player ${args.player} is not muted, but they are autoflagged. You probably want to free them with /free.`);
			if(!args.player.muted) fail(f`Player ${args.player} is not muted.`);
			await args.player.unmute(sender);
			logAction('unmuted', sender, args.player);
			outputSuccess(f`Unmuted player ${args.player}.`);
		}
	},

	kick: {
		args: ["player:player", "duration:time?", "reason:string?"],
		description: 'Kick a player with optional reason.',
		perm: Perm.mod,
		requirements: [Req.moderate("player")],
		handler({args, outputSuccess, f, sender}){
			if(!sender.hasPerm("admin") && args.duration && args.duration > Duration.hours(6)) fail(`Maximum kick duration is 6 hours.`);
			const reason = args.reason ?? "A staff member did not like your actions.";
			const duration = args.duration ?? 60_000;
			args.player.kick(reason, duration);
			logAction("kicked", sender, args.player, args.reason ?? undefined, duration);
			if(duration > 60_000) args.player.setPunishedIP(stopAntiEvadeTime);
			outputSuccess(f`Kicked player ${args.player} for ${formatTime(duration)} with reason "${reason}"`);
		}
	},

	pardon: {
		args: ["player:offlinePlayer"],
		description: 'Pardons a votekicked player.',
		perm: Perm.mod,
		requirements: [Req.moderate("player")],
		handler({args: {player}, admins, outputSuccess, f}){
			const info = admins.getInfo(player.uuid);
			if(Time.millis() > info.lastKicked && !admins.kickedIPs.containsKey(info.lastIP))
				fail(`That player is not kicked.`);
			info.lastKicked = 0;
			admins.kickedIPs.remove(info.lastIP);
			outputSuccess(f`Pardoned player ${player}.`);
		}
	},

	stop: {
		args: ['player:player', "time:time?", "message:string?"],
		description: 'Stops a player.',
		perm: Perm.mod,
		requirements: [Req.moderate("player", true)],
		async handler({args, sender, outputSuccess, f}){
			if(args.player.marked()){
				//overload: overwrite stoptime
				if(!args.time) fail(f`Player ${args.player} is already marked.`);
				const previousTime = formatTimeRelative(args.player.unmarkTime, true);
				await args.player.updateStopTime(args.time);
				outputSuccess(f`Player ${args.player}'s stop time has been updated to ${formatTime(args.time)} (was ${previousTime}).`);
				logAction("updated stop time of", sender, args.player, args.message ?? undefined, args.time);
			} else {
				const time = args.time ?? untilForever();
				if(time + Date.now() > maxTime) fail(`Error: time too high.`);
				await args.player.stop(sender, time, args.message ?? undefined);
				logAction('stopped', sender, args.player, args.message ?? undefined, time);
				//TODO outputGlobal()
				Call.sendMessage(`[orange]Player "${args.player.prefixedName}[orange]" has been marked for ${formatTime(time)}${args.message ? ` with reason: [white]${args.message}[]` : ""}.`);
			}

		}
	},

	free: {
		args: ['player:player'],
		description: 'Frees a player.',
		perm: Perm.mod,
		async handler({args, sender, outputSuccess, outputFail, f}){
			if(args.player.marked()){
				await args.player.free(sender);
				logAction('freed', sender, args.player);
				outputSuccess(f`Player ${args.player} has been unmarked.`);
			} else if(args.player.autoflagged){
				args.player.autoflagged = false;
				args.player.sendMessage("[yellow]You have been freed! Enjoy!");
				args.player.updateName();
				args.player.forceRespawn();
				outputSuccess(f`Player ${args.player} has been unflagged.`);
			} else {
				outputFail(f`Player ${args.player} is not marked or autoflagged.`);
			}
		}
	},

	setrank: {
		args: ["player:player", "rank:rank"],
		description: "Set a player's rank.",
		perm: Perm.mod,
		requirements: [Req.moderate("player")],
		async handler({args:{rank, player}, outputSuccess, f, sender}){
			if(rank.level >= sender.rank.level)
				fail(f`You do not have permission to promote players to rank ${rank}, because your current rank is ${sender.rank}`);
			if(rank == Rank.pi && !Mode.localDebug) fail(f`Rank ${rank} is immutable.`);
			if(player.immutable() && !Mode.localDebug) fail(f`Player ${player} is immutable.`);
			if(player == sender && rank.level < sender.rank.level){
				Menu.confirmDangerous(sender, "[red] ARE YOU SURE YOU WANT TO SELF DEMOTE. THIS ACTION CANNOT BE UNDONE!").then(async (res) => {
					if(res == "[red]Yes, Demote"){
						await player.setRank(rank);
						logAction(`${sender} demoted themselves to ${rank}`);
						outputSuccess(f`You have set your own rank to ${rank}`);
					}
				})
			} else {
				await player.setRank(rank);
				logAction(`set rank to ${rank.name} for`, sender, player);
				outputSuccess(f`Set rank of player ${player} to ${rank}`);
			}
		}
	},

	setflag: {
		args: ["player:player", "flag:roleflag", "value:boolean"],
		description: "Set a player's role flags.",
		perm: Perm.mod,
		requirements: [Req.moderate("player")],
		async handler({args:{flag, player, value}, sender, outputSuccess, f}){
			if(!sender.hasPerm("admin") && !flag.assignableByModerators)
				fail(f`You do not have permission to change the value of role flag ${flag}`);

			await player.setFlag(flag, value);
			logAction(`set roleflag ${flag.name} to ${value} for`, sender, player);
			outputSuccess(f`Set role flag ${flag} of player ${player} to ${value}`);
		}
	},

	murder: {
		args: [],
		description: 'Kills all ohno units',
		perm: Perm.mod,
		customUnauthorizedMessage: `[yellow]You're a [scarlet]monster[].`,
		handler({output, f, allCommands}){
			const Ohnos = allCommands["ohno"].data!; //this is not ideal... TODO commit omega shenanigans
			const numOhnos = Ohnos.amount();
			Ohnos.killAll();
			output(f`[orange]You massacred ${numOhnos} helpless ohno crawlers.`);
		}
	},

	stop_offline: {
		args: ["time:time?", "name:string?"],
		description: "Stops an offline player.",
		perm: Perm.mod,
		async handler({args, sender, outputFail, outputSuccess, f, admins}){
			const maxPlayers = 60;
			
			async function stop(option:PlayerInfo, time:number){
				const fishP = FishPlayer.getFromInfo(option);
				if(sender.canModerate(fishP, true)){
					logAction(fishP.marked() ? time == 1000 ? "freed" : "updated stop time of" : "stopped", sender, option, undefined, time);
					await fishP.stop(sender, time);
					outputSuccess(f`Player ${option} was marked for ${formatTime(time)}.`);
				} else {
					outputFail(`You do not have permission to stop this player.`);
				}
			}
			
			if(args.name && uuidPattern.test(args.name)){
				const info:PlayerInfo | null = admins.getInfoOptional(args.name);
				if(info != null) {
					await stop(info, args.time ?? untilForever());
				} else {
					outputFail(f`Unknown UUID ${args.name}`);
				}
				return;
			}

			let possiblePlayers:PlayerInfo[];
			if(args.name) {
				possiblePlayers = setToArray(admins.searchNames(args.name));
				if(possiblePlayers.length > maxPlayers){
					const exactPlayers = setToArray(admins.findByName(args.name));
					if(exactPlayers.length > 0){
						possiblePlayers = exactPlayers;
					} else {
						fail("Too many players with that name.");
					}
				} else if(possiblePlayers.length == 0){
					fail("No players with that name were found.");
				}
				const score = (data:PlayerInfo) => {
					const fishP = FishPlayer.getById(data.id);
					if(fishP) return fishP.lastJoined;
					return - data.timesJoined;
				};
				possiblePlayers.sort((a, b) => score(b) - score(a));
			} else {
				possiblePlayers = FishPlayer.recentLeaves.map(p => p.info());
			}


			const optionPlayer = await Menu.menu("Stop", "Choose a player to mark", possiblePlayers, sender, {
				includeCancel: true,
				optionStringifier: p => p.lastName
			});
			args.time ??= match(
				await Menu.menu("Stop", "Select stop time", ["2 days", "7 days", "30 days", "forever"], sender),
				{
					"2 days": Duration.days(2),
					"7 days": Duration.days(7),
					"30 days": Duration.days(30),
					"forever": maxTime - Date.now() - 10000,
				}
			);
			await stop(optionPlayer, args.time);
		}
	},

	mute_offline: {
		args: ["name:string?"],
		description: "Mutes an offline player.",
		perm: Perm.mod,
		async handler({args, sender, outputSuccess, f, admins}){
			const maxPlayers = 300;
			
			async function mute(option:PlayerInfo){
				const fishP = FishPlayer.getFromInfo(option);
				if(!sender.canModerate(fishP, true)) fail(`You do not have permission to mute this player.`);
				await Menu.confirm(sender, `Are you sure you want to ${fishP.muted ? "unmute" : "mute"} player ${option.lastName}?`, {
					title: "Mute Offine Confirmation",
					confirmText: `[green]Yes, ${fishP.muted ? "unmute" : "mute"} them`,
				});
				logAction(fishP.muted ? "unmuted" : "muted", sender, fishP);
				if(fishP.muted) await fishP.unmute(sender);
				else await fishP.mute(sender);
				outputSuccess(`${fishP.muted ? "Muted" : "Unmuted"} ${option.lastName}.`);
			}
			
			if(args.name && uuidPattern.test(args.name)){
				const info = admins.getInfoOptional(args.name) ?? fail(f`Unknown UUID ${args.name}`);
				await mute(info);
				return;
			}

			let possiblePlayers:PlayerInfo[];
			if(args.name) {
				possiblePlayers = setToArray(admins.searchNames(args.name));
				if(possiblePlayers.length > maxPlayers){
					const exactPlayers = setToArray(admins.findByName(args.name));
					if(exactPlayers.length > 0){
						possiblePlayers = exactPlayers;
					} else {
						fail("Too many players with that name.");
					}
				} else if(possiblePlayers.length == 0){
					fail("No players with that name were found.");
				}
				const score = (data:PlayerInfo) => {
					const fishP = FishPlayer.getById(data.id);
					if(fishP) return fishP.lastJoined;
					return - data.timesJoined;
				};
				possiblePlayers.sort((a, b) => score(b) - score(a));
			} else {
				possiblePlayers = FishPlayer.recentLeaves.map(p => p.info());
			}


			const option = await Menu.pagedList(sender, "Mute", "Choose a player to mute", possiblePlayers, {
				optionStringifier: p => p.lastName
			});
			await mute(option);
		}
	},

	restart: {
		args: [],
		description: "Stops and restarts the server. Do not run when the player count is high.",
		perm: Perm.admin,
		handler(){
			serverRestartLoop(30);
		}
	},

	history: {
		args: ["player:player"],
		description: "Shows moderation history for a player.",
		perm: Perm.mod,
		handler({args, output, f}){
			if(args.player.history && args.player.history.length > 0){
				output(
					`[yellow]_______________Player history_______________\n\n` +
					(args.player).history.sort((a, b) => a.time - b.time).map(e =>
						`${e.by} [yellow]${e.action} ${args.player.prefixedName} [white]${formatTimeRelative(e.time)}`
					).join("\n")
				);
			} else {
				output(f`[yellow]No history was found for player ${args.player}.`);
			}
		}
	},

	save: {
		args: [],
		description: "Saves the game state.",
		perm: Perm.mod,
		handler({outputSuccess}){
			FishPlayer.saveAll();
			FishEvents.fire("saveData", []);
			const file = Vars.saveDirectory.child(`1.${Vars.saveExtension}`);
			SaveIO.save(file);
			outputSuccess("Game saved.");
		}
	},

	wave: {
		args: ["wave:number"],
		description: "Sets the wave number.",
		perm: Perm.admin,
		handler({args, outputSuccess, f}){
			if(args.wave < 0) fail(`Wave must be positive.`);
			if(!Number.isSafeInteger(args.wave)) fail(`Wave must be an integer.`);
			Vars.state.wave = args.wave;
			outputSuccess(f`Set wave to ${Vars.state.wave}`);
		}
	},

	label: {
		args: ["time:time", "message:string"],
		description: "Places a label at your position for a specified amount of time.",
		perm: Perm.mod,
		handler({args, sender, outputSuccess, f}){
			if(args.time > Duration.hours(10)) fail(`Time must be less than 10 hours.`);
			const unit = sender.unit() ?? fail(`You must be in a unit to use this command.`);
			let timeRemaining = args.time / 1000;
			const labelx = unit.x;
			const labely = unit.y;
			fishState.labels.push(Timer.schedule(() => {
				if(timeRemaining > 0){
					const timeseconds = timeRemaining % 60;
					const timeminutes = (timeRemaining - timeseconds) / 60;
					Call.label(
`${sender.name}

[white]${args.message}

[acid]${timeminutes.toString().padStart(2, "0")}:${timeseconds.toString().padStart(2, "0")}`,
						1, labelx, labely
					);
					timeRemaining --;
				}
			}, 0, 1, args.time));
			outputSuccess(f`Placed label "${args.message}" for ${timeRemaining} seconds.`);
		}
	},

	labelsticky: {
		args: ["time:time", "message:string"],
		description: "Places a label at the bottom left corner of everyone's screen.",
		perm: Perm.admin,
		handler({args, outputSuccess, f}){
			if(args.time > Duration.hours(10)) fail(`Time must be less than 10 hours.`);
			let timeRemaining = args.time / 1000;
			fishState.labels.push(Timer.schedule(() => {
				if(timeRemaining > 0){
					Call.label(args.message, 5, NaN, NaN);
					timeRemaining -= 5;
				}
			}, 0, 5, Math.ceil(args.time / 5)));
			outputSuccess(f`Placed label "${args.message}" for ${timeRemaining} seconds.`);
		}
	},

	clearlabels: {
		args: [],
		description: "Removes all labels.",
		perm: Perm.mod,
		handler({outputSuccess}){
			fishState.labels.forEach(l => l.cancel());
			outputSuccess(`Removed all labels.`);
		}
	},

	member: {
		args: ["value:boolean", "player:player"],
		description: "Sets a player's member status.",
		perm: Perm.admin,
		async handler({args, outputSuccess, f}){
			await args.player.setFlag("member", args.value);
			outputSuccess(f`Set membership status of player ${args.player} to ${args.value}.`);
		}
	},
	remind: {
		args: ["rule:number", "target:player?"],
		description: "Remind players in chat of a specific rule.",
		perm: Perm.mod,
		handler({args, outputSuccess, f}){
			const rule = rules[args.rule - 1] ?? fail(`The rule you requested does not exist.`);
			if(args.target){
				args.target.sendMessage(`A staff member wants to remind you of the following rule:\n` + rule);
				outputSuccess(f`Reminded ${args.target} of rule ${args.rule}`);
			} else {
				Call.sendMessage(`A staff member wants to remind everyone of the following rule:\n` + rule);
			}
		},
	},

	ban: {
		args: ["uuid_or_ip:string?"],
		description: "Bans a player by UUID and IP.",
		perm: Perm.admin,
		async handler({args, sender, outputSuccess, f, admins}){
			if(args.uuid_or_ip && uuidPattern.test(args.uuid_or_ip)){
				//Overload 1: ban by uuid
				const uuid = args.uuid_or_ip;
				let data:PlayerInfo | null;
				if((data = admins.getInfoOptional(uuid)) != null && data.admin) fail(`Cannot ban an admin.`);
				const name = data ? `${escapeStringColorsClient(data.lastName)} (${uuid}/${data.lastIP})` : uuid;
				await Menu.confirmDangerous(sender, `Are you sure you want to ban ${name}?`);
				admins.banPlayerID(uuid);
				if(data){
					const ip = data.lastIP;
					admins.banPlayerIP(ip);
					api.ban({ip, uuid});
					Log.info(`${uuid}/${ip} was banned.`);
					logAction("banned", sender, data);
					outputSuccess(f`Banned player ${escapeStringColorsClient(data.lastName)} (${uuid}/${ip})`);
					//TODO add way to specify whether to activate or escape color tags
				} else {
					api.ban({uuid});
					Log.info(`${uuid} was banned.`);
					logAction("banned", sender, uuid);
					outputSuccess(f`Banned player ${uuid}. [yellow]Unable to determine IP.[]`);
				}
				updateBans(player => `[scarlet]Player [yellow]${player.name}[scarlet] has been whacked by ${sender.prefixedName}.`);
				return;
			} else if(args.uuid_or_ip && ipPattern.test(args.uuid_or_ip)){
				//Overload 2: ban by uuid
				const ip = args.uuid_or_ip;
				await Menu.confirmDangerous(sender, `Are you sure you want to ban IP ${ip}?`);

				api.ban({ip});
				const info = admins.findByIP(ip);
				if(info) logAction("banned", sender, info);
				else logAction(`banned ${ip}`, sender);

				const alreadyBanned = admins.banPlayerIP(ip);
				if(alreadyBanned){
					outputSuccess(f`IP ${ip} is already banned. Ban was synced to other servers.`);
				} else {
					outputSuccess(f`IP ${ip} has been banned. Ban was synced to other servers.`);
				}
				
				updateBans(player => `[scarlet]Player [yellow]${player.name}[scarlet] has been whacked by ${sender.prefixedName}.`);
				return;
			}
			//Overload 3: ban by menu
			const option = await Menu.menu(`[scarlet]BAN[]`, "Choose a player to ban.", setToArray(Groups.player), sender, {
				includeCancel: true,
				optionStringifier: opt => opt.name
			});
			if(option.admin) fail(`Cannot ban an admin.`);
			await Menu.confirmDangerous(sender, `Are you sure you want to ban ${option.name}?`);
			admins.banPlayerIP(option.ip()); //this also bans the UUID
			api.ban({ip: option.ip(), uuid: option.uuid()});
			Log.info(`${option.ip()}/${option.uuid()} was banned.`);
			logAction("banned", sender, option.getInfo());
			outputSuccess(f`Banned player ${option}.`);
			updateBans(player => `[scarlet]Player [yellow]${player.name}[scarlet] has been whacked by ${sender.prefixedName}.`);
		}
	},

	kill: {
		args: ["player:player"],
		description: "Kills a player's unit.",
		perm: Perm.admin,
		requirements: [Req.moderate("player", true)],
		handler({args, outputFail, outputSuccess, f}){

			const unit = args.player.unit();
			if(unit){
				unit.kill();
				outputSuccess(f`Killed the unit of player ${args.player}.`);
			} else {
				outputFail(f`Player ${args.player} does not have a unit.`);
			}
		}
	},
	killunits: {
		args: ["team:team?", "unit:unittype?"],
		description: "Kills all units, optionally specifying a team and unit type.",
		perm: Perm.massKill,
		async handler({args:{team, unit}, sender, outputSuccess, f}){
			if(team){
				await Menu.confirmDangerous(sender,
					`This will kill [scarlet]every ${unit ? unit.localizedName : "unit"}[] on the team ${team.coloredName()}.`,
					{ confirmText: "[orange]Kill units[]" },
				);
				if(unit){
					let i = 0;
					team.data().units.each(u => u.type == unit, u => {
						u.kill();
						i ++;
					});
					outputSuccess(f`Killed ${i} units on ${team}.`);
				} else {
					const before = team.data().units.size;
					team.data().units.each(u => u.kill());
					outputSuccess(f`Killed ${before} units on ${team}.`);
				}
			} else {
				await Menu.confirmDangerous(sender,
					`This will kill [scarlet]every single ${unit ? unit.localizedName : "unit"}[].`,
					{ confirmText: "[orange]Kill all units[]" },
				);
				if(unit){
					let i = 0;
					Groups.unit.each(u => u.type == unit, u => {
						u.kill();
						i ++;
					});
					outputSuccess(f`Killed ${i} units.`);
				} else {
					const before = Groups.unit.size();
					Groups.unit.each(u => u.kill());
					outputSuccess(f`Killed ${before} units.`);
				}
			}
		}
	},
	killbuildings: {
		args: ["team:team?"],
		description: "Kills all buildings (except cores), optionally specifying a team.",
		perm: Perm.massKill,
		async handler({args:{team}, sender, outputSuccess, f}){
			if(team){
				await Menu.confirmDangerous(sender,
					`This will kill [scarlet]every building[] on the team ${team.coloredName()}, except cores.`,
					{ confirmText: "[orange]Kill buildings[]" },
				);
				const count = team.data().buildings.size;
				team.data().buildings.each(b => !(b.block instanceof CoreBlock), b => b.tile.remove());
				outputSuccess(f`Killed ${count} buildings on ${team}.`);
			} else {
				await Menu.confirmDangerous(sender,
					`This will kill [scarlet]every building[] except cores.`,
					{ confirmText: "[orange]Kill buildings[]" },
				);
				const count = Groups.build.size();
				Groups.build.each(b => !(b.block instanceof CoreBlock), b => b.tile.remove());
				outputSuccess(f`Killed ${count} buildings.`);
			}
		}
	},

	respawn: {
		args: ["player:player"],
		description: "Forces a player to respawn.",
		perm: Perm.mod,
		requirements: [Req.moderate("player", true, "mod", true)],
		handler({args, outputSuccess, f}){
			args.player.forceRespawn();
			outputSuccess(f`Respawned player ${args.player}.`);
		}
	},

	stealunit: {
		args: ["target:player", "newcontroller:player?"],
		description: "Steals the unit of a player, putting you in their unit and forcing them to respawn.",
		perm: Perm.mod,
		requirements: [Req.moderate("target", true, "mod", true), Req.moderate("newcontroller", true, "mod", true)],
		handler({sender, args:{target, newcontroller = sender}, outputSuccess, f}){
			const unit = target.unit() ?? fail(f`Targeted player ${target} is not in a unit.`);
			if(target.team() !== newcontroller.team()){
				if(!sender.hasPerm("changeTeamExternal")){
					if(!sender.hasPerm("changeTeam")) fail(`You do not have permission to change teams.`);
					newcontroller.setTeam(unit.team);
				}
			}
			target.forceRespawn();
			newcontroller.unit(unit);
			if(newcontroller == sender){
				outputSuccess(f`Commandeered the unit of player ${target}.`);
			} else {
				outputSuccess(f`Transferred player ${newcontroller} into the unit of ${target}.`);
				newcontroller.sendMessage(f`[green]You were transferred to the unit of player ${target} by ${sender}.`('[green]'));
			}
		}
	},

	m: {
		args: ["message:string"],
		description: `Sends a message to muted players only.`,
		perm: Perm.mod,
		handler({sender, args}){
			FishPlayer.messageMuted(sender.prefixedName, args.message);
		}
	},

	info: {
		args: ["target:player", "showColors:boolean?"],
		description: "Displays information about an online player.",
		perm: Perm.none,
		handler({sender, args, output, f}){
			const info = args.target.info();
			const names = args.showColors
				? info.names.map(escapeStringColorsClient).toString(", ")
				: [...new Set(info.names.map(n => Strings.stripColors(n)).toArray())].join(", ");
			output(f`\
[accent]Info for player ${args.target} [gray](${escapeStringColorsClient(args.target.name)}) (#${args.target.player!.id.toString()})
	[accent]Rank: ${args.target.rank}
	[accent]Role flags: ${Array.from(args.target.flags).map(f => f.coloredName()).join(" ")}
	[accent]Stopped: ${f.boolBad(!args.target.hasPerm("play"))}
	[accent]marked: ${args.target.marked() ? `until ${formatTimeRelative(args.target.unmarkTime)}` : "[green]false"}
	[accent]muted: ${f.boolBad(args.target.muted)}
	[accent]autoflagged: ${f.boolBad(args.target.autoflagged)}
	[accent]VPN detected: ${f.boolBad(args.target.ipDetectedVpn)}
	[accent]times joined / kicked: ${info.timesJoined}/${info.timesKicked}
	[accent]First joined: ${args.target.firstJoined < 1 ? "unknown" : formatTimeRelative(args.target.firstJoined)}
	[accent]Names used: [[${names}]`
			);
			if(sender.hasPerm("viewUUIDs"))
				output(f`\
	[#FFAAAA]UUID: ${args.target.uuid}
	[#FFAAAA]IP: ${args.target.ip()}`
				);
		}
	},

	spawn: {
		args: ["type:unittype", "x:number?", "y:number?", "count:number?", "team:team?", "effects:string?", "stack:boolean?"],
		description: "Spawns a unit of specified type at your position. [scarlet]Usage will be logged.[]",
		perm: Perm.admin,
		data: [],
		handler({sender, args, data, outputSuccess, f}){
			const x = args.x ? (args.x * 8) : sender.player!.x;
			const y = args.y ? (args.y * 8) : sender.player!.y;
			const team = args.team ?? sender.team();
			const count = Math.min(args.count ?? 1, 1000);
			for(let i = 0; i < count; i ++){
				const unit = args.type.create(team);
				const xOffset = args.stack ? 0 : 0.01 * i;
				const yOffset = args.stack ? 0 : 0.5 * (i % 10);
				unit.set(x + xOffset, y + yOffset);
				if(args.effects) applyEffectMode(args.effects, unit, 1e12);
				unit.add();
				data.push(unit);
			}
			if(!Gamemode.sandbox() && args.effects !== 'paper') logAction(`spawned unit ${args.type.name}${count == 1 ? '' : ` x${count}`} at ${Math.round(x / 8)}, ${Math.round(y / 8)}` + (args.effects ? `with ${args.effects} effects` : ''), sender);
			outputSuccess(f`Spawned unit ${args.type} at (${Math.round(x / 8)}, ${Math.round(y / 8)})`);
		}
	},
	setblock: {
		args: ["x:number", "y:number", "block:block", "team:team?", "rotation:number?"],
		description: "Sets the block at a location.",
		perm: Perm.admin,
		handler({args, sender, outputSuccess, f}){
			const team = args.team ?? sender.team();
			const tile = Vars.world.tile(args.x, args.y);
			if(args.rotation != null && (args.rotation < 0 || args.rotation > 3)) fail(f`Invalid rotation ${args.rotation}`);
			if(tile == null)
				fail(f`Position (${args.x}, ${args.y}) is out of bounds.`);
			tile.setNet(args.block, team, args.rotation ?? 0);
			addToTileHistory({
				pos: `${args.x},${args.y}`,
				uuid: sender.uuid,
				action: `setblocked`,
				type: args.block.localizedName
			});
			if(!Gamemode.sandbox()) logAction(`set block to ${args.block.localizedName} at ${args.x},${args.y}`, sender);
			outputSuccess(f`Set block at ${args.x}, ${args.y} to ${args.block}`);
		}
	},
	setblockr: {
		args: ["block:block?", "team:team?", "rotation:number?"],
		description: "Sets the block at tapped locations, repeatedly.",
		perm: Perm.admin,
		tapped({args, sender, f, x, y, outputSuccess}){
			if(!args.block) crash(`uh oh`);
			const team = args.team ?? sender.team();
			const tile = Vars.world.tile(x, y);
			if(args.rotation != null && (args.rotation < 0 || args.rotation > 3)) fail(f`Invalid rotation ${args.rotation}`);
			if(tile == null)
				fail(f`Position (${x}, ${y}) is out of bounds.`);
			tile.setNet(args.block, team, args.rotation ?? 0);
			addToTileHistory({
				pos: `${x},${y}`,
				uuid: sender.uuid,
				action: `setblocked`,
				type: args.block.localizedName
			});
			if(!Gamemode.sandbox()) logAction(`set block to ${args.block.localizedName} at ${x},${y}`, sender);
			outputSuccess(f`Set block at ${x}, ${y} to ${args.block}`);
		},
		handler({args, outputSuccess, handleTaps, currentTapMode, f}){
			if(args.block){
				handleTaps("on");
				if(currentTapMode == "off"){
					outputSuccess("setblockr enabled.\n[scarlet]Be careful, you have the midas touch now![] Turn it off by running /setblockr again.");
				} else {
					outputSuccess(f`Changed setblockr's block to ${args.block}`);
				}
			} else {
				if(currentTapMode == "off"){
					fail(`Please specify the block to place.`);
				} else {
					handleTaps("off");
					outputSuccess("setblockr disabled.");
				}
			}
		}
	},
	exterminate: {
		args: [],
		description: "Removes all spawned units.",
		perm: Perm.admin,
		handler({sender, outputSuccess, f, allCommands}){
			let numKilled = 0;
			(allCommands.spawn.data as Unit[]).forEach(u => {
				if(u.isAdded() && !u.dead){
					u.kill();
					numKilled ++;
				}
			});
			if(!Gamemode.sandbox()) logAction(`exterminated ${numKilled} units`, sender);
			outputSuccess(f`Exterminated ${numKilled} units.`);
		}
	},
	js: {
		args: ["javascript:string"],
		description: "Run arbitrary javascript.",
		perm: Perm.runJS,
		customUnauthorizedMessage: "[scarlet]You are not in the jsers file. This incident will be reported.[]",
		handler({args: {javascript}, output, outputFail, sender}){
			
			//Additional validation couldn't hurt...
			const playerInfo_AdminUsid = sender.info().adminUsid;
			if(!playerInfo_AdminUsid || playerInfo_AdminUsid != sender.player!.usid() || sender.usid != sender.player!.usid()){
				api.sendModerationMessage(
`# !!!!! /js authentication failed !!!!!
Server: ${Gamemode.name()} Player: ${escapeTextDiscord(sender.cleanedName)}/\`${sender.uuid}\`
<@!709904412033810533>`
				);
				fail(`Authentication failure`);
			}

			if(javascript == "Timer.instance().clear()") fail(`Are you really sure you want to do that? If so, prepend "void" to your command.`);

			try {
				const scripts = Vars.mods.getScripts();
				const out = scripts.context.evaluateString(scripts.scope, javascript, "fish-js-console.js", 1);
				if(out instanceof Array){
					output("[cyan]Array: [[[]" + out.join(", ") + "[cyan]]");
				} else if(out === undefined){
					output("[blue]undefined[]");
				} else if(out === null){
					output("[blue]null[]");
				} else if(out instanceof Error){
					outputFail(parseError(out));
				} else if(typeof out == "number"){
					output(`[blue]${out}[]`);
				} else {
					output(out);
				}
			} catch(err){
				outputFail(parseError(err));
			}
		}
	},
	fjs: {
		args: ["javascript:string"],
		description: "Run arbitrary javascript in the fish-commands context.",
		perm: Perm.runJS,
		customUnauthorizedMessage: "[scarlet]You are not in the jsers file. This incident will be reported.[]",
		handler({args: {javascript}, output, outputFail, sender}){
			
			//Additional validation couldn't hurt...
			const playerInfo_AdminUsid = sender.info().adminUsid;
			if(!playerInfo_AdminUsid || playerInfo_AdminUsid != sender.player!.usid() || sender.usid != sender.player!.usid()){
				api.sendModerationMessage(
`# !!!!! /js authentication failed !!!!!
Server: ${Gamemode.name()} Player: ${escapeTextDiscord(sender.cleanedName)}/\`${sender.uuid}\`
<@!709904412033810533>`
				);
				fail(`Authentication failure`);
			}

			fjsContext.runJS(javascript, output, outputFail, sender);
		}
	},
	antibot: {
		args: ["state:boolean?"],
		description: "Checks anti bot stats, or force enables anti bot mode, MAKE SURE TO TURN IT OFF",
		perm: Perm.admin,
		handler({args, outputSuccess, output, f}){
			if(args.state != undefined){
				FishPlayer.antiBotModeOverride = args.state;
				outputSuccess(`Set antibot mode override to ${f.boolBad(args.state)}.`);
				if(args.state) output(`[scarlet]MAKE SURE TO TURN IT OFF!!!`);
			} else {
				output(
`[acid]Antibot status:
[acid]Enabled: ${f.boolBad(FishPlayer.antiBotMode())}
${getAntiBotInfo("client")}`
				);
			}
		}
	},
	chatstrictness: {
		args: ["player:player", "value:string"],
		description: "Sets chat strictness for a player.",
		perm: Perm.mod,
		handler({args:{player, value}, sender, outputSuccess, f}){
			if(!sender.canModerate(player, true)) fail(`You do not have permission to set the chat strictness level of this player.`);
			if(!(value == "chat" || value == "strict")) fail(`Invalid chat strictness level: valid levels are "chat", "strict"`);
			player.chatStrictness = value;
			logAction(`set chat strictness to ${value} for`, sender, player);
			outputSuccess(f`Set chat strictness for player ${player} to "${value}".`);
		}
	},
	emanate: command(() => {
		const unitMapping:Record<string, Unit> = {};
		Timer.schedule(() => {
			for(const [uuid, unit] of Object.entries(unitMapping)){
				const fishP = FishPlayer.getById(uuid);
				if(!fishP || !fishP.connected() || (unit.getPlayer() != fishP.player)){
					delete unitMapping[uuid];
					unit?.kill();
				}
			}
		}, 1, 0.5);
		return {
			args: [],
			description: "Puts you in an emanate.",
			perm: Perm.admin,
			data: {unitMapping},
			requirements: [],
			handler({sender, outputSuccess}){
				const emanate = UnitTypes.emanate.spawn(sender.team(), sender.player!.x, sender.player!.y);
				sender.player!.unit(emanate);
				unitMapping[sender.uuid] = emanate;
				if(!Gamemode.sandbox()) logAction("spawned an emanate", sender);
				outputSuccess("Spawned an emanate.");
			}
		};
	}),
	updatemaps: {
		args: [],
		description: 'Attempt to fetch and update all map files',
		perm: Perm.trusted,
		requirements: ({sender}) => [Req.cooldownGlobal(Gamemode.testsrv() || sender.hasPerm("mod") ? 15_000 : Duration.minutes(5))],
		handler({output, outputSuccess, outputFail}){
			output(`Updating maps... (this may take a while)`);
			updateMaps()
				.then((changed) => {
					Log.info("Maps updated.");
					if(changed){
						outputSuccess(`Map update completed.`);
						Call.sendMessage(`[orange]Maps have been updated. Run [white]/maps[] to view available maps.`);
					} else {
						outputSuccess(`Map update completed; already up to date.`);
					}
				})
				.catch((message) => {
					outputFail(`Map update failed: ${String(message)}`);
					Log.err(`Map updates failed: ${String(message)}`);
				});
		}
	},
	clearfire: {
		args: [],
		description: "Clears all the fires.",
		perm: Perm.admin,
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
	search: {
		args: ["input:string"],
		description: "Searches playerinfo by name, IP, or UUID.",
		perm: Perm.admin,
		async handler({args:{input}, admins, output, f, sender}){
			if(uuidPattern.test(input)){
				const fishP = FishPlayer.getById(input);
				const info = admins.getInfoOptional(input);
				if(fishP == null && info == null) fail(f`No stored data matched uuid ${input}.`);
				else if(fishP == null && info) output(f`[accent]\
Found player info (but no fish player data) for uuid ${input}
Last name used: "${info.plainLastName()}" [gray](${escapeStringColorsClient(info.lastName)})[] [[${info.names.map(escapeStringColorsClient).items.join(", ")}]
IPs used: ${info.ips.map(i => `[blue]${i}[]`).toString(", ")}`
				);
				else if(fishP && info) output(f`[accent]\
Found fish player data for uuid ${input}
Last name used: "${fishP.name}" [gray](${escapeStringColorsClient(info.lastName)})[] [[${info.names.map(escapeStringColorsClient).items.join(", ")}]
IPs used: ${info.ips.map(i => `[blue]${i}[]`).toString(", ")}`
				);
				else fail(f`Super weird edge case: found fish player data but no player info for uuid ${input}.`);
			} else if(ipPattern.test(input)){
				const matches = admins.findByIPs(input);
				if(matches.isEmpty()) fail(f`No stored data matched IP ${input}`);
				output(f`[accent]Found ${matches.size} match${matches.size == 1 ? "" : "es"} for search "${input}".`);
				matches.each(info => output(f`[accent]\
Player with uuid ${info.id}
Last name used: "${info.plainLastName()}" [gray](${escapeStringColorsClient(info.lastName)})[] [[${info.names.map(escapeStringColorsClient).items.join(", ")}]
IPs used: ${info.ips.map(i => `[blue]${i}[]`).toString(", ")}`
				));
			} else {
				const matches = Vars.netServer.admins.searchNames(input);
				if(matches.isEmpty()) fail(f`No stored data matched name ${input}`);
				output(f`[accent]Found ${matches.size} match${matches.size == 1 ? "" : "es"} for search "${input}".`);
				const displayMatches = () => {
					matches.each(info => output(f`[accent]\
Player with uuid ${info.id}
Last name used: "${info.plainLastName()}" [gray](${escapeStringColorsClient(info.lastName)})[] [[${info.names.map(escapeStringColorsClient).items.join(", ")}]
IPs used: ${info.ips.map(i => `[blue]${i}[]`).toString(", ")}`
					));
				};
				if(matches.size > 20)
					await Menu.confirm(sender, `Are you sure you want to view all ${matches.size} matches?`);
				displayMatches();
			}
		}
	},
	peace: {
		args: ["peace:boolean"],
		description: "Toggles peaceful mode for sandbox.",
		perm: Perm.mod,
		requirements: [Req.mode('sandbox')],
		handler({args}){
			if(args.peace){
				fishState.peacefulMode = true;
				Groups.player.each(p => {
					if(p.team() != Vars.state.rules.defaultTeam){
						p.team(Vars.state.rules.defaultTeam);
					}
				});
				Call.sendMessage(`[[Sandbox] [green]Enabled peaceful mode.`);
			} else {
				fishState.peacefulMode = false;
				Call.sendMessage(`[[Sandbox] [red]Disabled peaceful mode.`);
			}
		},
	},
	effects: {
		args: ["mode:string", "player:player?", "duration:time?"],
		description: "Applies effects to a player's unit.",
		perm: Perm.admin,
		handler({args, sender, f, outputSuccess}){
			if(args.player?.hasPerm("blockTrolling"))
				fail(f`Player ${args.player} is insufficiently trollable.`);
			if(args.player && !sender.canModerate(args.player, false))
				fail(`You do not have permission to perform moderation actions on this player.`);
			const target = args.player ?? sender;
			const unit = target.unit();
			if(!unit || unit.dead) fail(f`${target}'s unit is dead.`);
			const ticks = (args.duration ?? 1e12) / 1000 * 60;
			applyEffectMode(args.mode, unit, ticks);
			outputSuccess(`${args.mode === "clear" ? "Cleared" : "Applied"} effects.`);
			if(!Gamemode.sandbox()) logAction(`applied **${args.mode}** effects to`, sender, target);
		}
	},
	items: {
		args: ["team:team", "item:item", "amount:number"],
		description: "Gives items to a team.",
		perm: Perm.admin,
		handler({args:{team, item, amount}, sender, outputSuccess, f}){
			const core = team.data().cores.firstOpt() ?? fail(f`Team ${team} has no cores.`);
			core.items.add(item, amount);
			outputSuccess(f`Gave ${amount} ${item} to ${team}.`);
			if(!Gamemode.sandbox()) logAction(`gave ${amount} ${item.name} to ${team.name}`, sender);
		}
	},
	explosion: {
		args: ["radius:number", "x:number", "y:number", "team:team?", "damage:number?", "damageMode:string?"],
		description: "Causes an explosion at specified coordinates.",
		perm: Perm.admin,
		handler({args:{
			radius, x, y,
			team = Team.derelict, damage = 1e12,
			damageMode = "both",
		}, outputSuccess}){
			const [air, ground] = match(damageMode, {
				air: [true, false],
				ground: [false, true],
				both: [true, true],
				none: [false, false],
			}) ?? fail(`Valid values of damageMode: air, ground, both, none`);
			if(radius > 100) fail(`Maximum radius is 100`);
			if(damage < 0) Call.effect(Fx.dynamicSpikes, x * 8, y * 8, radius * 8, Pal.heal);
			else Call.effect(Fx.dynamicExplosion, x * 8, y * 8, Math.max(radius, 8) / 7, Color.white);
			Damage.damage(team, x * 8, y * 8, radius * 8, damage, true, air, ground);
			outputSuccess(`Created an explosion at (${x}, ${y}).`);
		}
	},
	memorycorruption: {
		args: [],
		description: "Triggers a fake memory corruption prank.",
		perm: Perm.mod,
		requirements: [Req.cooldownGlobal(Duration.minutes(30))],
		handler(){
			definitelyRealMemoryCorruption();
		}
	}
});
