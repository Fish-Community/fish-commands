import type { FishCommandData, FishConsoleCommandData } from "/frameworks/commands/types";
import type { ClientCommandHandler, ServerCommandHandler } from "/types";
/** Stores all chat comamnds by their name. */
export declare const allCommands: Record<string, FishCommandData<string, any>>;
/** Stores all console commands by their name. */
export declare const allConsoleCommands: Record<string, FishConsoleCommandData<string, any>>;
/** Helper function to get the correct type for command lists. */
export declare const commandList: <A extends Record<string, string>>(list: { [K in keyof A]: FishCommandData<A[K], any>; }) => Record<keyof A, FishCommandData<string, any> | (() => FishCommandData<string, any>)>;
/** Helper function to get the correct type for command lists. */
export declare const consoleCommandList: <A extends Record<string, string>>(list: { [K in keyof A]: FishConsoleCommandData<A[K], any>; }) => Record<keyof A, FishConsoleCommandData<string, any>>;
export declare function command<const TParam extends string, TData>(cmd: FishCommandData<TParam, TData>): FishCommandData<TParam, TData>;
export declare function command<const TParam extends string, TData>(cmd: () => FishCommandData<TParam, TData>): FishCommandData<TParam, TData>;
export declare function command<TParam extends string, TData>(cmd: FishConsoleCommandData<TParam, TData>): FishConsoleCommandData<TParam, TData>;
export declare function formatArg(a: string): string;
export declare function handleTapEvent(event: EventType["TapEvent"]): void;
/**
 * Registers all commands in a list to a client command handler.
 **/
export declare function register(commands: Record<string, FishCommandData<string, any> | (() => FishCommandData<string, any>)>, clientHandler: ClientCommandHandler, serverHandler: ServerCommandHandler): void;
export declare function registerConsole(commands: Record<string, FishConsoleCommandData<string, any>>, serverHandler: ServerCommandHandler): void;
export declare function initialize(): void;
export declare function reset(): void;
