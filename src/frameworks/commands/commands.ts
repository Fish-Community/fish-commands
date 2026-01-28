/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the commands framework.
For usage information, see docs/framework-usage-guide.md
For maintenance information, see docs/frameworks.md
*/
//Behold, the power of typescript!

import { CommandError, fail } from "/frameworks/commands/errors";
import { f_client, f_server, outputFormatter_client } from "/frameworks/commands/formatting";
import type { FishCommandArgType, FishCommandData, FishCommandHandlerData, FishCommandHandlerUtils, FishConsoleCommandData } from "/frameworks/commands/types";
import { CommandArgType, commandArgTypes } from "/frameworks/commands/types";
import { Menu } from "/frameworks/menus";
import { crash, escapeStringColorsClient, parseError, setToArray } from "/funcs";
import { FishEvents, uuidPattern } from "/globals";
import { FishPlayer } from "/players";
import { Rank, RoleFlag } from "/ranks";
import type { ClientCommandHandler, CommandArg, ServerCommandHandler } from "/types";
import { getBlock, getItem, getMap, getTeam, getUnitType, outputConsole, outputFail, outputMessage, outputSuccess, parseTimeString } from "/utils";

const hiddenUnauthorizedMessage = "[scarlet]Unknown command. Check [lightgray]/help[scarlet].";

/** Flag to prevent double initialization */
let initialized = false;

/** Stores all chat comamnds by their name. */
export const allCommands:Record<string, FishCommandData<string, any>> = {};
/** Stores all console commands by their name. */
export const allConsoleCommands:Record<string, FishConsoleCommandData<string, any>> = {};

/** Stores the last usage data for chat commands by their name. */
const globalUsageData:Record<string, {
	lastUsed: number;
	lastUsedSuccessfully: number;
}> = {};

/** Helper function to get the correct type for command lists. */
export const commandList = <A extends Record<string, string>>(list:{
	//Store the mapping between commandname and ArgStringUnion in A
	[K in keyof A]: FishCommandData<A[K], any>;
}):Record<keyof A, FishCommandData<string, any> | (() => FishCommandData<string, any>)> => list;
/** Helper function to get the correct type for command lists. */
export const consoleCommandList = <A extends Record<string, string>>(list:{
	//Store the mapping between commandname and ArgStringUnion in A
	[K in keyof A]: FishConsoleCommandData<A[K], any>;
}):Record<keyof A, FishConsoleCommandData<string, any>> => list;

export function command<const TParam extends string, TData>(cmd:FishCommandData<TParam, TData>):FishCommandData<TParam, TData>;
export function command<const TParam extends string, TData>(cmd:() => FishCommandData<TParam, TData>):FishCommandData<TParam, TData>;//not type safe, can't be bothered to find a solution that works with commandList
export function command<TParam extends string, TData>(cmd:FishConsoleCommandData<TParam, TData>):FishConsoleCommandData<TParam, TData>;
/**
 * Helper function to get the correct type definitions for commands that use "data" or init().
 * Necessary because, while typescript is capable of inferring A1, A2...
 * ```
 * {
 * 	prop1: Type<A1>;
 * 	prop2: Type<A2>;
 * }
 * ```
 * it cannot handle inferring A1 and B1.
 * ```
 * {
 * 	prop1: Type<A1, B1>;
 * 	prop2: Type<A2, B2>;
 * }
 * ```
 */
export function command(input:unknown){
	return input;
}

/** Takes an arg string, like `reason:string?` and converts it to a CommandArg. */
function processArgString(str:string):CommandArg {
	//this was copypasted from mlogx haha
	const matchResult = str.match(/(\w+):(\w+)(\?)?/);
	if(!matchResult){
		crash(`Bad arg string ${str}: does not match pattern word:word(?)`);
	}
	const [, name, type, isOptional] = matchResult;
	if((commandArgTypes.includes as (thing:string) => thing is CommandArgType)(type)){
		return { name, type, isOptional: !! isOptional };
	} else {
		crash(`Bad arg string ${str}: invalid type ${type}`);
	}
}

