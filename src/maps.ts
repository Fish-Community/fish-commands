/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the map run tracker and statistics computation. 
*/

import { FFunction } from '/commands';
import { computeStatistics, Duration } from '/funcs';
import { FishEvents } from '/globals';
import { dataClass, serialize } from '/io';
import { formatTime, formatTimeShort, match } from '/utils';
import { Gamemode } from '/config';

type FinishedMapRunData = {
	winTeam:Team;
	success:boolean; //winTeam == Vars.state.rules.defaultTeam
	startTime:number;
	endTime:number;
	maxPlayerCount:number;
	wave:number;
}
export class FinishedMapRun extends dataClass<FinishedMapRunData>() {
	//this constructor is useless, but rhino crashes with a bizarre error when trying to run the emitted code
	//do not remove this useless constructor
	constructor(data:FinishedMapRunData){
		super(data);
	}
	duration(){
		return this.endTime - this.startTime;
	}
	outcome(){
		if(Gamemode.pvp()){
			if(this.winTeam === Team.derelict) {
				if(this.duration() > Duration.minutes(20)) return ["rtv", "late rtv"] as const;
				else return ["rtv", "early rtv"] as const;
			} else return ["win", "win"] as const;
		} else {
			if(this.success) return ["win", "win"] as const;
			else if(this.winTeam === Team.derelict){
				if(this.duration() > Duration.minutes(3)) return ["loss", "late rtv"] as const;
				else return ["rtv", "early rtv"] as const;
			} else return ["loss", "loss"] as const;
		}
	}
}

export class PartialMapRun {
	static readonly key = "fish-partial-map-run";
	static current: PartialMapRun | null = null;
	static {
		FishEvents.on("saveData", () => {
			if(this.current) Core.settings.put(this.key, this.current.write());
		});
		FishEvents.on("loadData", () => {
			const data = Core.settings.getString(this.key);
			if(data){
				this.current = this.read(data);
			} else {
				//loading a map, but there is no run information, create one
				this.current = new this();
			}
		});
		Events.on(EventType.SaveLoadEvent, e => {
			//create a new run, if there isn't one already
			//loadData will have run first if it is a server restart
			this.current ??= new this();
		});
		Timer.schedule(() => {
			this.current?.update();
		}, 0, 5);
		Events.on(EventType.GameOverEvent, e => {
			if(this.current){
				const finishedRun = this.current.finish({ winTeam: e.winner ?? Team.derelict });
				const fmap = FMap.getCreate(Vars.state.map);

				//Highscore message
				if(Gamemode.attack() && finishedRun.success){
					const bestPreviousTime = fmap.stats().shortestWinTime;
					const duration = finishedRun.duration();
					Call.sendMessage(
`[orange]--------
${finishedRun.success && duration < bestPreviousTime ?
	`[green]New highscore! Map completed in [accent]${formatTimeShort(duration)}[]`
: `[orange]Map completed in [accent]${formatTimeShort(duration)}[]. Current highscore: [green]${formatTimeShort(bestPreviousTime)}[]`}
[orange]--------`
					);
				} else if(Gamemode.survival()){
					const bestPreviousWave = fmap.stats().highestWave;
					const wave = finishedRun.wave;
					Call.sendMessage(
`[orange]--------
${finishedRun.success && wave < bestPreviousWave ?
	`[green]New highscore! Reached wave [accent]${wave}[].`
: `[orange]Reached wave [accent]${wave}[]. Current highscore: [green]${bestPreviousWave}[]`}
[orange]--------`
					);
				}
				fmap.runs.push(finishedRun);
			}
			Core.settings.remove(this.key);
			this.current = null;
		});
	}

