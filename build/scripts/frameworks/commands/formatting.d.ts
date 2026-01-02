import type { Formattable, PartialFormatString } from "/frameworks/commands/types";
import type { TagFunction } from "/types";
export declare const outputFormatter_server: TagFunction<Formattable, PartialFormatString<string | null>>;
export declare const outputFormatter_client: TagFunction<Formattable, PartialFormatString<string | null>>;
export declare const fFunctions: {
    boolGood(value: boolean): [string, string];
    boolBad(value: boolean): [string, string];
    percent(value: number, decimals?: any): [string, string];
    number(value: number, decimals?: number | null): [string, string];
};
export declare const processedFFunctions: readonly [{
    boolGood: (value: boolean) => string;
    boolBad: (value: boolean) => string;
    percent: (value: number, decimals?: any) => string;
    number: (value: number, decimals?: number | null | undefined) => string;
}, {
    boolGood: (value: boolean) => string;
    boolBad: (value: boolean) => string;
    percent: (value: number, decimals?: any) => string;
    number: (value: number, decimals?: number | null | undefined) => string;
}];
export type FFunction = TagFunction<Formattable, PartialFormatString<string | null>> & typeof processedFFunctions[0];
export declare const f_client: TagFunction<Formattable, PartialFormatString<string | null>> & {
    boolGood: (value: boolean) => string;
    boolBad: (value: boolean) => string;
    percent: (value: number, decimals?: any) => string;
    number: (value: number, decimals?: number | null | undefined) => string;
};
export declare const f_server: TagFunction<Formattable, PartialFormatString<string | null>> & {
    boolGood: (value: boolean) => string;
    boolBad: (value: boolean) => string;
    percent: (value: number, decimals?: any) => string;
    number: (value: number, decimals?: number | null | undefined) => string;
};