export function formatArg(a:string){
	const isOptional = a.at(-1) == "?";
	const brackets = isOptional ? ["[", "]"] : ["<", ">"];
	return brackets[0] + a.split(":")[0] + brackets[1];
}

/** Joins multi-word arguments that have been groups with quotes. Ex: turns [`"a`, `b"`] into [`a b`]*/
function joinArgs(rawArgs:string[]){
	const outputArgs = [];
	let groupedArg:string[] | null = null;
	for(const arg of rawArgs){
		if(arg.startsWith(`"`) && groupedArg == null){
			groupedArg = [];
		}
		if(groupedArg){
			groupedArg.push(arg);
			if(arg.endsWith(`"`)){
				outputArgs.push(groupedArg.join(" ").slice(1, -1));
				groupedArg = null;
			}
		} else {
			outputArgs.push(arg);
		}
	}
	if(groupedArg != null){
		//return `Unterminated string literal.`;
		outputArgs.push(groupedArg.join(" "));
	}
	return outputArgs;
}

/** Takes a list of joined args passed to the command, and processes it, turning it into a kwargs style object. */
async function processArgs(args: string[], processedCmdArgs: CommandArg[], sender: FishPlayer | null): Promise<Record<string, FishCommandArgType>> {
	const outputArgs: Record<string, FishCommandArgType> = {};
	for(const [i, cmdArg] of processedCmdArgs.entries()){
		if(!(i in args) || args[i] === ""){
			//if the arg was not provided or it was empty
			if(cmdArg.isOptional){
				outputArgs[cmdArg.name] = undefined;
				continue;
			} else if(sender && ["player"].includes(cmdArg.type)){
				//it will be resolved later
			} else {
				fail(`No value specified for arg ${cmdArg.name}. Did you type two spaces instead of one?`);
			}
		}

		//Deserialize the arg
		switch(cmdArg.type){
			case "player": {
				const output = FishPlayer.search(FishPlayer.getAllOnline(), args[i]);
				if(!output) fail(`Player "${args[i]}" not found.`);
				else if(Array.isArray(output)){
					if(!sender) fail(`Name "${args[i]}" could refer to more than one player.`);
					outputArgs[cmdArg.name] = await Menu.menu(`Select a player`, `Select a player for the argument "${cmdArg.name}"`, output, sender, {
						includeCancel: true,
						optionStringifier: player => Strings.stripColors(player.name).length >= 3 ?
							player.name
							: escapeStringColorsClient(player.name)
					});
				} else outputArgs[cmdArg.name] = output;
				break;
			}
			case "offlinePlayer":
				if(uuidPattern.test(args[i])){
					const player = FishPlayer.getById(args[i]);
					if(player == null) fail(`Player with uuid "${args[i]}" not found. Specify "create:${args[i]}" to create the player.`);
					outputArgs[cmdArg.name] = player;
				} else if(args[i].startsWith("create:") && uuidPattern.test(args[i].split("create:")[1])){
					outputArgs[cmdArg.name] = FishPlayer.getFromInfo(
						Vars.netServer.admins.getInfo(
							args[i].split("create:")[1]
						)
					);
				} else {
					const output = FishPlayer.getOneOfflineByName(args[i]);
					if(output == "none") fail(`Player "${args[i]}" not found.`);
					else if(output == "multiple") fail(`Name "${args[i]}" could refer to more than one player. Try specifying by ID.`);
					outputArgs[cmdArg.name] = output;
				}
				break;
			case "team": {
				const team = getTeam(args[i]);
				if(typeof team == "string") fail(team);
				outputArgs[cmdArg.name] = team;
				break;
			}
			case "number": {
				let number = Number(args[i]);
				if(isNaN(number)){
					if(/\(\d+,/.test(args[i]))
						number = Number(args[i].slice(1, -1));
					else if(/\d+\)/.test(args[i]))
						number = Number(args[i].slice(0, -1));

					if(isNaN(number))
						fail(`Invalid number "${args[i]}"`);
				}
				outputArgs[cmdArg.name] = number;
				break;
			}
			case "time": {
				const milliseconds = parseTimeString(args[i]);
				if(milliseconds == null) fail(`Invalid time string "${args[i]}"`);
				outputArgs[cmdArg.name] = milliseconds;
				break;
			}
			case "string":
				outputArgs[cmdArg.name] = args[i];
				break;
			case "boolean":
				switch(args[i].toLowerCase()){
					case "true": case "yes": case "yeah": case "ya": case "ye": case "t": case "y": case "1": outputArgs[cmdArg.name] = true; break;
					case "false": case "no": case "nah": case "nay": case "nope": case "f": case "n": case "0": outputArgs[cmdArg.name] = false; break;
					default: fail(`Argument ${args[i]} is not a boolean. Try "true" or "false".`);
				}
				break;
			case "block": {
				const block = getBlock(args[i], "air");
				if(typeof block == "string") fail(block);
				outputArgs[cmdArg.name] = block;
				break;
			}
			case "unittype": {
				const unit = getUnitType(args[i]);
				if(typeof unit == "string") fail(unit);
				outputArgs[cmdArg.name] = unit;
				break;
			}
			case "uuid":
				if(!uuidPattern.test(args[i])) fail(`Invalid uuid string "${args[i]}"`);
				outputArgs[cmdArg.name] = args[i];
				break;
			case "map": {
				const map = getMap(args[i]);
				if(map == "none") fail(`Map "${args[i]}" not found.`);
				else if(map == "multiple") fail(`Name "${args[i]}" could refer to more than one map. Be more specific.`);
				//TODO change all these "multiple" errors into menu
				//TODO refactor this function using search() curry, there's a lot of duplicated search code
				outputArgs[cmdArg.name] = map;
				break;
			}
			case "rank": {
				const ranks = Rank.getByInput(args[i]);
				if(ranks.length == 0) fail(`Unknown rank "${args[i]}"`);
				if(ranks.length > 1) fail(`Ambiguous rank "${args[i]}"`);
				outputArgs[cmdArg.name] = ranks[0];
				break;
			}
			case "roleflag": {
				const roleflags = RoleFlag.getByInput(args[i]);
				if(roleflags.length == 0) fail(`Unknown role flag "${args[i]}"`);
				if(roleflags.length > 1) fail(`Ambiguous role flag "${args[i]}"`);
				outputArgs[cmdArg.name] = roleflags[0];
				break;
			}
			case "item": {
				const item = getItem(args[i]);
				if(typeof item === "string") fail(item);
				outputArgs[cmdArg.name] = item;
				break;
			}
			default: cmdArg.type satisfies never; crash("impossible");
		}
	}
	return outputArgs;
}