	startTime:number = Date.now();
	maxPlayerCount:number = 0;
	/** In milliseconds */
	duration(){
		return Date.now() - this.startTime;
	}
	update(){
		this.maxPlayerCount = Math.max(this.maxPlayerCount, Groups.player.size());
	}
	finish({winTeam}:{
		winTeam: Team;
	}):FinishedMapRun {
		return new FinishedMapRun({
			winTeam,
			success: Gamemode.pvp() ? true : winTeam == Vars.state.rules.defaultTeam,
			startTime: this.startTime,
			endTime: Date.now(),
			maxPlayerCount: this.maxPlayerCount,
			wave: Vars.state.wave,
		});
	}
	//Used for continuing through a restart
	write():string {
		return `${Date.now() - this.startTime}/${this.maxPlayerCount}`;
	}
	static read(data:string):PartialMapRun {
		const [duration, maxPlayerCount] = data.split("/").map(Number);
		if(isNaN(duration) || isNaN(maxPlayerCount)){
			Log.err(`_FINDTAG_ failed to load map run stats data: ${data}`);
		}
		const out = new PartialMapRun();
		out.startTime = Date.now() - duration; //move start time forward by time when the server was off
		out.maxPlayerCount = maxPlayerCount;
		return out;
	}
}


type FMapData = {
	runs: FinishedMapRun[];
	mapFileName: string;
};
export class FMap extends dataClass<FMapData>() {
	constructor(
		data:FMapData,
		//O(n^2)... should be fine?
		public map:MMap | null = Vars.maps.customMaps().find(m => m.file.name() === data.mapFileName)
	){ super(data); }

	@serialize("fish-map-data", () => ["version", 1, ["array", "u16", ["class", FMap, [
		["runs", ["array", "u32", ["class", FinishedMapRun, [
			["startTime", ["number", "i64"]],
			["endTime", ["number", "i64"]],
			["maxPlayerCount", ["number", "u8"]],
			["success", ["boolean"]],
			["winTeam", ["team"]],
			["wave", ["number", "u16"]]
		]]]],
		["mapFileName", ["string"]],
	]]]], () => ["array", "u16", ["class", FMap, [
		["runs", ["array", "u32", ["class", FinishedMapRun, [
			["startTime", ["number", "i64"]],
			["endTime", ["number", "i64"]],
			["maxPlayerCount", ["number", "u8"]],
			["success", ["boolean"]],
			["winTeam", ["team"]],
		]]]],
		["mapFileName", ["string"]],
	]]])
	static allMaps:FMap[] = [];
	private static maps:Record<string, FMap> = {};
	static {
		FishEvents.on("dataLoaded", () => {
			//This event listener runs after the data has been loaded into allMaps
			FMap.allMaps.forEach(map => {
				FMap.maps[map.mapFileName] = map;
				map.runs.forEach(run => {
					//this should not even happen, I think GameOverEvent is sending winTeam as null sometimes??
					run.winTeam ??= Team.derelict;
				});
			});
			//create all the data
			Vars.maps.customMaps().each(m => void FMap.getCreate(m));
		});
	}

	static getCreate(map:MMap){
		const mapFileName = map.file.name();
		if(Object.prototype.hasOwnProperty.call(this.maps, mapFileName))
			return this.maps[mapFileName];
		const fmap = new this({
			runs: [],
			mapFileName
		}, map);
		this.maps[mapFileName] = fmap;
		this.allMaps.push(fmap);
		return fmap;
	}

	rules():Rules | undefined {
		return this.map?.rules();
	}

