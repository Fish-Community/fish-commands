import type { FishPlayer } from "./players";
import type { CommandArgType } from "./commands";


type FishCommandArgType = string | number | FishPlayer | boolean | null;
type MenuListener = (player:mindustryPlayer, option:number) => void;

type Cursed<Args extends Record<
	string, {type: CommandArgType, isOptional?:boolean}
>> = {
	[K in keyof Args]: (
		T extends "string" ? string :
		T extends "boolean" ? boolean :
		T extends "number" ? number :
		T extends "player" ? FishPlayer : 
		T extends "namedPlayer" ? FishPlayer :
		never
	) | (Args[K]["isOptional"] extends true ? null : never);
};

interface FishCommandRunner {
	(_:{
		/**Raw arguments that were passed to the command. */
		rawArgs:(string | undefined)[];
		/**Formatted and parsed args. Access an argument by name, like python's keyword args. Example: `args.player.mod = true`. An argument can only be null if it was optional, otherwise the command will error before the handler runs. */
		args:Record<string, any>;//TODO maybe get this with an abominable conditional type?
		//having to manually cast the args is super annoying
		//but if I leave it as any it causes bugs
		/**The player who ran the command. */
		sender:FishPlayer;
		outputSuccess:(message:string) => void;
		outputFail:(message:string) => void;
		output:(message:string) => void;
		/**Executes a server console command. Be careful! */
		execServer:(message:string) => void;
	}): void;
}

interface FishCommandData {
	/**Args for this command, like ["player:player", "reason:string?"] */
	args: string[];
	description: string;
	/**Permission level required for players to run this command. If the player does not have this permission, the handler is not run and an error message is printed. */
	level: PermissionsLevel;
	/**Custom error message for unauthorized players. The default is `You do not have the required permission (mod) to execute this command`. */
	customUnauthorizedMessage?: string;
	handler: FishCommandRunner;
}
type FishCommandsList = Record<string, FishCommandData>;

interface TileHistoryEntry {
  name:string;
  action:string;
  type:string;
  time:number;
}


interface FishPlayerData {
	name: string;
	muted: boolean;
	mod: boolean;
	admin: boolean;
	member: boolean;
	stopped: boolean;
	/*rank: Rank*/
	//TODO remove
	highlight: string | null;
	rainbow: { speed:number; } | null;
	history: PlayerHistoryEntry[];
}

interface PlayerHistoryEntry {
	action:string;
	by:string;
	time:number;
}
interface mindustryPlayerData {
	/**uuid */
	id: string;
	lastName: string;
	ips: Seq<string>;
	names: Seq<string>;
	adminUsid: string;
	timesKicked: number;
	timesJoined: number;
	admin: boolean;
	banned: boolean;
	lastKicked: number;
}

interface ClientCommandHandler {
	register(name:string, args:string, description:string, runner:(args:string[], player:mindustryPlayer) => void):void;
}

interface ServerCommandHandler {
	/**Executes a server console command. */
	handleMessage(command:string):void;
}

interface PreprocessedCommandArg {
	/**Type of the argument */
	t: CommandArgType;
	/**Whether the argument is optional (and may be null) */
	o?: boolean;
}

interface CommandArg {
	name: string;
	type: CommandArgType;
	isOptional: boolean;
}