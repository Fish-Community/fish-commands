/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the context for the "fjs" command,
which executes code with access to the plugin's internals.
*/

import type { FishPlayer as tFishPlayer } from "/players";
type FishPlayer = tFishPlayer; //absurd

const api = require("/api");
const commands = require("/frameworks/commands");
const config = require("/config");
const { commands: consoleCommands } = require("/commands/console");
const files = require("/files");
const funcs = require("/funcs");
const globals = require("/globals");
const maps = require("/maps");
const { commands: memberCommands } = require("/commands/member");
const menus = require("/frameworks/menus");
const { Metrics } = require('/metrics');
const packetHandlers = require("/packetHandlers");
const { commands: playerCommands } = require("/commands/general");
const players = require("/players");
const ranks = require("/ranks");
const { commands: staffCommands } = require("/commands/staff");
const timers = require("/timers");
const utils = require("/utils");
const votes = require("/votes");
const { Promise } = require("/promise");

const { Perm, allCommands } = commands;
const { FishPlayer } = players;
const { FMap } = maps;
const { Rank, RoleFlag } = ranks;
const { Menu } = menus;

Object.assign(this as never as typeof globalThis, utils, funcs); //global scope goes brrrrr, I'm sure this will not cause any bugs whatsoever

const Ranks = null!;

const $ = Object.assign(
	function $(input:unknown){
		if(typeof input == "string"){
			if(Pattern.matches("[a-zA-Z0-9+/]{22}==", input)){
				return FishPlayer.getById(input);
			}
		}
		return null;
	},
	{
		sussy: true,
		info: function(input:unknown){
			if(typeof input == "string"){
				if(Pattern.matches("[a-zA-Z0-9+/]{22}==", input)){
					return Vars.netServer.admins.getInfo(input);
				}
			}
			return null;
		},
		create: function(input:unknown){
			if(typeof input == "string"){
				if(Pattern.matches("[a-zA-Z0-9+/]{22}==", input)){
					return FishPlayer.getFromInfo(Vars.netServer.admins.getInfo(input));
				}
			}
			return null;
		},
		me: null as FishPlayer | null,
		meM: null as mindustryPlayer | null,
	}
);

/** Used to persist variables. */
const vars = {};

export function runJS(
	input:string,
	outputFunction:(data:any) => unknown = Log.info,
	errorFunction:(data:any) => unknown = Log.err,
	player?:FishPlayer
){
	if(player){
		$.me = player;
		$.meM = player.player;
	} else if(Groups.player.size() == 1){
		$.meM = Groups.player.first();
		$.me = players.FishPlayer.get($.meM);
	}
	try {
		const admins = Vars.netServer.admins;
		const output = eval(input);
		if(output instanceof Array){
			outputFunction("&cArray: [&fr" + output.join(", ") + "&c]&fr");
		} else if(output === undefined){
			outputFunction("undefined");
		} else if(output === null){
			outputFunction("null");
		} else {
			outputFunction(output);
		}
	} catch(err){
		errorFunction(err);
	}
}
