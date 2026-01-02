/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file combines all the commands defined in various files into one function.
*/
import { commands as consoleCommands } from "/commands/console";
import { commands as playerCommands } from "/commands/general";
import { commands as memberCommands } from "/commands/member";
import { commands as staffCommands } from "/commands/staff";
import * as commands from "/frameworks/commands";
import { commands as packetHandlerCommands } from "/packetHandlers";
import type { ClientCommandHandler, ServerCommandHandler } from "/types";

export function registerAll(clientHandler: ClientCommandHandler, serverHandler: ServerCommandHandler){
	commands.register(staffCommands, clientHandler, serverHandler);
	commands.register(playerCommands, clientHandler, serverHandler);
	commands.register(memberCommands, clientHandler, serverHandler);
	commands.register(packetHandlerCommands, clientHandler, serverHandler);
	commands.registerConsole(consoleCommands, serverHandler);
	commands.initialize();
}
