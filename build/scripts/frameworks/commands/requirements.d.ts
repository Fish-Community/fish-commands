import { GamemodeName } from "/config";
import { PermType } from "/frameworks/commands/perm";
import type { FishCommandHandlerData } from "/frameworks/commands/types";
import { FishPlayer } from "/players";
export declare const Req: {
    mode: (mode: GamemodeName) => () => true;
    modeNot: (mode: GamemodeName) => () => true;
    moderate: <T extends string>(argName: T, allowSameRank?: boolean, minimumLevel?: PermType, allowSelfIfUnauthorized?: boolean) => ({ args, sender }: {
        args: Partial<Record<T, FishPlayer>>;
        sender: FishPlayer;
    }) => true;
    cooldown: (durationMS: number) => ({ lastUsedSuccessfullySender }: Pick<FishCommandHandlerData<never, unknown>, "lastUsedSuccessfullySender">) => true;
    cooldownGlobal: (durationMS: number) => ({ lastUsedSuccessfully }: Pick<FishCommandHandlerData<never, unknown>, "lastUsedSuccessfully">) => true;
    gameRunning: () => true;
    teamAlive: ({ sender }: {
        sender: FishPlayer;
    }) => true;
    unitExists: (message?: string) => ({ sender }: {
        sender: FishPlayer;
    }) => true;
};
