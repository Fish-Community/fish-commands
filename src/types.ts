/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains type definitions that are shared across files.
*/

import type { CommandArgType, FFunction, Perm } from "/commands";
import type { FishPlayer } from "/players";
import type { Rank, RoleFlag } from "/ranks";

/**
 * Selects the type of the string keys of an enum-like class, like this:
 * ```
 * class Foo {
 * 	static foo1 = new Foo("foo1");
 * 	static foo2 = new Foo("foo2");
 * 	static foo3 = new Foo("foo3");
 * 	constructor(
 * 		public bar: string,
 * 	){}
 * }
 * type __ = SelectEnumClassKeys<typeof Foo>; //=> "foo1" | "foo2" | "foo3"
 * ```
 */
export type SelectEnumClassKeys<C extends Function,
	Key extends keyof C = keyof C
> = Key extends unknown ? ( //trigger DCT
	C[Key] extends C["prototype"] ? //if C[Key] is a C
		Key extends "prototype" ? never : Key //and Key is not the string "prototype", return it
	: never
) : never;

export type FishCommandArgType = TypeOfArgType<CommandArgType> | undefined;

/** Maps an arg type string to the TS type used to store it. Example: returns `number` for "time". */
export type TypeOfArgType<T> =
	T extends "string" ? string :
	T extends "boolean" ? boolean :
	T extends "number" ? number :
	T extends "time" ? number :
	T extends "team" ? Team :
	T extends "player" ? FishPlayer :
	T extends "exactPlayer" ? FishPlayer :
	T extends "offlinePlayer" ? FishPlayer :
	T extends "unittype" ? UnitType :
	T extends "block" ? Block :
	T extends "uuid" ? string :
	T extends "map" ? MMap :
	T extends "rank" ? Rank :
	T extends "roleflag" ? RoleFlag :
	T extends "item" ? Item :
	never;

/**
 * Returns the type of args given a union of the arg string types.
 * Example: given `"player:player?" | "force:boolean"` returns `{player: FishPlayer | null; force: boolean;}`
 **/
export type ArgsFromArgStringUnion<ArgStringUnion extends string> = {
	[Arg in ArgStringUnion as KeyFor<Arg>]: ValueFor<Arg>;
};

/** Reads the key from an arg string. */
export type KeyFor<ArgString> = ArgString extends `${infer K}:${string}` ? K : never;
/** Reads the value from an arg string, and determines whether it is optional. */
export type ValueFor<ArgString> =
	//optional
	ArgString extends `${string}:${infer V}?` ? TypeOfArgType<V> | undefined :
	//required
	ArgString extends `${string}:${infer V}` ? TypeOfArgType<V> :
	never;

export type TapHandleMode = "off" | "once" | "on";

/** Anything that can be formatted by the `f` tagged template function. */
export type Formattable = FishPlayer | Rank | RoleFlag | Error | mindustryPlayer | string | boolean | number | PlayerInfo | UnitType | Block | Team | Item;
/**
 * A message that requires some other data to complete it.
 * For example, format string cannot be fully interpolated without knowing their start color,
 * so they return a function that accepts that information.
 */
export type PartialFormatString<TData = string | null> = ((data:TData) => string) & {__partialFormatString:true};
/** The data passed to a command handler. */
export type FishCommandHandlerData<ArgType extends string, StoredData> = {
	/** Raw arguments that were passed to the command. */
	rawArgs:Array<string | undefined>;
	/**
	 * Formatted and parsed args. Access an argument by name, like python's keyword args.
	 * Example: `args.player.setRank(Rank.mod);`.
	 * An argument can only be null if it was declared optional, otherwise the command will error before the handler runs.
	 */
	args:Expand<ArgsFromArgStringUnion<ArgType>>;
	/** The player who ran the command. */
	sender:FishPlayer;
	/** Arbitrary data specific to the command. */
	data:StoredData;
	currentTapMode:TapHandleMode;
	/** List of every registered command, including this one. */
	allCommands:Record<string, FishCommandData<string, any>>;
	/** Timestamp of the last time this command was run successfully by any player. */
	lastUsedSuccessfully:number;
	/** Timestamp of the last time this command was run by the current sender. */
	lastUsedSender:number;
	/** Timestamp of the last time this command was run succesfully by the current sender. */
	lastUsedSuccessfullySender:number;
};
/** The utility functions passed to a command handler. */
export type FishCommandHandlerUtils = {
	/** Vars.netServer.admins */
	admins: Administration;
	/** Outputs text to the sender, with a check mark symbol and green color. */
	outputSuccess(this:void, message:string | PartialFormatString):void;
	/** Outputs text to the sender, with a fail symbol and yellow color. */
	outputFail(this:void, message:string | PartialFormatString):void;
	/** Outputs text to the sender. Tab characters are replaced with 4 spaces. */
	output(this:void, message:string | PartialFormatString):void;
	/** Use to tag template literals, formatting players, numbers, ranks, and more */
	f:FFunction;
	/** Executes a server console command. Be careful! */
	execServer(this:void, message:string):void;
	/** Call this function to set tap handling mode. */
	handleTaps(this:void, mode:TapHandleMode):void;
};
export type FishCommandHandler<ArgType extends string, StoredData> =
	(fish:FishCommandHandlerData<ArgType, StoredData> & FishCommandHandlerUtils) => void | Promise<void>;

