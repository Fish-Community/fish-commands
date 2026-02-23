"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains types for the commands framework.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandArgNames = exports.commandArgTypes = void 0;
/** All valid command arg types. */
exports.commandArgTypes = [
    "string", "number", "boolean", "player", /*"menuPlayer",*/ "team", "time", "unittype", "block",
    "uuid", "offlinePlayer", "map", "rank", "roleflag", "item"
];
exports.commandArgNames = {
    string: "text",
    number: "number",
    boolean: "boolean",
    player: "player",
    team: "team",
    time: "duration",
    unittype: "unit type",
    block: "block",
    uuid: "UUID",
    offlinePlayer: "player",
    map: "map",
    rank: "rank",
    roleflag: "role flag",
    item: "item"
};