const variadicArgumentTypes:CommandArgType[] = ["player", "string", "map"];

/** Converts the CommandArg[] to the format accepted by Arc CommandHandler */
function convertArgs(processedCmdArgs:CommandArg[], allowMenus:boolean):string {
	return processedCmdArgs.map((arg, index, array) => {
		const isOptional = (arg.isOptional || (arg.type == "player" && allowMenus)) && !array.slice(index + 1).some(c => !c.isOptional);
		const brackets = isOptional ? ["[", "]"] : ["<", ">"];
		//if the arg is a string and last argument, make it variadic (so if `/warn player a b c d` is run, the last arg is "a b c d" not "a")
		return brackets[0] + arg.name + (variadicArgumentTypes.includes(arg.type) && index + 1 == array.length ? "..." : "") + brackets[1];
	}).join(" ");
}

export function handleTapEvent(event:EventType["TapEvent"]){
	const sender = FishPlayer.get(event.player);
	if(sender.tapInfo.commandName == null) return;
	const command = allCommands[sender.tapInfo.commandName];
	const usageData = sender.getUsageData(sender.tapInfo.commandName);
	let handleTapsUpdated = false;
	try {
		let failed = false;
		command.tapped?.({
			args: sender.tapInfo.lastArgs,
			data: command.data,
			outputFail: message => { outputFail(message, sender); failed = true; },
			outputSuccess: message => outputSuccess(message, sender),
			output: message => outputMessage(message, sender),
			f: outputFormatter_client,
			admins: Vars.netServer.admins,
			commandLastUsed: usageData.lastUsed,
			commandLastUsedSuccessfully: usageData.lastUsedSuccessfully,
			lastUsed: usageData.tapLastUsed,
			lastUsedSuccessfully: usageData.tapLastUsedSuccessfully,
			sender,
			tile: event.tile,
			x: event.tile.x,
			y: event.tile.y,
			currentTapMode: sender.tapInfo.commandName == null ? "off" : sender.tapInfo.mode,
			handleTaps(mode){
				if(mode == "off"){
					sender.tapInfo.commandName = null;
					return;
				}
				sender.tapInfo.mode = mode;
				handleTapsUpdated = true;
			},
		});
		if(!failed)
			usageData.tapLastUsedSuccessfully = Date.now();

	} catch(err){
		if(err instanceof CommandError){
			//If the error is a command error, then just outputFail
			outputFail(err.data, sender);
		} else {
			sender.sendMessage(`[scarlet]\u274C An error occurred while executing the command!`);
			if(sender.hasPerm("seeErrorMessages")) sender.sendMessage(parseError(err));
			Log.err(`Unhandled error in command execution: ${sender.cleanedName} ran /${sender.tapInfo.commandName} and tapped`);
			Log.err(err as Error);
		}
	} finally {
		if(sender.tapInfo.mode == "once" && !handleTapsUpdated){
			sender.tapInfo.commandName = null;
		}
		usageData.tapLastUsed = Date.now();
	}
}

