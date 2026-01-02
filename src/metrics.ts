/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the player count tracking.
*/
import { serialize } from "/frameworks/io";


type MetricsWeek = number[] & {
	length: 2520; /* 15 * 24 * 7 */
};
export class Metrics {
	/** 4 May 2025 */
	static readonly startDate = new Date(2025, 4, 4).getTime();
	static readonly millisPerWeek = 604800_000;
	static readonly millisBetweenReadings = 240_000;
	static readonly noData = -1;
	/**
	 * Weeks are numbered starting at the week of 4 May 2025.
	 * A value is taken every 4 minutes, for a total of 15 readings per hour.
	*/
	@serialize("player-count-data", () => ["version", 0,
		["array", "u16", ["array", 2520, ["number", "i8"]]]
	], undefined, weeks => {
		for(let i = 0; i <= Metrics.weekNumber(); i ++){
			weeks[i] ??= Metrics.newWeek();
		}
		return weeks;
	})
	static weeks: MetricsWeek[] = Array(this.weekNumber() + 1).fill(0).map(() => this.newWeek());

	static {
		Timer.schedule(() => Metrics.update(), 15, 60);
	}

	static weekNumber(date = Date.now()){
		return Math.floor((date - this.startDate) / this.millisPerWeek);
	}
	static readingNumber(date = Date.now()){
		return Math.floor(((date - this.startDate) % this.millisPerWeek) / this.millisBetweenReadings);
	}
	static newWeek() {
		return Array(2520 satisfies MetricsWeek["length"]).fill(this.noData) as MetricsWeek;
	}
	static currentWeek(){
		return this.weeks[this.weekNumber()] ??= this.newWeek();
	}
	static update(){
		const playerCount = Groups.player.size();
		this.currentWeek()[this.readingNumber()] =
			Math.max(playerCount, this.currentWeek()[this.readingNumber()]);
	}

	static exportRange(startDate = this.startDate, endDate = Date.now()){
		if(typeof startDate !== "number") throw new Error('startDate should be a number');
		const startWeek = this.weekNumber(startDate);
		const endWeek = this.weekNumber(endDate);
		return this.weeks.slice(startWeek, endWeek + 1).map((week, weekNumber) =>
			week.filter(v => v >= 0).map((v, i) => [
				v,
				this.startDate +
				weekNumber * this.millisPerWeek +
				i * this.millisBetweenReadings
			] as [value:number, timestamp:number])
		).flat();
	}
}
