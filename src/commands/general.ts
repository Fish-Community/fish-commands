/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains most in-game chat commands that can be run by untrusted players.
*/

import * as api from "/api";
import { FishServer, Gamemode, rules, text } from "/config";
import { command, commandList, fail, formatArg, Perm, Req } from "/frameworks/commands";
import type { FishCommandData } from "/frameworks/commands/types";
import { Menu } from "/frameworks/menus";
import { capitalizeText, Duration, escapeTextDiscord, StringBuilder, StringIO, to2DArray } from "/funcs";
import { FishEvents, fishPlugin, fishState, ipPortPattern, recentWhispers, tileHistory, uuidPattern } from "/globals";
import { FMap, PartialMapRun } from "/maps";
import { FishPlayer } from "/players";
import { Rank, RoleFlag } from "/ranks";
import { formatTime, formatTimeRelative, getColor, logAction, nearbyEnemyTile, neutralGameover, outputMessage, skipWaves, teleportPlayer } from "/utils";
import { VoteManager } from "/votes";

export const commands = commandList({
	about: {
		args: [],
		description: 'Prints information about the plugin.',
		perm: Perm.none,
		handler({output}){
			output(
`[accent][cyan]fish-commands[] is the monolithic plugin used for the Fish servers' features.
[accent]==========
[accent]Source code available at: [cyan]https://github.com/Fish-Community/fish-commands/
[accent]Current plugin version: [cyan]${fishPlugin.version?.slice(0, 8) ?? "[scarlet]null[]"}[]`
			);
		}
	},

	unpause: command({
		args: [],
		description: 'Unpauses the game.',
		perm: Perm.trusted,
		requirements: [Req.mode('pvp')],
		init() {
			const data = { unpaused: false };
			Events.on(EventType.PlayEvent, () => {
				if(data.unpaused){
					data.unpaused = false;
					Vars.state.rules.pvpAutoPause = true;
				}
			});
			return data;
		},
		handler({data, outputSuccess}) {
			Vars.state.rules.pvpAutoPause = false;
			data.unpaused = true;
			Core.app.post(() => Vars.state.set(GameState.State.playing));
			outputSuccess(`Unpaused.`);
		},
	}),

	tp: {
		args: ['player:player'],
		description: 'Teleport to another player.',
		perm: Perm.play,
		requirements: [Req.modeNot("pvp")],
		handler({ args, sender }) {
			if(!sender.unit()?.spawnedByCore) fail(`Can only teleport while in a core unit.`);
			if(sender.team() !== args.player.team()) fail(`Cannot teleport to players on another team.`);
			if(sender.unit()!.hasPayload?.()) fail(`Cannot teleport to players while holding a payload.`);
			teleportPlayer(sender.player!, args.player.player!);
		},
	},

	clean: {
		args: [],
		description: 'Removes all boulders from the map.',
		perm: Perm.play,
		requirements: [Req.cooldownGlobal(100_000)],
		handler({sender, outputSuccess}){
			Timer.schedule(
				() => Call.sound(sender.con, Sounds.rockBreak, 1, 1, 0),
				0, 0.05, 10
			);
			Vars.world.tiles.eachTile((t:Tile) => {
				if(t.breakable() && t.block() instanceof Prop){
					t.removeNet();
				}
			});
			outputSuccess(`Cleared the map of boulders.`);
		}
	},

	die: {
		args: [],
		description: 'Kills your unit.',
		perm: Perm.mod.exceptModes({
			sandbox: Perm.play
		}, `You do not have permission to die.`),
		handler({ sender }) {
			sender.unit()?.kill();
		},
	},

	discord: {
		args: [],
		description: 'Takes you to our discord.',
		perm: Perm.none,
		handler({ sender }) {
			Call.openURI(sender.con, text.discordURL);
		},
	},

	tilelog: {
		args: ['persist:boolean?'],
		description: 'Checks the history of a tile.',
		perm: Perm.none,
		handler({args, output, outputSuccess, currentTapMode, handleTaps}){
			if(currentTapMode == "off"){
				if(args.persist){
					handleTaps("on");
					outputSuccess(`Tilelog mode enabled. Click tiles to check their recent history. Run /tilelog again to disable.`);
				} else {
					handleTaps("once");
					output(`Click on a tile to check its recent history...`);
				}
			} else {
				handleTaps("off");
				outputSuccess(`Tilelog disabled.`);
			}
		},
		tapped({tile, x, y, output, sender, admins}){
			const historyData = tileHistory[`${x},${y}`] ?? fail(`There is no recorded history for the selected tile (${tile.x}, ${tile.y}).`);
			const history = StringIO.read(historyData, str => str.readArray(d => ({
				action: d.readString(2),
				uuid: d.readString(3)!,
				time: d.readNumber(16),
				type: d.readString(2),
			}), 1));
			output(`[yellow]Tile history for tile (${tile.x}, ${tile.y}):\n` + history.map(e =>
				uuidPattern.test(e.uuid)
				? (sender.hasPerm("viewUUIDs")
				? `[yellow]${admins.getInfoOptional(e.uuid)?.plainLastName()}[lightgray](${e.uuid})[yellow] ${e.action} a [cyan]${e.type}[] ${formatTimeRelative(e.time)}`
				: `[yellow]${admins.getInfoOptional(e.uuid)?.plainLastName()} ${e.action} a [cyan]${e.type}[] ${formatTimeRelative(e.time)}`)
				: `[yellow]${e.uuid}[yellow] ${e.action} a [cyan]${e.type}[] ${formatTimeRelative(e.time)}`
			).join('\n'));
		}
	},

	aoelog: command(() => {
		const allowedActions = [
			"built", "broke", "rotated", "killed", "configured", "pay-dropped", "picked up", "controlled"
		];
		const cachedPointMap = Object.create(null) as Partial<Record<string, [number, number]>>;
		return {
			args: ['persist:boolean?', 'amount:number?', 'action:string?'],
			description: 'Checks the history of all tiles in the selected region. Can be filtered by action.',
			perm: Perm.none,
			handler({args, sender, outputSuccess, currentTapMode, handleTaps}) {
				if(currentTapMode === "off" || args.action || args.amount) {
					if(args.action && !allowedActions.includes(args.action))
						fail(`Invalid action. Allowed actions: ${allowedActions.join(", ")}`);
					if(args.amount && args.amount > 100) fail(`Limit cannot be greater than 100.`);

					cachedPointMap[sender.uuid] = undefined;
					handleTaps("on");
					outputSuccess(`Aoelog mode enabled. To see the recent history of all tiles in a rectangular region, tap opposite corners of the rectangle. Run /aoelog with no arguments to disable.`);
				} else {
					handleTaps("off");
					outputSuccess(`Aoelog disabled.`);
				}
			},
			tapped({x, y, output, outputFail, sender, admins, handleTaps, args}) {
				function handleArea(p1: [number, number], p2: [number, number]){
					const minX = Math.min(p1[0], p2[0]);
					const maxX = Math.max(p1[0], p2[0]);
					const minY = Math.min(p1[1], p2[1]);
					const maxY = Math.max(p1[1], p2[1]);
					let limitTiles = 0;
					const amount = args.amount != null ? Math.floor(Math.abs(args.amount)) : 10;
					outer:
					for(let i = minX; i <= maxX; i ++){
						for(let j = minY; j <= maxY; j ++){
							const tileData = tileHistory[`${i},${j}`];
							if(!tileData) continue;
							let history = StringIO.read(tileHistory[`${i},${j}`], str => str.readArray(d => ({
								action: d.readString(2) ?? "??",
								uuid: d.readString(3) ?? "??",
								time: d.readNumber(16),
								type: d.readString(2) ?? "??",
							}), 1));
							if(args.action) history = history.filter(e => e.action === args.action);
							if(history.length == 0) continue;
							output(`[yellow]Tile history for tile (${i}, ${j}):\n` + history.map(e => {
								if(uuidPattern.test(e.uuid)){
									if(sender.hasPerm("viewUUIDs"))
										return `[yellow]${admins.getInfoOptional(e.uuid)?.plainLastName()}[lightgray](${e.uuid})[yellow] ${e.action} a [cyan]${e.type}[] ${formatTimeRelative(e.time)}`;
									else return `[yellow]${admins.getInfoOptional(e.uuid)?.plainLastName()} ${e.action} a [cyan]${e.type}[] ${formatTimeRelative(e.time)}`;
								} else return `[yellow]${e.uuid}[yellow] ${e.action} a [cyan]${e.type}[] ${formatTimeRelative(e.time)}`;
							}).join('\n'));
							limitTiles ++;
							if(limitTiles === amount) break outer;
						}
					}
					if(limitTiles == 0){
						if(args.action) outputFail(`There is no recorded history for the selected region matching the provided filters.`);
						else outputFail(`There is no recorded history for the selected region.`);
					}
					if(limitTiles == amount)
						output(`Displaying first ${limitTiles} entries. To show other entries, increase the limit or select a smaller area.`);
				}
				const p1 = cachedPointMap[sender.uuid];
				if(!p1){
					cachedPointMap[sender.uuid] = [x, y];
					output(`1st point set at (${x},${y})`);
				} else {
					const p2 = [x, y] as [number, number];
					output(`2nd point set at (${x}, ${y})`);
					const width = Math.abs(p1[0] - p2[0]);
					const height = Math.abs(p1[1] - p2[1]);
					if(width > 50 || height > 50) fail("Selection too large: width/height cannot be more than 50.");
					handleArea(p1, p2);
					cachedPointMap[sender.uuid] = undefined;
					if(!args.persist) handleTaps("off");
				}	
			},
		};
	}),

	afk: {
		args: [],
		description: 'Toggles your afk status.',
		perm: Perm.none,
		handler({ sender, outputSuccess }) {
			sender.manualAfk = !sender.manualAfk;
			sender.updateName();
			if(sender.manualAfk) outputSuccess(`You are now marked as AFK.`);
			else outputSuccess(`You are no longer marked as AFK.`);
		},
	},

	vanish: {
		args: ['target:player?'],
		description: `Toggles visibility of your rank and flags.`,
		perm: Perm.vanish,
		handler({ sender, args: {target = sender}, outputSuccess }){
			if(sender.stelled()) fail(`Marked players may not hide flags.`);
			if(sender.muted) fail(`Muted players may not hide flags.`);
			if(sender != target && target.hasPerm("blockTrolling")) fail(`Target is insufficentlly trollable.`);
			if(sender != target && !sender.ranksAtLeast("mod")) fail(`You do not have permission to vanish other players.`);
			target.showRankPrefix = !target.showRankPrefix;
			outputSuccess(
`${target == sender ? `Your` : `${target.name}'s`} rank prefix is now ${target.showRankPrefix ? "visible" : "hidden"}.`
			);
		},
	},
	

	tileid: {
		args: [],
		description: 'Checks id of a tile.',
		perm: Perm.none,
		handler({output, handleTaps}){
			handleTaps("once");
			output(`Click a tile to see its id...`);
		},
		tapped({output, f, tile}){
			output(f`ID is ${tile.block().id}`);
		}
	},

	...Object.fromEntries(
		FishServer.all.map(server => [
			server.name,
			{
				args: [],
				description: `Switches to the ${server.name} server.`,
				perm: server.requiredPerm ? Perm.getByName(server.requiredPerm) : Perm.none,
				isHidden: true,
				handler({ sender }) {
					FishPlayer.messageAllWithPerm(server.requiredPerm, `${sender.name}[magenta] has gone to the ${server.name} server. Use [cyan]/${server.name} [magenta]to join them!`);
					Call.connect(sender.con, server.ip, server.port);
				},
			} satisfies FishCommandData<string, any>,
		])
	),

	switch: {
		args: ["server:string", "target:player?"],
		description: "Switches to another server.",
		perm: Perm.play,
		handler({args, sender, f}){
			if(args.target != null && args.target != sender && !sender.canModerate(args.target, true, "admin", true))
				fail(f`You do not have permission to switch player ${args.target}.`);
			const target = args.target ?? sender;
			if(ipPortPattern.test(args.server) && sender.hasPerm("admin")){
				//direct connect
				Call.connect(target.con, ...args.server.split(":"));
			} else {
				const unknownServerMessage = `Unknown server ${args.server}. Valid options: ${FishServer.all.filter(s => !s.requiredPerm || sender.hasPerm(s.requiredPerm)).map(s => s.name).join(", ")}`;
				const server = FishServer.byName(args.server)
					?? fail(unknownServerMessage);

				//Pretend the server doesn't exist
				if(server.requiredPerm && !sender.hasPerm(server.requiredPerm))
					fail(unknownServerMessage);

				if(target == sender)
					FishPlayer.messageAllWithPerm(server.requiredPerm, `${sender.name}[magenta] has gone to the ${server.name} server. Use [cyan]/${server.name} [magenta]to join them!`);

				Call.connect(target.con, server.ip, server.port);
			}
		}
	},

	s: {
		args: ['message:string'],
		description: `Sends a message to staff only.`,
		perm: Perm.chat,
		handler({ sender, args, outputSuccess, outputFail, lastUsedSender }){
			if(!sender.hasPerm("mod")){
				if(Date.now() - lastUsedSender < 4000) fail(`This command was used recently and is on cooldown. [orange]Misuse of this command may result in a mute.`);
			}
			api.sendStaffMessage(args.message, sender.name, (sent) => {
				if(!sender.hasPerm("mod")){
					if(sent){
						outputSuccess(`Message sent to [orange]all online staff.`);
					} else {
						const wasReceived = FishPlayer.messageStaff(sender.prefixedName, args.message);
						if(wasReceived) outputSuccess(`Message sent to staff.`);
						else outputFail(`No staff were online to receive your message.`);
					}
				}
			});
		},
	},

	/**
	 * This command is mostly for mobile (or players without foos).
	 *
	 * Since the player's unit follows the camera and we are moving the
	 * camera, we need to keep setting the players real position to the
	 * spot the command was made. This is pretty buggy but otherwise the
	 * player will be up the target player's butt
	 */
	watch: command({
		args: ['player:player?'],
		description: `Watch/unwatch a player.`,
		perm: Perm.none,
		data: new Set<string>,
		handler({ args, data, sender, outputSuccess, outputFail }) {
			if(data.has(sender.uuid)){
				outputSuccess(`No longer watching a player.`);
				data.delete(sender.uuid);
			} else if(args.player){
				data.add(sender.uuid);
				const senderUnit = sender.unit();
				const stayX = senderUnit?.x;
				const stayY = senderUnit?.y;
				const target = args.player.player!;
				(function watch(){
					if(data.has(sender.uuid) && target.unit()){
						// Self.X+(172.5-Self.X)/10
						Call.setCameraPosition(sender.con, target.unit()!.x, target.unit()!.y);
						if(senderUnit) sender.unit()?.set?.(stayX!, stayY!);
						Timer.schedule(() => watch(), 0.1, 0.1, 0);
					} else {
						Call.setCameraPosition(sender.con, stayX, stayY);
					}
				})();
			} else {
				outputFail(`No player to unwatch.`);
			}
		},
	}),
	spectate: command(() => {
		//TODO revise code
		/** Mapping between player and original team */
		const spectators = new Map<FishPlayer, Team>();
		function spectate(target:FishPlayer){
			spectators.set(target, target.team());
			target.forceRespawn();
			target.setTeam(Team.derelict);
			target.forceRespawn();
		}
		function resume(target:FishPlayer){
			if(spectators.get(target) == null) return; // this state is possible for a person who left not in spectate
			target.setTeam(spectators.get(target)!);
			spectators.delete(target);
			target.forceRespawn();
		}
		Events.on(EventType.GameOverEvent, () => spectators.clear());
		Events.on(EventType.PlayerLeave, ({player}:{player:mindustryPlayer}) => resume(FishPlayer.get(player)));
		return {
			args: ["target:player?"],
			description: `Toggles spectator mode in PVP games.`,
			perm: Perm.play,
			requirements: [Req.gameRunning],
			handler({sender, args: {target = sender}, outputSuccess, f}){
				if(!Gamemode.pvp() && !sender.hasPerm("mod")) fail(`You do not have permission to spectate on a non-pvp server.`);
				if(target !== sender && target.hasPerm("blockTrolling")) fail(`Target player is insufficiently trollable.`);
				if(target !== sender && !sender.ranksAtLeast("admin")) fail(`You do not have permission to force other players to spectate.`);
				if(spectators.has(target)){
					resume(target);
					outputSuccess(target == sender
						? f`Rejoining game as team ${target.team()}.`
						: f`Forced ${target} out of spectator mode.`
					);
				} else {
					spectate(target);
					outputSuccess(target == sender
						? f`Now spectating. Run /spectate again to resume gameplay.`
						: f`Forced ${target} into spectator mode.`)
					;
				}
			}
		};
	}),
	help: {
		args: ['name:string?'],
		description: 'Displays a list of all commands.',
		perm: Perm.none,
		handler({ args, output, sender, allCommands }) {
			const formatCommand = (name: string, color: string) =>
				new StringBuilder()
					.add(`${color}/${name}`)
					.chunk(`[white]${allCommands[name].args.map(formatArg).join(' ')}`)
					.chunk(`[lightgray]- ${allCommands[name].description}`).str;
			const formatList = (commandList: string[], color: string) => commandList.map((c) => formatCommand(c, color)).join('\n');

			if (args.name && isNaN(parseInt(args.name)) && !['mod', 'admin', 'member'].includes(args.name)) {
				//name is not a number or a category, therefore it is probably a command name
				if (args.name in allCommands && (!allCommands[args.name].isHidden || allCommands[args.name].perm.check(sender))) {
					output(
`Help for command ${args.name}:
	${allCommands[args.name].description}
	Usage: [sky]/${args.name} [white]${allCommands[args.name].args.map(formatArg).join(' ')}
	Permission required: ${allCommands[args.name].perm.name}`
					);
				} else fail(`Command "${args.name}" does not exist.`);
			} else {
				const commands: Record<'player' | 'mod' | 'admin' | 'member', string[]> = {
					player: [],
					mod: [],
					admin: [],
					member: [],
				};
				//TODO change this to category, not perm
				Object.entries(allCommands).forEach(([name, data]) =>
					(data.perm === Perm.admin ? commands.admin : data.perm === Perm.mod ? commands.mod : data.perm === Perm.member ? commands.member : commands.player).push(name)
				);
				const chunkedPlayerCommands: string[][] = to2DArray(commands.player, 15);

				switch (args.name) {
					case 'admin':
						output(`${Perm.admin.color}-- Admin commands --\n` + formatList(commands.admin, Perm.admin.color));
						break;
					case 'mod':
						output(`${Perm.mod.color}-- Mod commands --\n` + formatList(commands.mod, Perm.mod.color));
						break;
					case 'member':
						output(`${Perm.member.color}-- Member commands --\n` + formatList(commands.member, Perm.member.color));
						break;
					default: {
						const pageNumber = args.name != undefined ? parseInt(args.name) : 1;
						const page = chunkedPlayerCommands[pageNumber - 1] ?? fail(`"${args.name}" is an invalid page number.`);
						output(`[sky]-- Commands page [lightgrey]${pageNumber}/${chunkedPlayerCommands.length}[sky] --\n` + formatList(page, '[sky]'));
					}
				}
			}
		},
	},

	msg: {
		args: ['player:player', 'message:string'],
		description: 'Send a message to only one player.',
		perm: Perm.chat,
		handler({ args, sender, output, f }) {
			recentWhispers[args.player.uuid] = sender.uuid;
			args.player.sendMessage(`${sender.prefixedName}[lightgray] whispered:[#BBBBBB] ${args.message}`);
			output(f`[lightgray]Whispered to ${args.player}[lightgray]:[#BBBBBB] ${args.message}`);
		},
	},

	r: {
		args: ['message:string'],
		description: 'Reply to the most recent message.',
		perm: Perm.chat,
		handler({ args, sender, output, f }) {
			const recipient = FishPlayer.getById(recentWhispers[sender.uuid] ?? fail(`It doesn't look like someone has messaged you recently. Try whispering to them with [white]"/msg <player> <message>"`));
			if(!(recipient?.connected())) fail(`The person who last messaged you doesn't seem to exist anymore. Try whispering to someone with [white]"/msg <player> <message>"`);
			recentWhispers[recentWhispers[sender.uuid]] = sender.uuid;
			recipient.sendMessage(`${sender.name}[lightgray] whispered:[#BBBBBB] ${args.message}`);
			output(f`[lightgray]Whispered to ${recipient}[lightgray]:[#BBBBBB] ${args.message}`);
		},
	},

	trail: {
		args: ['type:string?', 'color:string?'],
		description: 'Use command to see options and toggle trail on/off.',
		perm: Perm.none,
		handler({ args, sender, output, outputFail, outputSuccess }) {
			//overload 1: type not specified
			if(!args.type){
				if(sender.trail != null){
					sender.trail = null;
					outputSuccess(`Trail turned off.`);
				} else {
					output(`\
Available types:[yellow]
1 - fluxVapor (flowing smoke, long lasting)
2 - overclocked (diamonds)
3 - overdriven (squares)
4 - shieldBreak (smol)
5 - upgradeCoreBloom (square, long lasting, only orange)
6 - electrified (tiny spiratic diamonds, but only green)
7 - unitDust (same as above but round, and can change colors)
[white]Usage: [orange]/trail [lightgrey]<type> [color/#hex/r,g,b]`
					);
				}
				return;
			}

			//overload 2: type specified
			const trailTypes = {
				"1": 'fluxVapor',
				"2": 'overclocked',
				"3": 'overdriven',
				"4": 'shieldBreak',
				"5": 'upgradeCoreBloom',
				"6": 'electrified',
				"7": 'unitDust',
			};

			const selectedType = trailTypes[args.type as keyof typeof trailTypes] as string | undefined;
			if(!selectedType){
				if(Object.values(trailTypes).includes(args.type)) fail(`Please use the numeric id to refer to a trail type.`);
				else fail(`"${args.type}" is not an available type.`);
			}

			const color = args.color ? getColor(args.color) : Color.white;
			if (color instanceof Color) {
				sender.trail = {
					type: selectedType,
					color,
				};
			} else {
				outputFail(
`[scarlet]Sorry, "${args.color}" is not a valid color.
[yellow]Color can be in the following formats:
[pink]pink [white]| [gray]#696969 [white]| 255,0,0.`
				);
			}
		},
	},

	ohno: command({
		args: [],
		description: 'Spawns an ohno.',
		perm: Perm.play,
		init(){
			const Ohnos = {
				enabled: true,
				ohnos: new Array<Unit>(),
				makeOhno(team:Team, x:number, y:number){
					const ohno = UnitTypes.atrax.create(team);
					ohno.set(x, y);
					ohno.type = UnitTypes.alpha;
					ohno.apply(StatusEffects.disarmed, Number.MAX_SAFE_INTEGER);
					ohno.resetController(); //does this work?
					ohno.add();
					this.ohnos.push(ohno);
					return ohno;
				},
				updateLength(){
					this.ohnos = this.ohnos.filter(o => o && o.isAdded() && !o.dead);
				},
				killAll(){
					this.ohnos.forEach(ohno => ohno?.kill?.());
					this.ohnos = [];
				},
				amount(){
					return this.ohnos.length;
				},
			};
			Events.on(EventType.GameOverEvent, (e) => {
				Ohnos.killAll();
			});
			return Ohnos;
		},
		requirements: [
			Req.gameRunning, Req.modeNot("pvp"),
			Req.unitExists(`You cannot spawn ohnos while dead.`)
		],
		handler({sender, data:Ohnos}){
			if(!Ohnos.enabled) fail(`Ohnos have been temporarily disabled.`);
			Ohnos.updateLength();
			if(
				Ohnos.ohnos.length >= (Groups.player.size() + 1) ||
				sender.team().data().countType(UnitTypes.alpha) >= Units.getCap(sender.team())
			) fail(`Sorry, the max number of ohno units has been reached.`);
			if(nearbyEnemyTile((sender.unit()!), 6) != null) fail(`Too close to an enemy building!`);
			if(!UnitTypes.alpha.supportsEnv(Vars.state.rules.env)) fail(`Ohnos cannot survive in this map.`);
	
			Ohnos.makeOhno(sender.team(), sender.player!.x, sender.player!.y);
		},
	}),

	ranks: {
		args: [],
		description: 'Displays information about all ranks.',
		perm: Perm.none,
		handler({ output }){
			output(
				`List of ranks:\n` +
					Object.values(Rank.ranks)
						.map((rank) => `${rank.prefix} ${rank.color}${capitalizeText(rank.name)}[]: ${rank.color}${rank.description}[]\n`)
						.join("") +
				`List of flags:\n` +
				Object.values(RoleFlag.flags)
					.map((flag) => `${flag.prefix} ${flag.color}${capitalizeText(flag.name)}[]: ${flag.color}${flag.description}[]\n`)
					.join("")
			);
		},
	},

	rules: {
		args: ['player:player?'],
		description: 'Displays the server rules.',
		perm: Perm.none,
		handler({args, sender, outputSuccess, f}){
			const target = args.player ?? sender;
			if(target !== sender){
				if(!sender.hasPerm("warn")) fail(`You do not have permission to show rules to other players.`);
				if(target.hasPerm("blockTrolling")) fail(f`Player ${args.player!} is insufficiently trollable.`);
			}
			Menu.menu(
				"Rules for [#0000ff]>|||> FISH [white]servers", rules.join("\n\n"),
				["[green]I agree to abide by these rules[]", "No"], target,
			).then((option) => {
				if(option == "No"){
					target.kick("You must agree to the rules to play on this server. Rejoin to agree to the rules.", 1);
					outputSuccess('Player rejected the rules and was kicked.');
				} else {
					outputSuccess('Player acknowledged the rules.');
				}
			});
			if(target !== sender) outputSuccess(f`Reminded ${target} of the rules.`);
		},
	},

	void: {
		args: ["player:player?"],
		description: 'Warns other players about power voids.',
		perm: Perm.play,
		requirements: ({args}) => [
			Req.mode("attack"),
			args.player ? Req.cooldown(20_000) : Req.cooldownGlobal(10_000)
		],
		handler({args, sender, outputSuccess, f}){
			if(args.player){
				if(!sender.hasPerm("trusted")) fail(`You do not have permission to show popups to other players, please run /void with no arguments to send a chat message to everyone.`);
				if(args.player !== sender && args.player.hasPerm("blockTrolling")) fail(`Target player is insufficiently trollable.`);
				Menu.menu("\uf83f [scarlet]WARNING[] \uf83f",
`[white]Don't break the Power Void (\uf83f), it's a trap!
Power voids disable anything they are connected to.
If you break it, [scarlet]you will get attacked[] by enemy units.
Please stop attacking and [lime]build defenses[] first!`,
					["I understand"], args.player,
					{ onCancel: 'null' },
				).then(() => outputSuccess(f`Player ${args.player!} acknowledged the warning.`));
				logAction("showed void warning", sender, args.player);
				outputSuccess(f`Warned ${args.player} about power voids with a popup message.`);
			} else {
				Call.sendMessage(
`[white]Don't break the Power Void (\uf83f), it's a trap!
Power voids disable anything they are connected to. If you break it, [scarlet]you will get attacked[] by enemy units.
Please stop attacking and [lime]build defenses[] first!`
				);
			}
		},
	},

	team: {
		args: ['team:team', 'reason:string?'],
		description: 'Changes your team.',
		perm: Perm.changeTeam,
		handler({sender, args: {team, reason}, outputSuccess, f}){
			if(Gamemode.sandbox() && fishState.peacefulMode && !sender.hasPerm("admin"))
				fail(`You do not have permission to change teams because peaceful mode is on.`);
			if(Gamemode.sandbox() && team === Vars.state.rules.waveTeam && !sender.hasPerm("admin"))
				fail(`You do not have permission to change to the wave team on sandbox.`);
			if(!Gamemode.sandbox() && !sender.hasPerm("mod") && !reason) fail(`Please specify a reason for changing teams.`);
			if(!sender.hasPerm("changeTeamExternal")){
				if(team.data().cores.size <= 0) fail(`You do not have permission to change to a team with no cores.`);
				if(!sender.player!.dead() && !sender.unit()?.spawnedByCore)
					sender.forceRespawn();
			}
			if(!sender.hasPerm("mod")) sender.changedTeam = true;
			sender.setTeam(team);
			outputSuccess(f`Changed your team to ${team}.`);
			if(reason && !Gamemode.sandbox()) logAction(`changed team to ${team.name} on ${escapeTextDiscord(Vars.state.map.plainName())} with reason ${escapeTextDiscord(reason)}`, sender);
		},
	},

	teamp: {
		args: ['team:team', 'target:player'],
		description: 'Changes the team of a player.',
		perm: Perm.changeTeam,
		handler({sender, args: {team, target}, outputSuccess, f}){
			if(!sender.canModerate(target, true, "mod", true)) fail(f`You do not have permission to change the team of ${target}`);
			if(Gamemode.sandbox() && fishState.peacefulMode && !sender.hasPerm("admin")) fail(`You do not have permission to change teams because peaceful mode is on.`);
			if(!sender.hasPerm("changeTeamExternal")){
				if(team.data().cores.size <= 0) fail(`You do not have permission to change to a team with no cores.`);
				if(!target.player!.dead() && !target.unit()?.spawnedByCore)
					target.forceRespawn();
			}
			target.setTeam(team);
			outputSuccess(f`Changed team of player ${target} to ${team}.`);
		},
	},

	rank: {
		args: ['player:player'],
		description: 'Displays the rank of a player.',
		perm: Perm.none,
		handler({args, output, f}) {
			output(f`Player ${args.player}'s rank is ${args.player.rank}.`);
		},
	},

	
	forcevnw: {
		args: ["force:boolean?"],
		description: 'Force skip to the next wave.',
		perm: Perm.admin,
		handler({allCommands, sender, args:{force = true}}){
			if(allCommands.vnw.data.manager.session == null){
				if(force == false) fail(`Cannot clear votes for VNW because no vote is currently ongoing.`);
				skipWaves(1, true);
			} else {
				if(force) Call.sendMessage(`VNW: [green]Vote was forced by admin [yellow]${sender.name}[green], skipping wave.`);
				else Call.sendMessage(`VNW: [red]Votes cleared by admin [yellow]${sender.name}[red].`);
				allCommands.vnw.data.manager.forceVote(force);
			}
		},
	},

	vnw: command({
		args: [],
		description: "Vote to start the next wave.",
		perm: Perm.play,
		init: () => ({
			manager: new VoteManager<number>(Duration.minutes(1.5))
				.on("success", (t) => skipWaves(t.session!.data, true))
				.on("vote passed", () => Call.sendMessage('VNW: [green]Vote passed, skipping to next wave.'))
				.on("vote failed", () => Call.sendMessage('VNW: [red]Vote failed.'))
				.on("player vote change", (t, player) => Call.sendMessage(`VNW: ${player.name} [white] has voted on skipping [accent]${t.session!.data}[white] wave(s). [green]${t.currentVotes()}[white] votes, [green]${t.requiredVotes()}[white] required.`))
				.on("player vote removed", (t, player) => Call.sendMessage(`VNW: ${player.name} [white] has left. [green]${t.currentVotes()}[white] votes, [green]${t.requiredVotes()}[white] required.`))
		}),
		requirements: [Req.cooldown(3000), Req.mode("survival"), Req.gameRunning],
		async handler({sender, data:{manager}}){

			//Disable narrowing, this is async
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			if(!manager.session as boolean){
				const option = await Menu.menu(
					"Start a Next Wave Vote",
					"Select the amount of waves you would like to skip.",
					[1, 5, 10],
					sender,
					{
						includeCancel: true,
						optionStringifier: n => `${n} waves`
					}
				);
				if(manager.session){
					//Someone else started a vote
					if(manager.session.data != option) fail(`Someone else started a vote with a different number of waves to skip.`);
					else manager.vote(sender, sender.voteWeight(), option);
				} else {
					manager.start(sender, sender.voteWeight(), option);
				}
			} else {
				manager.vote(sender, sender.voteWeight(), null);
			}
		}	
	}),

	forcertv: {
		args: ["force:boolean?"],
		description: 'Force skip to the next map.',
		perm: Perm.admin,
		handler({args:{force = true}, sender, allCommands}){
			if(allCommands.rtv.data.manager.session == null){
				if(force == false) fail(`Cannot clear votes for RTV because no vote is currently ongoing.`);
				allCommands.rtv.data.manager.forceVote(true);
			} else {
				if(force) Call.sendMessage(`RTV: [green]Vote was forced by admin [yellow]${sender.name}[green].`);
				else Call.sendMessage(`RTV: [red]Votes cleared by admin [yellow]${sender.name}[red].`);
				allCommands.rtv.data.manager.forceVote(force);
			}
		}
	},

	rtv: command({
		args: [],
		description: 'Rock the vote to change map.',
		perm: Perm.play,
		init: () => ({
			manager: new VoteManager(Duration.minutes(1.5), Gamemode.hexed() ? ["fractionOfVoters", 1] : undefined) //Require unanimity in Hexed, as it is often 1 v everyone
				.on("success", () => neutralGameover())
				.on("vote passed", () => Call.sendMessage(`RTV: [green]Vote has passed, changing map.`))
				.on("vote failed", () => Call.sendMessage(`RTV: [red]Vote failed.`))
				.on("player vote change", (t, player, oldVote, newVote) => Call.sendMessage(`RTV: ${player.name}[white] ${oldVote == newVote ? "still " : ""}wants to change the map. [green]${t.currentVotes()}[white] votes, [green]${t.requiredVotes()}[white] required.`))
				.on("player vote removed", (t, player) => Call.sendMessage(`RTV: ${player.name}[white] has left the game. [green]${t.currentVotes()}[white] votes, [green]${t.requiredVotes()}[white] required.`))
		}),
		requirements: [Req.cooldown(3000), Req.gameRunning],
		handler({sender, data:{manager}}){
			manager.vote(sender, 1, 0); //No weighting for RTV except for removing AFK players
		}
	}),

	// votekick: {
	//	 args: ["target:player"],
	//	 description: "Starts a vote to kick a player.",
	//	 perm: Perm.play,
	//	 handler({args, sender}){
	// 		if(votekickmanager.currentSession) fail(`There is already a votekick in progress.`);
	// 		votekickmanager.start({
	// 			initiator: sender,
	// 			target: args.player
	// 		});
	//	 }
	// },

	// vote: {
	//	 args: ["vote:boolean"],
	//	 description: "Use /votekick instead.",
	//	 perm: Perm.play,
	//	 handler({sender, args}){
	// 		votekickmanager.handleVote(sender, args ? 1 : -1);
	//	 }
	// },

	// no, it will not get the menu. yes, I know it sucks, but I doubt we nee
	forcenextmap: {
		args: ["map:map"],
		description: 'Override the next map in queue.',
		perm: Perm.admin.exceptModes({
			testsrv: Perm.play
		}),
		handler({allCommands, args, sender, outputSuccess, f}){
			Vars.maps.setNextMapOverride(args.map);
			if(allCommands.nextmap.data.voteEndTime() > -1){
				//Cancel /nextmap vote if it's ongoing
				allCommands.nextmap.data.resetVotes();
				Call.sendMessage(`[red]Admin ${sender.name}[red] has cancelled the vote. The next map will be [yellow]${args.map.name()}.`);
			} else {
				outputSuccess(f`Forced the next map to be "${args.map.name()}" by ${args.map.author()}`);
			}
		},

	},

	/*
	maps: {
		args: [],
		description: 'Lists the available maps.',
		perm: Perm.none,
		handler({output}){
			output(`\
[yellow]Use [white]/nextmap [lightgray]<map name> [yellow]to vote on a map.

[blue]Available maps:
_________________________
${Vars.maps.customMaps().toArray().map(map =>
`[yellow]${map.name()}`
).join("\n")}`
			);
		}
	},
	*/

	maps:{
		description:'depreciated, please use /maps instead',
		args:[],
		perm:Perm.none,
		handler:() => {
			fail('This command was moved to /nextmap');
		},
	},

	nextmap: command(() => {
		const votes = new Map<FishPlayer, MMap>();
		let lastVoteCount = 0;
		let lastVoteTime = 0;
		let voteEndTime = -1;
		const voteDuration = Duration.minutes(1.5);
		let task: TimerTask | null = null;

		let currentMenu = (target:FishPlayer) => {
			let mainMenu = Menu.raw("Fish Map Manager",`[accent]---Current Map---\nMap Name: [white]${Vars.state.map.name()}\n[accent]Map Author: [white]${Vars.state.map.author()}\nFastest Time: [white]${formatTime(FMap.getCreate(Vars.state.map).stats().shortestTime)}\nCurrent Time: [white]${formatTime(PartialMapRun.current!.duration())}`, [["[green]Current Maps"], ["[yellow]Throwback Maps"], ["[orange]Campaigns"], ["Close"]], target);
			mainMenu.then((res) => {
				switch(res){
					case '[green]Current Maps':
						let CurrentMapsMenu = Menu.pagedList(target, "Current Maps", "", Vars.maps.customMaps().toArray(), {optionStringifier: (map:MMap) => {return map.name()}, rowsPerPage:10, columns:1});
						CurrentMapsMenu.catch(() => {}).then((map) => {
							if(map == null) return;
							let CurrentMapMenu = Menu.raw(map.name(), `[accent]Description: [white]${map.description()}\n[accent]Author: [white]${map.author()}\n[accent]Fastest Time: [white]${formatTime((FMap.getCreate(map)).stats().shortestTime)}\n[accent]Runs: [white]${(FMap.getCreate(map)).stats().allRunCount}\n[accent]Winrate: [white]${((FMap.getCreate(map)).stats().winRate * 100).toFixed(2)}%`, [["[green]Vote for this Map"], ["[red]Back"]], target);
							CurrentMapMenu.then(res => {
								switch(res){
									case("[green]Vote for this Map"):
										sendVote(target, map);
										break;
									case("[red]Back"):
										currentMenu(target);
										break;
								}
							});
						});
						break;
					case '[yellow]Throwback Maps':
						outputMessage("Throwback maps have not yet been implemented.", target);
						break;
					case '[orange]Campaigns':
						outputMessage("Campaigns have not yet been implemented.", target);
						break;
					case 'Close':
						break;
				}
			});
		}
		
		function sendVote(sender:FishPlayer, map:MMap){
			if(Gamemode.testsrv()) fail(`Please use /forcenextmap instead.`);
			if(votes.get(sender)) fail(`You have already voted.`);

			votes.set(sender, map);
			if(voteEndTime == -1){
				if((Date.now() - lastVoteTime) < 60_000) fail(`Please wait 1 minute before starting a new map vote.`);
				startVote();
				Call.sendMessage(`[cyan]Next Map Vote: ${sender.name}[cyan] started a map vote, and voted for [yellow]${map.name()}[cyan]. Use [white]/nextmap ${map.plainName()}[] to add your vote, or run [white]/maps[] to see other available maps.`);
			} else {
				Call.sendMessage(`[cyan]Next Map Vote: ${sender.name}[cyan] voted for [yellow]${map.name()}[cyan]. Time left: [scarlet]${formatTimeRelative(voteEndTime, true)}`);
				showVotes();
			}
		}
		function resetVotes(){
			votes.clear();
			voteEndTime = -1;
			task?.cancel();
		}

		function getMapData():Seq<ObjectIntMapEntry<MMap>> {
			return [...votes.values()].reduce(
				(acc, map) => (acc.increment(map), acc), new ObjectIntMap<MMap>()
			).entries().toArray();
		}

		function showVotes(){
			Call.sendMessage(`\
[green]Current votes:
------------------------------
${getMapData().map(({key:map, value:votes}) =>
`[cyan]${map.name()}[yellow]: ${votes}`
).toString("\n")}`
			);
		}

		function startVote(){
			voteEndTime = Date.now() + voteDuration;
			task = Timer.schedule(endVote, voteDuration / 1000);
		}

		function endVote(){
			if(voteEndTime == -1) return; //aborted somehow
			if(votes.size == 0) return; //no votes?

			if(votes.size + 2 <= lastVoteCount && (Date.now() - lastVoteTime) < Duration.minutes(10)){
				//If the number of votes is 2 less than the previous number of votes for a vote in the past 10 minutes, abor
				Call.sendMessage("[cyan]Next Map Vote: [scarlet]Vote aborted because a previous vote had significantly higher turnout");
				resetVotes();
				return;
			} else {
				lastVoteTime = Date.now();
				lastVoteCount = votes.size;
			}

			const mapData = getMapData();
			const highestVoteCount = mapData.max(floatf(e => e.value)).value;
			const highestVotedMaps = mapData.select(e => e.value == highestVoteCount);
			let winner:MMap;

			if(highestVotedMaps.size > 1){
				winner = highestVotedMaps.random()!.key;
				Call.sendMessage(
`[green]There was a tie between the following maps:
${highestVotedMaps.map(({key:map, value:votes}) =>
`[cyan]${map.name()}[yellow]: ${votes}`
).toString("\n")}
[green]Picking random winner: [yellow]${winner.name()}`
				);
			} else {
				winner = highestVotedMaps.get(0).key;
				Call.sendMessage(`[green]Map voting complete! The next map will be [yellow]${winner.name()} [green]with [yellow]${highestVoteCount}[green] votes.`);
			}
			Vars.maps.setNextMapOverride(winner);
			resetVotes();
		}

		Events.on(EventType.GameOverEvent, resetVotes);
		Events.on(EventType.ServerLoadEvent, resetVotes);

		return {
			args: ['map:map?'],
			description: 'Allows you to vote for the next map.',
			perm: Perm.play,
			data: {votes, voteEndTime: () => voteEndTime, resetVotes, endVote},
			requirements: [Req.cooldown(10_000)],
			handler({args, sender}){
				if(args.map) sendVote(sender, args.map);
				else currentMenu(sender);
			}
		};
	}),
	surrender: command(() => {
		const prefix = "[orange]Surrender[white]: ";
		const managers = Team.all.map(team =>
			new VoteManager<number>(
				Duration.minutes(1.5),
				["fractionOfVoters", Gamemode.hexed() ? 1 : 3/4],
				p => p.team() == team,
			)
				.on("success", () => team.cores().copy().each(c => c.kill()))
				.on("vote passed", () => Call.sendMessage(
					prefix + `Team ${team.coloredName()} has voted to forfeit this match.`
				))
				.on("vote failed", t => t.messageEligibleVoters(
					prefix + `Team ${team.coloredName()} has chosen not to forfeit this match.`
				))
				.on("player vote change", (t, player, oldVote, newVote) => t.messageEligibleVoters(
					prefix + `${player.name}[white] ${oldVote == newVote ? "still " : ""}wants to forfeit this match. [orange]${t.currentVotes()}[white] votes, [orange]${t.requiredVotes()}[white] required.`
				))
				.on("player vote removed", (t, player) => t.messageEligibleVoters(
					prefix + `Player ${player.name}[white] has left the game. [orange]${t.currentVotes()}[white] votes, [orange]${t.requiredVotes()}[white] required.`
				))
		);

		FishEvents.on("playerTeamChange", (_, fishP, previous) => {
			managers[previous.id].unvote(fishP);
		});

		return {
			args: ["force:boolean?"],
			description: "Vote to surrender to the enemy team.",
			perm: Perm.play,
			requirements: [Req.mode("pvp"), Req.teamAlive],
			data: { managers },
			handler({ sender, args: {force} }){
				const manager = managers[sender.team().id];
				if(sender.hasPerm("admin") && force != undefined) manager.forceVote(force);
				if(sender.ranksAtLeast("mod")) Req.cooldown(5_000);
				else Req.cooldown(20_000);
				manager.vote(sender, 1, 0);
			},
		};
	}),
	stats: {
		args: ["target:player"],
		perm: Perm.none,
		description: "Views a player's stats.",
		handler({args:{target}, output, f}){
			output(f`[accent]\
Statistics for player ${target}:
(note: we started recording statistics on 22 Jan 2024)
[white]--------------[]
Blocks broken: ${target.stats.blocksBroken}
Blocks placed: ${target.stats.blocksPlaced}
Chat messages sent: ${target.stats.chatMessagesSent}
Games finished: ${target.stats.gamesFinished}
Time in-game: ${formatTime(target.stats.timeInGame)}
Win rate: ${target.stats.gamesWon / target.stats.gamesFinished}`
			);
		}
	},
	showworld: {
		args: ["x:number?", "y:number?", "size:number?"],
		perm: Perm.none,
		description: "Views the world as a 2D scrollable menu.",
		requirements: [Req.cooldown(4000)],
		handler({sender, args:{size = 7, x, y}}){
			if(size > 20) fail(`Size ${size} is too high!`);
			if(Vars.state.rules.fog) fail(`This command is disabled when fog is enabled.`);
			const options = to2DArray((Reflect.get(Vars.world.tiles, "array") as Tile[]).map(tile => ({
				text: tile.block().emoji(),
				data: null,
			})), Vars.world.width()).reverse();
			const height = Vars.world.height();
			Menu.scroll(sender, "The World", "Use the arrow keys to navigate around the world. Click a blank square to exit.", options, {
				columns: size,
				rows: size,
				x: x ? x - Math.trunc(size / 2) : 0,
				y: height - (y ? y + 1 + Math.trunc(size / 2) : size),
				getCenterText: (x, y) => `${x},${height - y - size}`
			});
		}
	},

	mapinfo: {
		args: ["map:map?"],
		perm: Perm.none,
		description: "Displays information about a map.",
		handler({output, args:{map}, f, sender}){
			if(map){
				output(FMap.getCreate(map).displayStats(f)!);
			} else {
				Menu.textPages(sender, Vars.maps.customMaps().map(m =>
					["Map information", () => FMap.getCreate(m).displayStats(f)!] as const
				).toArray(), {
					startPage: Vars.maps.customMaps().toArray().indexOf(Vars.state.map),
				});
			}
		}
	},

	gamemode: {
		args: ["mode:string"],
		perm: new Perm("changeGamemode", "manager").exceptModes({
			testsrv: Perm.play,
		}),
		description: "Sets the gamemode.",
		requirements: [Req.cooldownGlobal(10_000)],
		handler({args, sender, outputSuccess, lastUsedSuccessfully}){
			if(!sender.hasPerm('trusted')) Req.cooldownGlobal(30_000)({lastUsedSuccessfully});
			//Unpause
			Vars.state.set(GameState.State.playing);
			switch(args.mode){
				case "attack":
					Vars.state.rules.attackMode = true;
					Vars.state.rules.pvp = false;
					Vars.state.rules.infiniteResources = false;
					break;
				case "survival":
					Vars.state.rules.attackMode = false;
					Vars.state.rules.waves = true;
					Vars.state.rules.pvp = false;
					Vars.state.rules.infiniteResources = false;
					break;
				case "pvp":
					Vars.state.rules.attackMode = true;
					Vars.state.rules.pvp = true;
					Vars.state.rules.waves = false;
					Vars.state.rules.infiniteResources = false;
					break;
				case "sandbox":
					Vars.state.rules.attackMode = true;
					Vars.state.rules.pvp = false;
					Vars.state.rules.waves = false;
					Vars.state.rules.infiniteResources = true;
					break;
				default: fail(`Invalid mode, valid modes are: attack, survival, pvp`);
			}
			const reloader = new WorldReloader();
			Reflect.set(reloader, "wasServer", true);
			Reflect.set(reloader, "players", Groups.player.copy());
			Call.worldDataBegin();
			reloader.end();
			Call.sendMessage(`[orange]Player ${sender.cleanedName} changed the gamemode to ${args.mode}`);
			outputSuccess(`Changed mode to ${args.mode}`);
		}
	},

	mixunit: {
		args: ["type:unittype", "base:unittype"],
		description: "Spawns a unit that is made of two unit types mixed together.",
		perm: Perm.admin.exceptModes({
			sandbox: Perm.play
		}),
		requirements: ({sender}) => [!sender.hasPerm("admin") && Req.cooldown(1500), Req.unitExists()].filter(Boolean),
		handler({args, sender, f, outputSuccess}){
			const { team, x, y } = sender.unit()!;
			const unit = args.base.create(team);
			unit.type = args.type;
			unit.maxHealth = args.type.health; //because half-dead units aren't fun
			unit.set(x, y);
			unit.add();
			outputSuccess(f`Spawned a ${args.type} that is partly a ${args.base}.`);
		}
	}
});
