import { GamemodeName } from "/config";
import { FishPlayer } from "/players";
import { RankName } from "/ranks";
import { SelectEnumClassKeys } from "/types";
/** Represents a permission that is required to do something. */
export declare class Perm {
    name: string;
    color: string;
    unauthorizedMessage: string;
    static perms: Partial<Record<string, Perm>>;
    static none: Perm;
    static trusted: Perm;
    static mod: Perm;
    static admin: Perm;
    static member: Perm;
    static chat: Perm;
    static bypassChatFilter: Perm;
    static seeMutedMessages: Perm;
    static play: Perm;
    static seeErrorMessages: Perm;
    static viewUUIDs: Perm;
    static blockTrolling: Perm;
    static visualEffects: Perm;
    static bulkVisualEffects: Perm;
    static bypassVoteFreeze: Perm;
    static bypassVotekick: Perm;
    static warn: Perm;
    static vanish: Perm;
    static changeTeam: Perm;
    /** Whether players should be allowed to change the team of a unit or building. If not, they will be kicked out of their current unit or building before switching teams. */
    static changeTeamExternal: Perm;
    static usidCheck: Perm;
    static runJS: Perm;
    static bypassNameCheck: Perm;
    static hardcore: Perm;
    static massKill: Perm;
    static voteOtherTeams: Perm;
    static immediatelyVotekickNewPlayers: Perm;
    check: (fishP: FishPlayer) => boolean;
    constructor(name: string, check: RankName | ((fishP: FishPlayer) => boolean), color?: string, unauthorizedMessage?: string);
    /** Creates a new Perm with overrides for specified gamemodes. */
    exceptModes(modes: Partial<Record<GamemodeName, Perm>>, unauthorizedMessage?: string): Perm;
    private static fromRank;
    static getByName(name: PermType): Perm;
}
export type PermType = SelectEnumClassKeys<typeof Perm>;