/**
 * Registers all commands in a list to a client command handler.
 **/
export function register(commands: Record<string, FishCommandData<string, any> | (() => FishCommandData<string, any>)>, clientHandler: ClientCommandHandler, serverHandler: ServerCommandHandler){

	for(const [name, _data] of Object.entries(commands)){

		//Invoke thunk if necessary
		const data = typeof _data == "function" ? _data() : _data;

		//Process the args
		const processedCmdArgs = data.args.map(processArgString);
		clientHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
		clientHandler.register(
			name,
			convertArgs(processedCmdArgs, true),
			data.description,
			new CommandHandler.CommandRunner({ async accept(unjoinedRawArgs: string[], sender: mindustryPlayer){
				if(!initialized) crash(`Commands not initialized!`);

				const fishSender = FishPlayer.get(sender);
				FishPlayer.onPlayerCommand(fishSender, name, unjoinedRawArgs);

				//Verify authorization
				//as a bonus, this crashes if data.perm is undefined
				if(!data.perm.check(fishSender)){
					if(data.customUnauthorizedMessage){
						outputFail(data.customUnauthorizedMessage, sender);
						FishEvents.fire("commandUnauthorized", [fishSender, name]);
					} else if(data.isHidden)
						outputMessage(hiddenUnauthorizedMessage, sender);
					else
						outputFail(data.perm.unauthorizedMessage, sender);
					return;
				}

				//closure over processedCmdArgs, should be fine
				//Process the args
				const rawArgs = joinArgs(unjoinedRawArgs); //TODO: remove this when we replace the command handler
				//Resolve missing args (such as players that need to be determined through a menu)
				let resolvedArgs;
				try {
					resolvedArgs = await processArgs(rawArgs, processedCmdArgs, fishSender);
				} catch(err){
					//if args are invalid
					if(err instanceof CommandError) outputFail(err.data, sender);
					return;
				}

				//Run the command handler
				const usageData = fishSender.getUsageData(name);
				let failed = false;
				try {
					const args: FishCommandHandlerData<string, any> & FishCommandHandlerUtils = {
						rawArgs,
						args: resolvedArgs,
						sender: fishSender,
						data: data.data,
						outputFail: message => { outputFail(message, sender); failed = true; },
						outputSuccess: message => outputSuccess(message, sender),
						output: message => outputMessage(message, sender),
						f: f_client,
						execServer: command => serverHandler.handleMessage(command),
						admins: Vars.netServer.admins,
						lastUsedSender: usageData.lastUsed,
						lastUsedSuccessfullySender: usageData.lastUsedSuccessfully,
						lastUsedSuccessfully: (globalUsageData[name] ??= { lastUsed: -1, lastUsedSuccessfully: -1 }).lastUsedSuccessfully,
						allCommands,
						currentTapMode: fishSender.tapInfo.commandName == null ? "off" : fishSender.tapInfo.mode,
						handleTaps(mode){
							if(data.tapped == undefined) crash(`No tap handler to activate: command "${name}"`);
							if(mode == "off"){
								fishSender.tapInfo.commandName = null;
							} else {
								fishSender.tapInfo.commandName = name;
								fishSender.tapInfo.mode = mode;
							}
							fishSender.tapInfo.lastArgs = resolvedArgs;
						},
					};
					const requirements = typeof data.requirements == "function" ? data.requirements(args) : data.requirements;
					requirements?.forEach(r => r(args));
					await data.handler(args);
					//Update usage data
					if(!failed){
						usageData.lastUsedSuccessfully = globalUsageData[name].lastUsedSuccessfully = Date.now();
					}
				} catch(err){
					if(err instanceof CommandError){
						//If the error is a command error, then just outputFail
						outputFail(err.data, sender);
					} else {
						sender.sendMessage(`[scarlet]\u274C An error occurred while executing the command!`);
						if(fishSender.hasPerm("seeErrorMessages")) sender.sendMessage(parseError(err));
						Log.err(`Unhandled error in command execution: ${fishSender.cleanedName} ran /${name}`);
						Log.err(err as Error);
						Log.err((err as Error).stack!);
					}
				} finally {
					usageData.lastUsed = globalUsageData[name].lastUsed = Date.now();
				}
			} })
		);
		allCommands[name] = data;
	}
}

