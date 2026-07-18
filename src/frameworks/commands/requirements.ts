/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the requirements system, which is part of the commands framework.
*/

import { Gamemode, GamemodeName } from "/config";
import { fail } from "/frameworks/commands/errors";
import { PermType } from "/frameworks/commands/perm";
import type { FishCommandHandlerData } from "/frameworks/commands/types";
import { FishPlayer } from "/players";
import { formatModeName } from "/utils";

export const Req = {
	mode: (...modes:GamemodeName[]) => () =>
		modes.map(mode => Gamemode[mode]()).some(Boolean)
			|| fail(`This command is only available in ${modes.map(formatModeName).join(" or ")}`),
	modeNot: (mode:GamemodeName) => () =>
		!Gamemode[mode]()
			|| fail(`This command is disabled in ${formatModeName(mode)}`),
	moderate: <T extends string>(argName:T, allowSameRank:boolean = false, minimumLevel:PermType = "mod", allowSelfIfUnauthorized = false) =>
		({args, sender}:{args:Partial<Record<T, FishPlayer>>, sender:FishPlayer}) =>
			(args[argName] == undefined || sender.canModerate(args[argName], !allowSameRank, minimumLevel, allowSelfIfUnauthorized)
				|| fail(`You do not have permission to perform moderation actions on this player.`)),
	cooldown: (durationMS:number) => ({lastUsedSuccessfullySender}:Pick<FishCommandHandlerData<never, unknown>, "lastUsedSuccessfullySender">) =>
		Date.now() - lastUsedSuccessfullySender >= durationMS
			|| fail(`This command was run recently and is on cooldown.`),
	cooldownGlobal: (durationMS:number) => ({lastUsedSuccessfully}:Pick<FishCommandHandlerData<never, unknown>, "lastUsedSuccessfully">) =>
		Date.now() - lastUsedSuccessfully >= durationMS
			|| fail(`This command was run recently and is on cooldown.`),
	gameRunning: () =>
		!Vars.state.gameOver
			|| fail(`This game is over, please wait for the next map to load.`),
	teamAlive: ({sender}:{sender:FishPlayer<true>}) =>
		sender.team().isAlive()
			|| fail(Math.random() > 0.9 ? "You are already dead." : `Your team is dead.`),
	unitExists: (message = "You must be in a unit to use this command.") =>
		({sender}:{sender:FishPlayer}) =>
			(sender.connected() && sender.unit()?.added && !sender.unit()!.dead)
				|| fail(message),
	numberRange: <T extends string>(argName: T, min:number, max:number) =>
		({args}:{args:Partial<Record<T, number>>}) =>
			args[argName] == undefined || min <= args[argName] && args[argName] <= max
				|| fail(`${argName} must be between ${min} and ${max}`),
	integer: <T extends string>(argName: T) =>
		({args}:{args:Partial<Record<T, number>>}) =>
			args[argName] == undefined || Number.isSafeInteger(args[argName])
				|| fail(`${argName} must be an integer`),
	integerRange: <T extends string>(argName: T, min:number, max:number) =>
		({args}:{args:Partial<Record<T, number>>}) =>
			Req.integer(argName)({args}) && Req.numberRange(argName, min, max)({args}),
	positiveInteger: <T extends string>(argName: T) =>
		({args}:{args:Partial<Record<T, number>>}) =>
			Req.integer(argName)({args}) &&
			(args[argName] == undefined || args[argName] > 0
				|| fail(`${argName} must be positive`)),

};
