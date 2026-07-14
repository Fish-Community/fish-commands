import { Perm } from "/frameworks/commands/perm";
import { Req } from "/frameworks/commands/requirements";
import type { CommandArgType, FishCommandHandlerUtils, Formattable, PartialFormatString, TapHandleMode, TypeOfArgType } from "/frameworks/commands/types";
import { FishPlayer } from "/players";
import type { CommandArg, TagFunction } from "/types";

type FishCommandTarget = "ingame" | "console" /* | "discord"*/;
type FishCommandArgs = Record<string, CommandArg>;
type ProvidedArgsFromType<Args extends FishCommandArgs> = {
	[Arg in keyof Args]: TypeOfArgType<Args[Arg]["type"]>;
};

type NewFishCommandStoredData<
	Args extends FishCommandArgs = FishCommandArgs,
	Targets extends FishCommandTarget = FishCommandTarget,
	StoredData = void
> = {
	name: string;
	/** Args for this command. */
	args: Map<string, CommandArg>;
	targets: Targets[];
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
	requirements?: Array<NewFishCommandRequirement<Args, Targets, StoredData>>;
	handler: NewFishCommandHandler<Args, Targets, StoredData>;
	tapped?: NewTapHandler<Args, StoredData>;
	/** If true, this command is hidden and pretends to not exist for players that do not have access to it.. */
	isHidden?: boolean;
}

type NewTapHandler<Args extends FishCommandArgs, StoredData> = (_: {
	/** Last args used to call the parent command. */
	args: ProvidedArgsFromType<Args>;
	sender: FishPlayer;
	x: number;
	y: number;
	tile: Tile;
	data: StoredData;
	output(this: void, message: string | PartialFormatString): void;
	outputFail(this: void, message: string | PartialFormatString): void;
	outputSuccess(this: void, message: string | PartialFormatString): void;
	/** Use to tag template literals, formatting players, numbers, ranks, and more */
	f: TagFunction<Formattable, PartialFormatString>;
	currentTapMode: TapHandleMode;
	/** Call this function to set tap handling mode. */
	handleTaps(this: void, mode: TapHandleMode): void;
	/** Timestamp of the last time this command was run. */
	commandLastUsed: number;
	/** Timestamp of the last time this command was run succesfully. */
	commandLastUsedSuccessfully: number;
	/** Vars.netServer.admins */
	admins: Administration;
	/** Timestamp of the last time this tap handler was run. */
	lastUsed: number;
	/** Timestamp of the last time this tap handler was run succesfully. (without fail() being called) */
	lastUsedSuccessfully: number;
	/** Call this function to add text to /copy. */
	copy<T extends string | number | undefined | null>(this: void, text:T):T;
	/** Call this function to add a player to the recent players list. */
	player<T extends mindustryPlayer | FishPlayer | PlayerInfo | null>(this: void, player:T):T; //TODO unify with HandlerUtils
}) => unknown;

type NewFishCommandHandlerData<Args extends FishCommandArgs, Targets extends FishCommandTarget, StoredData> = {
	/** Raw arguments that were passed to the command. */
	rawArgs: Array<string | undefined>;
	/**
	 * Formatted and parsed args. Access an argument by name, like python's keyword args.
	 * Example: `args.player.setRank(Rank.mod);`.
	 * An argument can only be null if it was declared optional, otherwise the command will error before the handler runs.
	 */
	args: ProvidedArgsFromType<Args>;
	/** The player who ran the command. */
	sender: Targets extends "ingame" ? FishPlayer : undefined;
	/** Arbitrary data specific to the command. */
	data: StoredData;
	currentTapMode: TapHandleMode;
	/** List of every registered command, including this one. */
	allCommands: Record<string, NewFishCommandStoredData>;
	/** Timestamp of the last time this command was run successfully by any player. */
	lastUsedSuccessfully: number;
	/** Timestamp of the last time this command was run by the current sender. */
	lastUsedSender: number;
	/** Timestamp of the last time this command was run succesfully by the current sender. */
	lastUsedSuccessfullySender: number;
};


type CommandArgBuilder = Pick<CommandArg, "type" | "isOptional"> | `${CommandArgType}${'?' | ''}`;

type ProcessArgs<T extends Record<string, CommandArgBuilder>> = {
	[K in keyof T]: T[K] extends CommandArg ? T[K] :
		T[K] extends `${infer A extends CommandArgType}${infer B extends '?' | ''}` ?
			{ name: string; type: A; isOptional: B extends '?' ? true : false; }
		: never;
};

