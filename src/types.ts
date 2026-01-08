/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains type definitions that are shared across files.
*/

import type { CommandArgType } from "/frameworks/commands";

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
	unmarkTime: number;
	rank: string;
	flags: string[];
	highlight: string | null;
	rainbow: { speed:number; } | null;
	history: PlayerHistoryEntry[];
	usid: string | null;
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

export type Expand<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export type TagFunction<Tin = string, Tout = string> = (stringChunks: readonly string[], ...varChunks: readonly Tin[]) =>Tout