export function registerConsole(commands:Record<string, FishConsoleCommandData<string, any>>, serverHandler:ServerCommandHandler){

	for(const [name, data] of Object.entries(commands)){

		//Process the args
		const processedCmdArgs = data.args.map(processArgString);
		serverHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
		serverHandler.register(
			name,
			convertArgs(processedCmdArgs, false),
			data.description,
			new CommandHandler.CommandRunner({ async accept(rawArgs: string[]){
				if(!initialized) crash(`Commands not initialized!`);

				//closure over processedCmdArgs, should be fine
				//Process the args
				let resolvedArgs;
				try {
					resolvedArgs = await processArgs(rawArgs, processedCmdArgs, null);
				} catch(err){
					//if args are invalid
					if(err instanceof CommandError) Log.err(err);
					return;
				}

				const usageData = (globalUsageData["_console_" + name] ??= { lastUsed: -1, lastUsedSuccessfully: -1 });
				try {
					let failed = false;
					data.handler({
						rawArgs,
						args: resolvedArgs,
						data: data.data,
						outputFail: message => { outputConsole(message, Log.err); failed = true; },
						outputSuccess: outputConsole,
						output: outputConsole,
						f: f_server,
						execServer: command => serverHandler.handleMessage(command),
						admins: Vars.netServer.admins,
						...usageData
					});
					usageData.lastUsed = Date.now();
					if(!failed) usageData.lastUsedSuccessfully = Date.now();
				} catch(err){
					usageData.lastUsed = Date.now();
					if(err instanceof CommandError){
						Log.warn(typeof err.data == "function" ? err.data("&fr") : err.data);
					} else {
						Log.err("&lrAn error occured while executing the command!&fr");
						Log.err(parseError(err));
					}
				}
			} })
		);
		allConsoleCommands[name] = data;
	}
}



export function initialize(){
	if(initialized){
		crash("Already initialized commands.");
	}
	for(const [key, command] of Object.entries(allConsoleCommands)){
		if(command.init) command.data = command.init();
	}
	for(const [key, command] of Object.entries(allCommands)){
		if(command.init) command.data = command.init();
	}
	initialized = true;
}
export function reset(){
	initialized = false;
	for(const [key, command] of Object.entries(allConsoleCommands)){
		if(command.init) command.data = undefined;
	}
	for(const [key, command] of Object.entries(allCommands)){
		if(command.init) command.data = undefined;
	}
}
