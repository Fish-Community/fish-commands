"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the context for the "fjs" command,
which executes code with access to the plugin's internals.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJS = runJS;
var api = require("/api");
var commands = require("/commands");
var config = require("/config");
var consoleCommands = require("/consoleCommands").commands;
var files = require("/files");
var funcs = require("/funcs");
var globals = require("/globals");
var maps = require("/maps");
var memberCommands = require("/memberCommands").commands;
var menus = require("/menus");
var Metrics = require('/metrics').Metrics;
var packetHandlers = require("/packetHandlers");
var playerCommands = require("/playerCommands").commands;
var players = require("/players");
var ranks = require("/ranks");
var staffCommands = require("/staffCommands").commands;
var timers = require("/timers");
var utils = require("/utils");
var votes = require("/votes");
var Promise = require("/promise").Promise;
var Perm = commands.Perm, allCommands = commands.allCommands;
var FishPlayer = players.FishPlayer;
var FMap = maps.FMap;
var Rank = ranks.Rank, RoleFlag = ranks.RoleFlag;
var Menu = menus.Menu;
Object.assign(this, utils, funcs); //global scope goes brrrrr, I'm sure this will not cause any bugs whatsoever
var Ranks = null;
var $ = Object.assign(function $(input) {
    if (typeof input == "string") {
        if (Pattern.matches("[a-zA-Z0-9+/]{22}==", input)) {
            return FishPlayer.getById(input);
        }
    }
    return null;
}, {
    sussy: true,
    info: function (input) {
        if (typeof input == "string") {
            if (Pattern.matches("[a-zA-Z0-9+/]{22}==", input)) {
                return Vars.netServer.admins.getInfo(input);
            }
        }
        return null;
    },
    create: function (input) {
        if (typeof input == "string") {
            if (Pattern.matches("[a-zA-Z0-9+/]{22}==", input)) {
                return FishPlayer.getFromInfo(Vars.netServer.admins.getInfo(input));
            }
        }
        return null;
    },
    me: null,
    meM: null,
});
/** Used to persist variables. */
var vars = {};
function runJS(input, outputFunction, errorFunction, player) {
    if (outputFunction === void 0) { outputFunction = Log.info; }
    if (errorFunction === void 0) { errorFunction = Log.err; }
    if (player) {
        $.me = player;
        $.meM = player.player;
    }
    else if (Groups.player.size() == 1) {
        $.meM = Groups.player.first();
        $.me = players.FishPlayer.get($.meM);
    }
    try {
        var admins = Vars.netServer.admins;
        var output = eval(input);
        if (output instanceof Array) {
            outputFunction("&cArray: [&fr" + output.join(", ") + "&c]&fr");
        }
        else if (output === undefined) {
            outputFunction("undefined");
        }
        else if (output === null) {
            outputFunction("null");
        }
        else {
            outputFunction(output);
        }
    }
    catch (err) {
        errorFunction(err);
    }
}