export type FishConsoleCommandRunner<ArgType extends string, StoredData> = (_:{
	/** Raw arguments that were passed to the command. */
	rawArgs:Array<string | undefined>;
	/**
	 * Formatted and parsed args.
	 * Access an argument by name, like python's keyword args.
	 * Example: `args.player.mod = true`.
	 * An argument can only be null if it was optional, otherwise the command will error before the handler runs.
	 **/
	args:ArgsFromArgStringUnion<ArgType>;
	data:StoredData;
	/** Outputs text to the console. */
	outputSuccess(this:void, message:string | PartialFormatString):void;
	/** Outputs text to the console, using warn(). */
	outputFail(this:void, message:string | PartialFormatString):void;
	/** Outputs text to the console. Tab characters are replaced with 4 spaces. */
	output(this:void, message:string | PartialFormatString):void;
	/** Use to tag template literals, formatting players, numbers, ranks, and more */
	f:FFunction;
	/** Executes a server console command. Be careful to not commit recursion as that will cause a crash.*/
	execServer(this:void, message:string):void;
	/** Vars.netServer.admins */
	admins: Administration;
	/** Timestamp of the last time this command was run. */
	lastUsed:number;
	/** Timestamp of the last time this command was run succesfully. */
	lastUsedSuccessfully:number;
}) => unknown;


export type TapHandler<ArgType extends string, StoredData> = (_:{
	/** Last args used to call the parent command. */
	args:ArgsFromArgStringUnion<ArgType>;
	sender:FishPlayer;
	x:number;
	y:number;
	tile:Tile;
	data:StoredData;
	output(this:void, message:string | PartialFormatString):void;
	outputFail(this:void, message:string | PartialFormatString):void;
	outputSuccess(this:void, message:string | PartialFormatString):void;
	/** Use to tag template literals, formatting players, numbers, ranks, and more */
	f:TagFunction<Formattable, PartialFormatString>;
	currentTapMode:TapHandleMode;
	/** Call this function to set tap handling mode. */
	handleTaps(this:void, mode:TapHandleMode):void;
	/** Timestamp of the last time this command was run. */
	commandLastUsed:number;
	/** Timestamp of the last time this command was run succesfully. */
	commandLastUsedSuccessfully:number;
	/** Vars.netServer.admins */
	admins: Administration;
	/** Timestamp of the last time this tap handler was run. */
	lastUsed:number;
	/** Timestamp of the last time this tap handler was run succesfully. (without fail() being called) */
	lastUsedSuccessfully:number;
}) => unknown;

export type FishCommandRequirement<ArgType extends string, StoredData> =
	(data:FishCommandHandlerData<ArgType, StoredData>) => unknown;

export type FishCommandData<ArgType extends string, StoredData> = {
	/** Args for this command, like ["player:player", "reason:string?"] */
	args: readonly ArgType[];
	description: string;
	/**
	 * Permission level required for players to run this command.
	 * If the player does not have this permission, the handler is not run and an error message is printed.
	 **/
	perm: Perm;
	/** Custom error message for unauthorized players. The default is `You do not have the required permission (mod) to execute this command`. */
	customUnauthorizedMessage?: string;
	/** Called exactly once at server start. Use this to add event handlers. */
	init?: () => StoredData;
	data?: StoredData;
	requirements?: Array<NoInfer<FishCommandRequirement<ArgType, StoredData>>>;
	handler: FishCommandHandler<ArgType, StoredData>;
	tapped?: TapHandler<ArgType, StoredData>;
	/** If true, this command is hidden and pretends to not exist for players that do not have access to it.. */
	isHidden?: boolean;
}
export type FishConsoleCommandData<ArgType extends string, StoredData> = {
	/** Args for this command, like ["player:player", "reason:string?"] */
	args: ArgType[];
	description: string;
	/** Called exactly once at server start. Use this to add event handlers. */
	init?: () => StoredData;
	data?: StoredData;
	handler: FishConsoleCommandRunner<ArgType, StoredData>;
}


export type TileHistoryEntry = {
	name:string;
	action:string;
	type:string;
	time:number;
}


export type FishPlayerData = {
	uuid: string;
	name: string;
	muted: boolean;
	autoflagged: boolean;
	unmarkTime: number;
	rank: string;
	flags: string[];
	highlight: string | null;
	rainbow: { speed:number; } | null;
	history: PlayerHistoryEntry[];
	usid: string | Partial<Record<string, string>> | null;
	chatStrictness: "chat" | "strict";
	lastJoined: number;
	firstJoined: number;
	stats: {
		blocksBroken: number;
		blocksPlaced: number;
		timeInGame: number;
		chatMessagesSent: number;
		gamesFinished: number;
		gamesWon: number;
	};
	showRankPrefix: boolean;
	pollResponse: 0 | 1 | 2 | 3 | 4;
}

export type PlayerHistoryEntry = {
	action:string;
	by:string;
	time:number;
}

export type ClientCommandHandler = {
	register(name:string, args:string, description:string, runner:CommandRunner<mindustryPlayer>):void;
	removeCommand(name:string):void;
}

export type ServerCommandHandler = {
	/** Executes a server console command. */
	handleMessage(command:string):void;
	register(name:string, args:string, description:string, runner:CommandRunner<null>):void;
	removeCommand(name:string):void;
}

export type PreprocessedCommandArg = {
	type: CommandArgType;
	/** Whether the argument is optional (and may be null) */
	optional?: boolean;
}

export type PreprocessedCommandArgs = Record<string, PreprocessedCommandArg>;

export type CommandArg = {
	name: string;
	type: CommandArgType;
	isOptional: boolean;
}

export type FlaggedIPData = {
	name: string;
	uuid: string;
	ip: string;
	moderated: boolean;
};

export type Boolf<T> = (input:T) => boolean;
export type Expand<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export type TagFunction<Tin = string, Tout = string> = (stringChunks: readonly string[], ...varChunks: readonly Tin[]) =>Tout
