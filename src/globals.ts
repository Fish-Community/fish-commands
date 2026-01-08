/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains mutable global variables, and global constants.
*/

import { EventEmitter } from "/funcs";
import { FishPlayer } from "/players";

export const tileHistory:Record<string, string> = {};
export const recentWhispers:Record<string, string> = {};
export const fishState = {
	restartQueued: false,
	restartLoopTask: null as null | TimerTask,
	corruption_t1: null as null | TimerTask,
	corruption_t2: null as null | TimerTask,
	lastPranked: Date.now(),
	labels: [] as TimerTask[],
	peacefulMode: false,
	joinBell: false,
};
export const fishPlugin = {
	directory: null as null | string,
	version: null as null | string,
};
export const ipJoins = new ObjectIntMap<string>(); //todo somehow tell java that K is String and not Object

export const uuidPattern = /^[a-zA-Z0-9+/]{22}==$/;
export const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
export const ipPortPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/;
export const ipRangeCIDRPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/(1[2-9]|2[0-4])$/; //Disallow anything bigger than a /12
export const ipRangeWildcardPattern = /^(\d{1,3}\.\d{1,3})\.(?:(\d{1,3}\.\*)|\*)$/; //Disallow anything bigger than a /16
export const maxTime = 9999999999999;
export const unitsT5 = [UnitTypes.reign, UnitTypes.toxopid, UnitTypes.corvus, UnitTypes.eclipse, UnitTypes.oct, UnitTypes.omura, UnitTypes.navanax, UnitTypes.conquer, UnitTypes.collaris, UnitTypes.disrupt];

export const FishEvents = new EventEmitter<{
	/** Fired after a team change. The current team is player.team() */
	playerTeamChange: [player:FishPlayer, previous:Team];
	/** Use this event to load data from Core.settings */
	loadData: [];
	/** Use this event to save data to Core.settings */
	saveData: [];
	/** Use this event to mutate things after all the data is loaded */
	dataLoaded: [];
	commandUnauthorized: [player: FishPlayer, name: string];
	scriptKiddie: [player: FishPlayer];
	memoryCorruption: [];
	/** Called when the "say" console command is run. */
	serverSays: [];
}>();
