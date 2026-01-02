import type { PartialFormatString } from "/frameworks/commands/types";
declare class _FAKE_CommandError {
    data: string | PartialFormatString;
}
export declare const CommandError: typeof _FAKE_CommandError;
export declare function fail(message: string | PartialFormatString): never;
export {};
