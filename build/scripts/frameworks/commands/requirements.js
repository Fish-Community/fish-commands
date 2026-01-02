"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the requirements system, which is part of the commands framework.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Req = void 0;
var config_1 = require("/config");
var errors_1 = require("/frameworks/commands/errors");
var utils_1 = require("/utils");
exports.Req = {
    mode: function (mode) { return function () {
        return config_1.Gamemode[mode]()
            || (0, errors_1.fail)("This command is only available in ".concat((0, utils_1.formatModeName)(mode)));
    }; },
    modeNot: function (mode) { return function () {
        return !config_1.Gamemode[mode]()
            || (0, errors_1.fail)("This command is disabled in ".concat((0, utils_1.formatModeName)(mode)));
    }; },
    moderate: function (argName, allowSameRank, minimumLevel, allowSelfIfUnauthorized) {
        if (allowSameRank === void 0) { allowSameRank = false; }
        if (minimumLevel === void 0) { minimumLevel = "mod"; }
        if (allowSelfIfUnauthorized === void 0) { allowSelfIfUnauthorized = false; }
        return function (_a) {
            var args = _a.args, sender = _a.sender;
            return (args[argName] == undefined || sender.canModerate(args[argName], !allowSameRank, minimumLevel, allowSelfIfUnauthorized)
                || (0, errors_1.fail)("You do not have permission to perform moderation actions on this player."));
        };
    },
    cooldown: function (durationMS) { return function (_a) {
        var lastUsedSuccessfullySender = _a.lastUsedSuccessfullySender;
        return Date.now() - lastUsedSuccessfullySender >= durationMS
            || (0, errors_1.fail)("This command was run recently and is on cooldown.");
    }; },
    cooldownGlobal: function (durationMS) { return function (_a) {
        var lastUsedSuccessfully = _a.lastUsedSuccessfully;
        return Date.now() - lastUsedSuccessfully >= durationMS
            || (0, errors_1.fail)("This command was run recently and is on cooldown.");
    }; },
    gameRunning: function () {
        return !Vars.state.gameOver
            || (0, errors_1.fail)("This game is over, please wait for the next map to load.");
    },
    teamAlive: function (_a) {
        var sender = _a.sender;
        return sender.team().active()
            || (0, errors_1.fail)("Your team is dead.");
    },
    unitExists: function (message) {
        if (message === void 0) { message = "You must be in a unit to use this command."; }
        return function (_a) {
            var _b;
            var sender = _a.sender;
            return (sender.connected() && ((_b = sender.unit()) === null || _b === void 0 ? void 0 : _b.added) && !sender.unit().dead)
                || (0, errors_1.fail)(message);
        };
    }
};
