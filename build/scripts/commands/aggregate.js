"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var commands = __importStar(require("/frameworks/commands"));
var packetHandlers_1 = require("/packetHandlers");
function registerAll(clientHandler, serverHandler) {
    commands.register(staff_1.commands, clientHandler, serverHandler);
    commands.register(general_1.commands, clientHandler, serverHandler);
    commands.register(member_1.commands, clientHandler, serverHandler);
    commands.register(packetHandlers_1.commands, clientHandler, serverHandler);
    commands.registerConsole(console_1.commands, serverHandler);
    commands.initialize();
}