type NewFishCommandRequirement<Args extends FishCommandArgs, Targets extends FishCommandTarget, StoredData> =
	(data: NewFishCommandHandlerData<Args, Targets, StoredData>) => unknown;

type NewFishCommandHandler<Args extends FishCommandArgs, Targets extends FishCommandTarget, StoredData> =
	(fish: NewFishCommandHandlerData<Args, Targets, StoredData> & FishCommandHandlerUtils) => void | Promise<void>;

type CommandBuilderData<Args extends FishCommandArgs, Targets extends FishCommandTarget, StoredData> = {
	"~name": string;
	/**
	 * Permission level required for players to run this command.
	 * If the player does not have this permission, the handler is not run and an error message is printed.
	 **/
	"~perm": Perm;
	"~description"?: string;
	"~targets"?: Targets[];
	"~data"?: StoredData;
	/** Called exactly once at server start. Use this to add event handlers. */
	"~init"?: StoredData extends void ? () => StoredData : (data:StoredData) => void;
	/** Args for this command. */
	"~args"?: Map<string, CommandArg>;
	"~requirements"?: Array<NewFishCommandRequirement<Args, Targets, StoredData>>;
	"~tapped"?: NewTapHandler<Args, StoredData>;
	"~handler"?: NewFishCommandHandler<Args, Targets, StoredData>;
	/** Custom error message for unauthorized players. The default is `You do not have the required permission (mod) to execute this command`. */
	"~customUnauthorizedMessage"?: string;
	/** If true, this command is hidden and pretends to not exist for players that do not have access to it.. */
	"~isHidden"?: true;
};
type CommandBuilderMethods<Args extends FishCommandArgs, Targets extends FishCommandTarget, StoredData> = {
	description(desc:string): CommandBuilder<Args, Targets, StoredData,
		"handler" | "tapped" | "requirements" | "args" | "init" | "data" | "misc" | "target">;
	target<T extends FishCommandTarget>(...targets:T[]): CommandBuilder<Args, T, StoredData,
		"handler" | "tapped" | "requirements" | "args" | "init" | "data" | "misc">;
	misc(options:{ customUnauthorizedMessage?: string; hidden?: true; }): CommandBuilder<Args, Targets, StoredData,
		"handler" | "tapped" | "requirements" | "args" | "init" | "data">;
	data<T>(data:T): CommandBuilder<Args, Targets, T,
		"handler" | "tapped" | "requirements" | "args" | "init">;
	init<T>(func:StoredData extends void ? () => T : (data:StoredData) => void): CommandBuilder<Args, Targets, StoredData extends void ? T : StoredData,
		"handler" | "tapped" | "requirements" | "args">;
	args(): CommandBuilder<{}, Targets, StoredData,
		"handler" | "tapped" | "requirements">;
	args<T extends Record<string, CommandArgBuilder>>(args: T): CommandBuilder<ProcessArgs<T>, Targets, StoredData,
		"handler" | "tapped" | "requirements">;
	requirements(...requirements:Array<NewFishCommandRequirement<Args, Targets, StoredData>>): CommandBuilder<Args, Targets, StoredData,
		"handler" | "tapped">;
	tapped(handler:NewTapHandler<Args, StoredData>): CommandBuilder<Args, Targets, StoredData,
		"handler">;
	handler(handler:NewFishCommandHandler<Args, Targets, StoredData>): NewFishCommandStoredData<Args, Targets, StoredData>;
};
type KeyofCommandBuilderMethods = keyof CommandBuilderMethods<FishCommandArgs, FishCommandTarget, void>;

type CommandBuilder<
	Args extends FishCommandArgs,
	Targets extends FishCommandTarget,
	StoredData,
	Keys extends KeyofCommandBuilderMethods,
