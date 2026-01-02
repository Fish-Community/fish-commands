/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the formatting framework.
*/
import type { Formattable, PartialFormatString } from "/frameworks/commands/types";
import { escapeStringColorsServer, tagProcessorPartial } from "/funcs";
import { ipPattern, uuidPattern } from "/globals";
import { FishPlayer } from "/players";
import { Rank, RoleFlag } from "/ranks";
import type { TagFunction } from "/types";

export const outputFormatter_server = tagProcessorPartial<Formattable, string | null>((chunk) => {
	if(chunk instanceof FishPlayer){
		return `&c(${escapeStringColorsServer(chunk.cleanedName)})&fr`;
	} else if(chunk instanceof Rank){
		return `&p${chunk.name}&fr`;
	} else if(chunk instanceof RoleFlag){
		return `&p${chunk.name}&fr`;
	} else if(chunk instanceof Error){
		return `&r${escapeStringColorsServer(chunk.toString())}&fr`;
	} else if(chunk instanceof Player){
		const player = chunk; //not sure why this is necessary, typescript randomly converts any to unknown
		return `&cPlayer#${player.id} (${escapeStringColorsServer(Strings.stripColors(player.name))})&fr`;
	} else if(typeof chunk == "string"){
		if(uuidPattern.test(chunk)){
			return `&b${chunk}&fr`;
		} else if(ipPattern.test(chunk)){
			return `&b${chunk}&fr`;
		} else {
			return `${chunk}`;
		}
	} else if(typeof chunk == "boolean"){
		return `&b${chunk.toString()}&fr`;
	} else if(typeof chunk == "number"){
		return `&b${chunk.toString()}&fr`;
	} else if(chunk instanceof Administration.PlayerInfo){
		return `&c${escapeStringColorsServer(chunk.plainLastName())}&fr`;
	} else if(chunk instanceof UnitType){
		return `&c${chunk.localizedName}&fr`;
	} else if(chunk instanceof Block){
		return `&c${chunk.localizedName}&fr`;
	} else if(chunk instanceof Team){
		return `&c${chunk.name}&fr`;
	} else if(chunk instanceof Item){
		return `&c${chunk.name}&fr`;
	} else {
		chunk satisfies never;
		Log.err("Invalid format object!");
		Log.info(chunk);
		return chunk as string; //let it get stringified by the JS engine
	}
});
export const outputFormatter_client = tagProcessorPartial<Formattable, string | null>((chunk, i, data, stringChunks) => {
	const reset = data ?? stringChunks[0].match(/^\[.+?\]/)?.[0] ?? "";
	if(chunk instanceof FishPlayer){
		return `[cyan](${chunk.name}[cyan])` + reset;
	} else if(chunk instanceof Rank){
		return `${chunk.color}${chunk.name}[]` + reset;
	} else if(chunk instanceof RoleFlag){
		return `${chunk.color}${chunk.name}[]` + reset;
	} else if(chunk instanceof Error){
		return `[red]${chunk.toString()}` + reset;
	} else if(chunk instanceof Player){
		const fishP = FishPlayer.get(chunk);
		return `[cyan](${fishP.name}[cyan])` + reset;
	} else if(typeof chunk == "string"){
		if(uuidPattern.test(chunk)){
			return `[blue]${chunk}[]`;
		} else if(ipPattern.test(chunk)){
			return `[blue]${chunk}[]`;
		} else {
			//TODO reset color?
			return chunk;
		}
	} else if(typeof chunk == "boolean"){
		return `[blue]${chunk.toString()}[]`;
	} else if(typeof chunk == "number"){
		return `[blue]${chunk.toString()}[]`;
	} else if(chunk instanceof Administration.PlayerInfo){
		return chunk.lastName + reset;
	} else if(chunk instanceof UnitType){
		return `[cyan]${chunk.localizedName}[]`;
	} else if(chunk instanceof Block){
		return `[cyan]${chunk.localizedName}[]`;
	} else if(chunk instanceof Team){
		return `[white]${chunk.coloredName()}[][]`;
	} else if(chunk instanceof Item){
		return `[cyan]${chunk.name}[]`;
	} else {
		chunk satisfies never;
		Log.err("Invalid format object!");
		Log.info(chunk);
		return chunk as string; //allow it to get stringified by the engine
	}
});

type DeduplicateTupleFunction<T extends TupleFunction> =
	T extends (...args:infer Args) => [client:infer Out, server:infer Out] ?
		(...args:Args) => Out
	: never;
type TupleFunction = (...args: any[]) => [client: string, server: string];
export const fFunctions = {
	boolGood(value:boolean){
		return [
			value ? `[green]true[]` : `[red]false[]`,
			value ? `&lgtrue&fr` : `&lrfalse&fr`,
		];
	},
	boolBad(value:boolean){
		return [
			value ? `[red]true[]` : `[green]false[]`,
			value ? `&lrtrue&fr` : `&lgfalse&fr`,
		];
	},
	percent(value:number, decimals = 0){
		if(isNaN(value) || !isFinite(value)) return ["[gray]N/A[]", "N/A"];
		const percent = (value * 100).toFixed(decimals) + "%";
		return [`${percent}`, `${percent}`];
	},
	number(value:number, decimals:number | null = null){
		if(isNaN(value) || !isFinite(value)) return ["[gray]N/A[]", "N/A"];
		if(decimals !== null) return [value.toFixed(decimals), value.toFixed(decimals)];
		return [value.toString(), value.toString()];
	}
} satisfies Record<string, TupleFunction>;
export const processedFFunctions = ([0, 1] as const).map(i =>
	Object.fromEntries(Object.entries(fFunctions).map(([k, v]) => [k,
		(...args:any) => (v as TupleFunction).apply(processedFFunctions[i], args)[i]
	])) as {
		[K in keyof typeof fFunctions]: DeduplicateTupleFunction<(typeof fFunctions)[K]>;
	}
);
export type FFunction = TagFunction<Formattable, PartialFormatString<string | null>> & typeof processedFFunctions[0];
export const f_client = Object.assign(outputFormatter_client, processedFFunctions[0]);
export const f_server = Object.assign(outputFormatter_server, processedFFunctions[1]);