	stats(){
		const runs = this.runs.filter(r => r.maxPlayerCount > 0); //Remove all runs with no players on
		const allRunCount = runs.length;
		const victories = runs.filter(r => r.outcome()[1] === "win").length;
		const losses = runs.filter(r => r.outcome()[0] === "loss").length;
		const earlyRTVs = runs.filter(r => r.outcome()[1] === "early rtv").length;
		const lateRTVs = runs.filter(r => r.outcome()[1] === "late rtv").length;
		const significantRunCount = allRunCount - earlyRTVs;
		const totalLosses = losses + lateRTVs;
		const durations = runs.filter(r => r.outcome()[0] !== "rtv").map(r => r.duration());
		const durationStats = computeStatistics(durations);
		const winDurationStats = computeStatistics(runs.filter(r => r.outcome()[0] === "win").map(r => r.duration()));
		const teamWins = runs.filter(r => r.outcome()[1] !== "early rtv").reduce((acc, item) => {
			acc[item.winTeam.name] = (acc[item.winTeam.name] ?? 0) + 1;
			return acc;
		}, {} as Record<string, number>);
		const teamWinRate = Object.fromEntries(Object.entries(teamWins).map(([team, wins]) => [team, wins / significantRunCount]));
		//Remove runs that were on wave 0, due to a silly bug we have thousands of runs with a max wave of 0
		const waveStats = computeStatistics(runs.filter(r => r.outcome()[0] !== "rtv" && r.wave !== 0).map(r => r.wave));
		return {
			allRunCount,
			significantRunCount,
			victories,
			losses,
			totalLosses,
			earlyRTVs,
			lateRTVs,
			earlyRTVRate: earlyRTVs / allRunCount,
			winRate: victories / significantRunCount,
			lossRate: losses / significantRunCount,
			averagePlaytime: durationStats.average,
			shortestWinTime: winDurationStats.lowest,
			longestTime: durationStats.highest,
			shortestTime: durationStats.lowest,
			averageHighestPlayerCount: computeStatistics(runs.map(r => r.maxPlayerCount)).average,
			teamWins,
			teamWinRate,
			highestWave: waveStats.highest,
			averageWave: waveStats.average,
		};
	}
	displayStats(f:FFunction):string | null {
		const map = this.map; if(!map) return null;
		const stats = this.stats();
		const rules = this.rules()!;

		const modeSpecificStats = match(Gamemode.name(), {
			attack: `\
[#CCFFCC]Total runs: ${stats.allRunCount} (${stats.victories} wins, ${stats.totalLosses} losses, ${stats.earlyRTVs} RTVs)
[#CCFFCC]Outcomes: ${f.percent(stats.winRate, 1)} wins, ${f.percent(stats.lossRate, 1)} losses, ${f.percent(stats.earlyRTVRate, 1)} RTVs
[#CCFFCC]Average playtime: ${formatTime(stats.averagePlaytime)}
[#CCFFCC]Shortest win time: ${formatTime(stats.shortestWinTime)}`,
			survival: `\
[#CCFFCC]Highest wave reached: ${stats.highestWave}
[#CCFFCC]Average wave reached: ${stats.averageWave}
[#CCFFCC]Total runs: ${stats.allRunCount} (${stats.earlyRTVs} RTVs)
[#CCFFCC]RTV rate: ${f.percent(stats.earlyRTVRate, 1)}
[#CCFFCC]Average duration: ${formatTime(stats.averagePlaytime)}
[#CCFFCC]Longest duration: ${formatTime(stats.longestTime)}`,
			pvp: `\
[#CCFFCC]Total runs: ${stats.allRunCount} (${stats.earlyRTVs} RTVs)
[#CCFFCC]Team win rates: ${Object.entries(stats.teamWinRate).map(([team, rate]) => `${team} ${f.percent(rate, 1)}`).join(", ")}
[#CCFFCC]RTV rate: ${f.percent(stats.earlyRTVRate, 1)}
[#CCFFCC]Average match duration: ${formatTime(stats.averagePlaytime)}
[#CCFFCC]Shortest match duration: ${formatTime(stats.shortestWinTime)}`,
			hexed: `\
[#CCFFCC]Total runs: ${stats.allRunCount} (${stats.earlyRTVs} RTVs)
[#CCFFCC]RTV rate: ${f.percent(stats.earlyRTVRate, 1)}
[#CCFFCC]Average match duration: ${formatTime(stats.averagePlaytime)}
[#CCFFCC]Shortest match duration: ${formatTime(stats.shortestWinTime)}`,
			sandbox: `\
[#CCFFCC]Total plays: ${stats.allRunCount}
[#CCFFCC]Average play time: ${formatTime(stats.averagePlaytime)}
[#CCFFCC]Shortest play time: ${formatTime(stats.shortestTime)}`,
		}, "");
		return (`\
[coral]${map.name()}
[gray](${map.file.name()})

[accent]Map by: [white]${map.author()}
[accent]Description: [white]${map.description()}
[accent]Size: [white]${map.width}x${map.height}
[accent]Last updated: [white]${new Date(map.file.lastModified()).toLocaleDateString()}
[accent]BvB allowed: ${f.boolGood(rules.placeRangeCheck)}, unit item transfer allowed: ${f.boolGood(rules.onlyDepositCore)}

${modeSpecificStats}
[#CCFFCC]Longest play time: ${formatTime(stats.longestTime)}
[#CCFFCC]Average player count: ${f.number(stats.averageHighestPlayerCount, 1)}`
		);
	}
}