> = CommandBuilderData<Args, Targets, StoredData> & Pick<CommandBuilderMethods<Args, Targets, StoredData>, Keys>;
type CommandBuilder_<Keys extends KeyofCommandBuilderMethods = "description"> = CommandBuilder<FishCommandArgs, "ingame", void, Keys>;
type BuiltCommand = "todo";
// export function command(name:string, perm:Perm, callback:(builder:CommandBuilder) => BuiltCommand):BuiltCommand;
export function command(name:string, perm:Perm):CommandBuilder_;
export function command(name:string, perm:Perm, callback?:(builder:CommandBuilder_) => BuiltCommand):CommandBuilder_ {
	const builder: CommandBuilder_<KeyofCommandBuilderMethods> = {
		"~name": name,
		"~perm": perm,
		description(desc){
			this["~description"] = desc;
			return this;
		},
		target<T extends FishCommandTarget>(...targets:T[]){
			const _this = this as CommandBuilder<FishCommandArgs, T, void, KeyofCommandBuilderMethods>;
			_this["~targets"] = targets;
			return _this;
		},
		misc({customUnauthorizedMessage, hidden}){
			this["~customUnauthorizedMessage"] = customUnauthorizedMessage;
			this["~isHidden"] = hidden;
			return this;
		},
		data<T>(data:T){
			const _this = this as never as CommandBuilder<FishCommandArgs, "ingame", T, KeyofCommandBuilderMethods>;
			_this["~data"] = data;
			return _this;
		},
		init(func){
			this["~init"] = func;
			return this as any;
		},
		args<T extends Record<string, CommandArgBuilder>>(args: T | undefined = {} as T){
			this["~args"] = new Map(Object.entries(args).map(([k, v]) => [k,
				typeof v == "string" ? {
					name: k, type: v.endsWith("?") ? v.slice(0, -1) as CommandArgType : v as CommandArgType, isOptional: v.endsWith("?")
				} : { name: k, ...v }
			] as const));
			return this as any;
		},
		requirements(...requirements){
			this["~requirements"] = requirements;
			return this;
		},
		tapped(handler) {
			this["~tapped"] = handler;
			return this;
		},
		handler(handler) {
			this["~handler"] = handler;
			const data: NewFishCommandStoredData = {
				name: this["~name"],
				args: this["~args"] ?? new Map(),
				targets: this["~targets"] ?? ["ingame"],
				description: this["~description"]!,
				handler: this["~handler"],
				perm: this["~perm"],
				customUnauthorizedMessage: this["~customUnauthorizedMessage"],
				isHidden: this["~isHidden"],
				data: this["~data"],
				init: this["~init"],
				requirements: this["~requirements"],
				tapped: this["~tapped"],
			};
			if(data.targets.includes("ingame")) register(data);
			if(data.targets.includes("console")) registerConsole(data as any);
			return data as any;
		},
	};
	return builder;
}

/**
 * Registers one command to a client command handler.
 **/
function register<
	Args extends FishCommandArgs,
	Targets extends FishCommandTarget,
	StoredData = void
>(command: NewFishCommandStoredData<Args, Targets, StoredData>){
	const clientHandler = Vars.netServer.clientCommands;
	const serverHandler = ServerControl.instance.handler;
	const { name } = command;
	clientHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
	clientHandler.register(
		name,
		convertArgs(command.args, true),
		command.description,
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		new CommandHandler.CommandRunner({ async accept(unjoinedRawArgs: string[], sender: mindustryPlayer){
			if(!initialized) crash(`Commands not initialized!`);

			const fishSender = FishPlayer.get(sender);
			FishPlayer.onPlayerCommand(fishSender, name, unjoinedRawArgs);

			//Verify authorization
			//as a bonus, this crashes if data.perm is undefined
			if(!command.perm.check(fishSender)){
				if(command.customUnauthorizedMessage){
					outputFail(command.customUnauthorizedMessage, sender);
					FishEvents.fire("commandUnauthorized", [fishSender, name]);
				} else if(command.isHidden)
					outputMessage(hiddenUnauthorizedMessage, sender);
				else
					outputFail(command.perm.unauthorizedMessage, sender);
				return;
			}

			//closure over processedCmdArgs, should be fine
			//Process the args
			const rawArgs = joinArgs(unjoinedRawArgs); //TODO: remove this when we replace the command handler
			//Resolve missing args (such as players that need to be determined through a menu)
			let resolvedArgs;
			try {
				resolvedArgs = await processArgs(rawArgs, command, fishSender, name);
			} catch(err){
				handleError(err, fishSender, outputFail, `${fishSender.cleanedName} ran /${name}`);
				return;
			}

			let shouldClearCopy = true;
			let shouldClearPlayers = true;

			//Run the command handler
			const usageData = fishSender.getUsageData(name);
			let failed = false;
			try {
				const args: NewFishCommandHandlerData<Args, Targets, StoredData> & FishCommandHandlerUtils = {
					rawArgs,
					args: resolvedArgs,
					sender: fishSender,
					data: command.data,
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
						if(command.tapped == undefined) crash(`No tap handler to activate: command "${name}"`);
						if(mode == "off"){
							fishSender.tapInfo.commandName = null;
						} else {
							fishSender.tapInfo.commandName = name;
							fishSender.tapInfo.mode = mode;
						}
						fishSender.tapInfo.lastArgs = resolvedArgs;
					},
					copy(text){
						if(shouldClearCopy){
							fishSender.copyOptions = [];
							shouldClearCopy = false;
						}
						if(text) fishSender.copyOptions!.push(String(text));
						return text;
					},
					player(p){
						if(shouldClearPlayers){
							fishSender.recentPlayers.clear();
							shouldClearPlayers = false;
						}
						if(p instanceof FishPlayer) fishSender.recentPlayers!.add(p);
						else if(p instanceof Player) fishSender.recentPlayers!.add(FishPlayer.get(p));
						else if(p instanceof Administration.PlayerInfo) fishSender.recentPlayers!.add(FishPlayer.getFromInfo(p));
						return p;
					},
				};
				const requirements = command.requirements;
				requirements?.forEach(r => r(args));
				await command.handler(args);
				//Update usage data
				if(!failed){
					usageData.lastUsedSuccessfully = globalUsageData[name].lastUsedSuccessfully = Date.now();
				}
			} catch(err){
				handleError(err, fishSender, outputFail, `${fishSender.cleanedName} ran /${name}`);
			} finally {
				usageData.lastUsed = globalUsageData[name].lastUsed = Date.now();
			}
		} })
	);
	allCommands[name] = command;
}

