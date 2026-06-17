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
    mode: function () {
        var modes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            modes[_i] = arguments[_i];
        }
        return function () {
            return modes.map(function (mode) { return config_1.Gamemode[mode](); }).some(Boolean)
                || (0, errors_1.fail)("This command is only available in ".concat(modes.map(utils_1.formatModeName).join(" or ")));
        };
    },
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
        return sender.team().isAlive()
            || (0, errors_1.fail)(Math.random() > 0.9 ? "You are already dead." : "Your team is dead.");
    },
    unitExists: function (message) {
        if (message === void 0) { message = "You must be in a unit to use this command."; }
        return function (_a) {
            var _b;
            var sender = _a.sender;
            return (sender.connected() && ((_b = sender.unit()) === null || _b === void 0 ? void 0 : _b.added) && !sender.unit().dead)
                || (0, errors_1.fail)(message);
        };
    },
    numberRange: function (argName, min, max) {
        return function (_a) {
            var args = _a.args;
            return args[argName] == undefined || min <= args[argName] && args[argName] <= max
                || (0, errors_1.fail)("".concat(argName, " must be between ").concat(min, " and ").concat(max));
        };
    },
    integer: function (argName) {
        return function (_a) {
            var args = _a.args;
            return args[argName] == undefined || Number.isSafeInteger(args[argName])
                || (0, errors_1.fail)("".concat(argName, " must be an integer"));
        };
    },
    integerRange: function (argName, min, max) {
        return function (_a) {
            var args = _a.args;
            return exports.Req.integer(argName)({ args: args }) && exports.Req.numberRange(argName, min, max)({ args: args });
        };
    },
    positiveInteger: function (argName) {
        return function (_a) {
            var args = _a.args;
            return exports.Req.integer(argName)({ args: args }) &&
                (args[argName] == undefined || args[argName] > 0
                    || (0, errors_1.fail)("".concat(argName, " must be positive")));
        };
    },
};
