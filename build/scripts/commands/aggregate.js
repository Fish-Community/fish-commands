"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAll = registerAll;
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file combines all the commands defined in various files into one function.
*/
var console_1 = require("/commands/console");
var general_1 = require("/commands/general");
var member_1 = require("/commands/member");
var staff_1 = require("/commands/staff");
var commands = require("/frameworks/commands");
var packetHandlers_1 = require("/packetHandlers");
function registerAll(clientHandler, serverHandler) {
    commands.register(staff_1.commands, clientHandler, serverHandler);
    commands.register(general_1.commands, clientHandler, serverHandler);
    commands.register(member_1.commands, clientHandler, serverHandler);
    commands.register(packetHandlers_1.commands, clientHandler, serverHandler);
    commands.registerConsole(console_1.commands, serverHandler);
    commands.initialize();
}