export function registerConsole<
	Args extends FishCommandArgs,
	Targets extends FishCommandTarget & "console",
	StoredData = void
>(command: NewFishCommandStoredData<Args, Targets, StoredData>){
	//todo
}

command("unpause", Perm.trusted)
	.description("Unpauses the game.")
	.data({ unpaused: false })
	.init(data => {
		Events.on(EventType.PlayEvent, () => {
			if(data.unpaused){
				data.unpaused = false;
				Vars.state.rules.pvpAutoPause = true;
			}
		});
	})
	.args()
	.requirements(Req.mode("pvp"))
	.handler(({data, sender, outputSuccess}) => {
		Vars.state.rules.pvpAutoPause = false;
		data.unpaused = true;
		Core.app.post(() => Vars.state.set(GameState.State.playing));
		outputSuccess(`Unpaused.`);
	});

// command("spectate", Perm.play, cmd => {
// 	/** Mapping between player and original team */
// 	const spectators = new Map<FishPlayer, Team>();
// 	function spectate(target:FishPlayer){
// 		spectators.set(target, target.team());
// 		target.forceRespawn();
// 		target.setTeam(Team.derelict);
// 		target.forceRespawn();
// 	}
// 	function resume(target:FishPlayer){
// 		if(spectators.get(target) == null) return; // this state is possible for a person who left not in spectate
// 		target.setTeam(spectators.get(target)!);
// 		spectators.delete(target);
// 		target.forceRespawn();
// 	}
// 	Events.on(EventType.GameOverEvent, () => spectators.clear());
// 	Events.on(EventType.PlayerLeave, ({player}:{player:mindustryPlayer}) => resume(FishPlayer.get(player)));
// 	cmd
// 		.description("Toggles spectator mode in PVP games.")
// 		.args({ target: Arg.player().optional() })
// 		.requirements(Req.gameRunning)
// 		.handler(({sender, args: {target = sender}, outputSuccess, f}) => {
// 			if(!Gamemode.pvp() && !sender.hasPerm("mod")) fail(`You do not have permission to spectate on a non-pvp server.`);
// 			if(target !== sender && target.hasPerm("blockTrolling")) fail(`Target player is insufficiently trollable.`);
// 			if(target !== sender && !sender.ranksAtLeast("admin")) fail(`You do not have permission to force other players to spectate.`);
// 			if(spectators.has(target)){
// 				resume(target);
// 				outputSuccess(target == sender
// 					? f`Rejoining game as team ${target.team()}.`
// 					: f`Forced ${target} out of spectator mode.`
// 				);
// 			} else {
// 				spectate(target);
// 				outputSuccess(target == sender
// 					? f`Now spectating. Run /spectate again to resume gameplay.`
// 					: f`Forced ${target} into spectator mode.`)
// 				;
// 			}
// 		});
// });
	