"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the commands framework.
For usage information, see docs/framework-usage-guide.md
For maintenance information, see docs/frameworks.md
*/
//Behold, the power of typescript!
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleCommandList = exports.commandList = exports.allConsoleCommands = exports.allCommands = void 0;
exports.command = command;
exports.formatArg = formatArg;
exports.handleTapEvent = handleTapEvent;
exports.register = register;
exports.registerConsole = registerConsole;
exports.initialize = initialize;
exports.reset = reset;
var errors_1 = require("/frameworks/commands/errors");
var formatting_1 = require("/frameworks/commands/formatting");
var types_1 = require("/frameworks/commands/types");
var menus_1 = require("/frameworks/menus");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var players_1 = require("/players");
var ranks_1 = require("/ranks");
var utils_1 = require("/utils");
var hiddenUnauthorizedMessage = "[scarlet]Unknown command. Check [lightgray]/help[scarlet].";
/** Flag to prevent double initialization */
var initialized = false;
/** Stores all chat comamnds by their name. */
exports.allCommands = {};
/** Stores all console commands by their name. */
exports.allConsoleCommands = {};
/** Stores the last usage data for chat commands by their name. */
var globalUsageData = {};
/** Helper function to get the correct type for command lists. */
var commandList = function (list) { return list; };
exports.commandList = commandList;
/** Helper function to get the correct type for command lists. */
var consoleCommandList = function (list) { return list; };
exports.consoleCommandList = consoleCommandList;
/**
 * Helper function to get the correct type definitions for commands that use "data" or init().
 * Necessary because, while typescript is capable of inferring A1, A2...
 * ```
 * {
 * 	prop1: Type<A1>;
 * 	prop2: Type<A2>;
 * }
 * ```
 * it cannot handle inferring A1 and B1.
 * ```
 * {
 * 	prop1: Type<A1, B1>;
 * 	prop2: Type<A2, B2>;
 * }
 * ```
 */
function command(input) {
    return input;
}
/** Takes an arg string, like `reason:string?` and converts it to a CommandArg. */
function processArgString(str) {
    //this was copypasted from mlogx haha
    var matchResult = str.match(/(\w+):(\w+)(\?)?/);
    if (!matchResult) {
        (0, funcs_1.crash)("Bad arg string ".concat(str, ": does not match pattern word:word(?)"));
    }
    var _a = __read(matchResult, 4), name = _a[1], type = _a[2], isOptional = _a[3];
    if (types_1.commandArgTypes.includes(type)) {
        return { name: name, type: type, isOptional: !!isOptional };
    }
    else {
        (0, funcs_1.crash)("Bad arg string ".concat(str, ": invalid type ").concat(type));
    }
}
function formatArg(a) {
    var isOptional = a.at(-1) == "?";
    var brackets = isOptional ? ["[", "]"] : ["<", ">"];
    return brackets[0] + a.split(":")[0] + brackets[1];
}
/** Joins multi-word arguments that have been groups with quotes. Ex: turns [`"a`, `b"`] into [`a b`]*/
function joinArgs(rawArgs) {
    var e_1, _a;
    var outputArgs = [];
    var groupedArg = null;
    try {
        for (var rawArgs_1 = __values(rawArgs), rawArgs_1_1 = rawArgs_1.next(); !rawArgs_1_1.done; rawArgs_1_1 = rawArgs_1.next()) {
            var arg = rawArgs_1_1.value;
            if (arg.startsWith("\"") && groupedArg == null) {
                groupedArg = [];
            }
            if (groupedArg) {
                groupedArg.push(arg);
                if (arg.endsWith("\"")) {
                    outputArgs.push(groupedArg.join(" ").slice(1, -1));
                    groupedArg = null;
                }
            }
            else {
                outputArgs.push(arg);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (rawArgs_1_1 && !rawArgs_1_1.done && (_a = rawArgs_1.return)) _a.call(rawArgs_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (groupedArg != null) {
        //return `Unterminated string literal.`;
        outputArgs.push(groupedArg.join(" "));
    }
    return outputArgs;
}
/** Takes a list of joined args passed to the command, and processes it, turning it into a kwargs style object. */
function processArgs(args, processedCmdArgs, sender) {
    return __awaiter(this, void 0, void 0, function () {
        var outputArgs, _a, _b, _c, i, cmdArg, _d, output, _e, _f, player, output, team, number, milliseconds, block, unit, map, ranks, roleflags, item, e_2_1;
        var e_2, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    outputArgs = {};
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 24, 25, 26]);
                    _a = __values(processedCmdArgs.entries()), _b = _a.next();
                    _h.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 23];
                    _c = __read(_b.value, 2), i = _c[0], cmdArg = _c[1];
                    if (!(i in args) || args[i] === "") {
                        //if the arg was not provided or it was empty
                        if (cmdArg.isOptional) {
                            outputArgs[cmdArg.name] = undefined;
                            return [3 /*break*/, 22];
                        }
                        else if (sender && ["player"].includes(cmdArg.type)) {
                            //it will be resolved later
                        }
                        else {
                            (0, errors_1.fail)("No value specified for arg ".concat(cmdArg.name, ". Did you type two spaces instead of one?"));
                        }
                    }
                    _d = cmdArg.type;
                    switch (_d) {
                        case "player": return [3 /*break*/, 3];
                        case "offlinePlayer": return [3 /*break*/, 8];
                        case "team": return [3 /*break*/, 9];
                        case "number": return [3 /*break*/, 10];
                        case "time": return [3 /*break*/, 11];
                        case "string": return [3 /*break*/, 12];
                        case "boolean": return [3 /*break*/, 13];
                        case "block": return [3 /*break*/, 14];
                        case "unittype": return [3 /*break*/, 15];
                        case "uuid": return [3 /*break*/, 16];
                        case "map": return [3 /*break*/, 17];
                        case "rank": return [3 /*break*/, 18];
                        case "roleflag": return [3 /*break*/, 19];
                        case "item": return [3 /*break*/, 20];
                    }
                    return [3 /*break*/, 21];
                case 3:
                    output = players_1.FishPlayer.search(players_1.FishPlayer.getAllOnline(), args[i]);
                    if (!!output) return [3 /*break*/, 4];
                    (0, errors_1.fail)("Player \"".concat(args[i], "\" not found."));
                    return [3 /*break*/, 7];
                case 4:
                    if (!Array.isArray(output)) return [3 /*break*/, 6];
                    if (!sender)
                        (0, errors_1.fail)("Name \"".concat(args[i], "\" could refer to more than one player."));
                    _e = outputArgs;
                    _f = cmdArg.name;
                    return [4 /*yield*/, menus_1.Menu.menu("Select a player", "Select a player for the argument \"".concat(cmdArg.name, "\""), output, sender, {
                            includeCancel: true,
                            optionStringifier: function (player) { return Strings.stripColors(player.name).length >= 3 ?
                                player.name
                                : (0, funcs_1.escapeStringColorsClient)(player.name); }
                        })];
                case 5:
                    _e[_f] = _h.sent();
                    return [3 /*break*/, 7];
                case 6:
                    outputArgs[cmdArg.name] = output;
                    _h.label = 7;
                case 7: return [3 /*break*/, 22];
                case 8:
                    if (globals_1.uuidPattern.test(args[i])) {
                        player = players_1.FishPlayer.getById(args[i]);
                        if (player == null)
                            (0, errors_1.fail)("Player with uuid \"".concat(args[i], "\" not found. Specify \"create:").concat(args[i], "\" to create the player."));
                        outputArgs[cmdArg.name] = player;
                    }
                    else if (args[i].startsWith("create:") && globals_1.uuidPattern.test(args[i].split("create:")[1])) {
                        outputArgs[cmdArg.name] = players_1.FishPlayer.getFromInfo(Vars.netServer.admins.getInfo(args[i].split("create:")[1]));
                    }
                    else {
                        output = players_1.FishPlayer.getOneOfflineByName(args[i]);
                        if (output == "none")
                            (0, errors_1.fail)("Player \"".concat(args[i], "\" not found."));
                        else if (output == "multiple")
                            (0, errors_1.fail)("Name \"".concat(args[i], "\" could refer to more than one player. Try specifying by ID."));
                        outputArgs[cmdArg.name] = output;
                    }
                    return [3 /*break*/, 22];
                case 9:
                    {
                        team = (0, utils_1.getTeam)(args[i]);
                        if (typeof team == "string")
                            (0, errors_1.fail)(team);
                        outputArgs[cmdArg.name] = team;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 10;
                case 10:
                    {
                        number = Number(args[i]);
                        if (isNaN(number)) {
                            if (/\(\d+,/.test(args[i]))
                                number = Number(args[i].slice(1, -1));
                            else if (/\d+\)/.test(args[i]))
                                number = Number(args[i].slice(0, -1));
                            if (isNaN(number))
                                (0, errors_1.fail)("Invalid number \"".concat(args[i], "\""));
                        }
                        outputArgs[cmdArg.name] = number;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 11;
                case 11:
                    {
                        milliseconds = (0, utils_1.parseTimeString)(args[i]);
                        if (milliseconds == null)
                            (0, errors_1.fail)("Invalid time string \"".concat(args[i], "\""));
                        outputArgs[cmdArg.name] = milliseconds;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 12;
                case 12:
                    outputArgs[cmdArg.name] = args[i];
                    return [3 /*break*/, 22];
                case 13:
                    switch (args[i].toLowerCase()) {
                        case "true":
                        case "yes":
                        case "yeah":
                        case "ya":
                        case "ye":
                        case "t":
                        case "y":
                        case "1":
                            outputArgs[cmdArg.name] = true;
                            break;
                        case "false":
                        case "no":
                        case "nah":
                        case "nay":
                        case "nope":
                        case "f":
                        case "n":
                        case "0":
                            outputArgs[cmdArg.name] = false;
                            break;
                        default: (0, errors_1.fail)("Argument ".concat(args[i], " is not a boolean. Try \"true\" or \"false\"."));
                    }
                    return [3 /*break*/, 22];
                case 14:
                    {
                        block = (0, utils_1.getBlock)(args[i], "air");
                        if (typeof block == "string")
                            (0, errors_1.fail)(block);
                        outputArgs[cmdArg.name] = block;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 15;
                case 15:
                    {
                        unit = (0, utils_1.getUnitType)(args[i]);
                        if (typeof unit == "string")
                            (0, errors_1.fail)(unit);
                        outputArgs[cmdArg.name] = unit;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 16;
                case 16:
                    if (!globals_1.uuidPattern.test(args[i]))
                        (0, errors_1.fail)("Invalid uuid string \"".concat(args[i], "\""));
                    outputArgs[cmdArg.name] = args[i];
                    return [3 /*break*/, 22];
                case 17:
                    {
                        map = (0, utils_1.getMap)(args[i]);
                        if (map == "none")
                            (0, errors_1.fail)("Map \"".concat(args[i], "\" not found."));
                        else if (map == "multiple")
                            (0, errors_1.fail)("Name \"".concat(args[i], "\" could refer to more than one map. Be more specific."));
                        //TODO change all these "multiple" errors into menu
                        //TODO refactor this function using search() curry, there's a lot of duplicated search code
                        outputArgs[cmdArg.name] = map;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 18;
                case 18:
                    {
                        ranks = ranks_1.Rank.getByInput(args[i]);
                        if (ranks.length == 0)
                            (0, errors_1.fail)("Unknown rank \"".concat(args[i], "\""));
                        if (ranks.length > 1)
                            (0, errors_1.fail)("Ambiguous rank \"".concat(args[i], "\""));
                        outputArgs[cmdArg.name] = ranks[0];
                        return [3 /*break*/, 22];
                    }
                    _h.label = 19;
                case 19:
                    {
                        roleflags = ranks_1.RoleFlag.getByInput(args[i]);
                        if (roleflags.length == 0)
                            (0, errors_1.fail)("Unknown role flag \"".concat(args[i], "\""));
                        if (roleflags.length > 1)
                            (0, errors_1.fail)("Ambiguous role flag \"".concat(args[i], "\""));
                        outputArgs[cmdArg.name] = roleflags[0];
                        return [3 /*break*/, 22];
                    }
                    _h.label = 20;
                case 20:
                    {
                        item = (0, utils_1.getItem)(args[i]);
                        if (typeof item === "string")
                            (0, errors_1.fail)(item);
                        outputArgs[cmdArg.name] = item;
                        return [3 /*break*/, 22];
                    }
                    _h.label = 21;
                case 21:
                    cmdArg.type;
                    (0, funcs_1.crash)("impossible");
                    _h.label = 22;
                case 22:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 23: return [3 /*break*/, 26];
                case 24:
                    e_2_1 = _h.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 26];
                case 25:
                    try {
                        if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 26: return [2 /*return*/, outputArgs];
            }
        });
    });
}
var variadicArgumentTypes = ["player", "string", "map"];
/** Converts the CommandArg[] to the format accepted by Arc CommandHandler */
function convertArgs(processedCmdArgs, allowMenus) {
    return processedCmdArgs.map(function (arg, index, array) {
        var isOptional = (arg.isOptional || (arg.type == "player" && allowMenus)) && !array.slice(index + 1).some(function (c) { return !c.isOptional; });
        var brackets = isOptional ? ["[", "]"] : ["<", ">"];
        //if the arg is a string and last argument, make it variadic (so if `/warn player a b c d` is run, the last arg is "a b c d" not "a")
        return brackets[0] + arg.name + (variadicArgumentTypes.includes(arg.type) && index + 1 == array.length ? "..." : "") + brackets[1];
    }).join(" ");
}
function handleTapEvent(event) {
    var _a;
    var sender = players_1.FishPlayer.get(event.player);
    if (sender.tapInfo.commandName == null)
        return;
    var command = exports.allCommands[sender.tapInfo.commandName];
    var usageData = sender.getUsageData(sender.tapInfo.commandName);
    var handleTapsUpdated = false;
    try {
        var failed_1 = false;
        (_a = command.tapped) === null || _a === void 0 ? void 0 : _a.call(command, {
            args: sender.tapInfo.lastArgs,
            data: command.data,
            outputFail: function (message) { (0, utils_1.outputFail)(message, sender); failed_1 = true; },
            outputSuccess: function (message) { return (0, utils_1.outputSuccess)(message, sender); },
            output: function (message) { return (0, utils_1.outputMessage)(message, sender); },
            f: formatting_1.outputFormatter_client,
            admins: Vars.netServer.admins,
            commandLastUsed: usageData.lastUsed,
            commandLastUsedSuccessfully: usageData.lastUsedSuccessfully,
            lastUsed: usageData.tapLastUsed,
            lastUsedSuccessfully: usageData.tapLastUsedSuccessfully,
            sender: sender,
            tile: event.tile,
            x: event.tile.x,
            y: event.tile.y,
            currentTapMode: sender.tapInfo.commandName == null ? "off" : sender.tapInfo.mode,
            handleTaps: function (mode) {
                if (mode == "off") {
                    sender.tapInfo.commandName = null;
                    return;
                }
                sender.tapInfo.mode = mode;
                handleTapsUpdated = true;
            },
        });
        if (!failed_1)
            usageData.tapLastUsedSuccessfully = Date.now();
    }
    catch (err) {
        if (err instanceof errors_1.CommandError) {
            //If the error is a command error, then just outputFail
            (0, utils_1.outputFail)(err.data, sender);
        }
        else {
            sender.sendMessage("[scarlet]\u274C An error occurred while executing the command!");
            if (sender.hasPerm("seeErrorMessages"))
                sender.sendMessage((0, funcs_1.parseError)(err));
            Log.err("Unhandled error in command execution: ".concat(sender.cleanedName, " ran /").concat(sender.tapInfo.commandName, " and tapped"));
            Log.err(err);
        }
    }
    finally {
        if (sender.tapInfo.mode == "once" && !handleTapsUpdated) {
            sender.tapInfo.commandName = null;
        }
        usageData.tapLastUsed = Date.now();
    }
}
/**
 * Registers all commands in a list to a client command handler.
 **/
function register(commands, clientHandler, serverHandler) {
    var e_3, _a;
    var _loop_1 = function (name, _data) {
        //Invoke thunk if necessary
        var data = typeof _data == "function" ? _data() : _data;
        //Process the args
        var processedCmdArgs = data.args.map(processArgString);
        clientHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
        clientHandler.register(name, convertArgs(processedCmdArgs, true), data.description, new CommandHandler.CommandRunner({ accept: function (unjoinedRawArgs, sender) {
                return __awaiter(this, void 0, void 0, function () {
                    var fishSender, rawArgs, resolvedArgs, err_1, usageData, failed, args_1, requirements, err_2;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!initialized)
                                    (0, funcs_1.crash)("Commands not initialized!");
                                fishSender = players_1.FishPlayer.get(sender);
                                players_1.FishPlayer.onPlayerCommand(fishSender, name, unjoinedRawArgs);
                                //Verify authorization
                                //as a bonus, this crashes if data.perm is undefined
                                if (!data.perm.check(fishSender)) {
                                    if (data.customUnauthorizedMessage)
                                        (0, utils_1.outputFail)(data.customUnauthorizedMessage, sender);
                                    else if (data.isHidden)
                                        (0, utils_1.outputMessage)(hiddenUnauthorizedMessage, sender);
                                    else
                                        (0, utils_1.outputFail)(data.perm.unauthorizedMessage, sender);
                                    return [2 /*return*/];
                                }
                                rawArgs = joinArgs(unjoinedRawArgs);
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, processArgs(rawArgs, processedCmdArgs, fishSender)];
                            case 2:
                                resolvedArgs = _b.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_1 = _b.sent();
                                //if args are invalid
                                if (err_1 instanceof errors_1.CommandError)
                                    (0, utils_1.outputFail)(err_1.data, sender);
                                return [2 /*return*/];
                            case 4:
                                usageData = fishSender.getUsageData(name);
                                failed = false;
                                _b.label = 5;
                            case 5:
                                _b.trys.push([5, 7, 8, 9]);
                                args_1 = {
                                    rawArgs: rawArgs,
                                    args: resolvedArgs,
                                    sender: fishSender,
                                    data: data.data,
                                    outputFail: function (message) { (0, utils_1.outputFail)(message, sender); failed = true; },
                                    outputSuccess: function (message) { return (0, utils_1.outputSuccess)(message, sender); },
                                    output: function (message) { return (0, utils_1.outputMessage)(message, sender); },
                                    f: formatting_1.f_client,
                                    execServer: function (command) { return serverHandler.handleMessage(command); },
                                    admins: Vars.netServer.admins,
                                    lastUsedSender: usageData.lastUsed,
                                    lastUsedSuccessfullySender: usageData.lastUsedSuccessfully,
                                    lastUsedSuccessfully: ((_a = globalUsageData[name]) !== null && _a !== void 0 ? _a : (globalUsageData[name] = { lastUsed: -1, lastUsedSuccessfully: -1 })).lastUsedSuccessfully,
                                    allCommands: exports.allCommands,
                                    currentTapMode: fishSender.tapInfo.commandName == null ? "off" : fishSender.tapInfo.mode,
                                    handleTaps: function (mode) {
                                        if (data.tapped == undefined)
                                            (0, funcs_1.crash)("No tap handler to activate: command \"".concat(name, "\""));
                                        if (mode == "off") {
                                            fishSender.tapInfo.commandName = null;
                                        }
                                        else {
                                            fishSender.tapInfo.commandName = name;
                                            fishSender.tapInfo.mode = mode;
                                        }
                                        fishSender.tapInfo.lastArgs = resolvedArgs;
                                    },
                                };
                                requirements = typeof data.requirements == "function" ? data.requirements(args_1) : data.requirements;
                                requirements === null || requirements === void 0 ? void 0 : requirements.forEach(function (r) { return r(args_1); });
                                return [4 /*yield*/, data.handler(args_1)];
                            case 6:
                                _b.sent();
                                //Update usage data
                                if (!failed) {
                                    usageData.lastUsedSuccessfully = globalUsageData[name].lastUsedSuccessfully = Date.now();
                                }
                                return [3 /*break*/, 9];
                            case 7:
                                err_2 = _b.sent();
                                if (err_2 instanceof errors_1.CommandError) {
                                    //If the error is a command error, then just outputFail
                                    (0, utils_1.outputFail)(err_2.data, sender);
                                }
                                else {
                                    sender.sendMessage("[scarlet]\u274C An error occurred while executing the command!");
                                    if (fishSender.hasPerm("seeErrorMessages"))
                                        sender.sendMessage((0, funcs_1.parseError)(err_2));
                                    Log.err("Unhandled error in command execution: ".concat(fishSender.cleanedName, " ran /").concat(name));
                                    Log.err(err_2);
                                    Log.err(err_2.stack);
                                }
                                return [3 /*break*/, 9];
                            case 8:
                                usageData.lastUsed = globalUsageData[name].lastUsed = Date.now();
                                return [7 /*endfinally*/];
                            case 9: return [2 /*return*/];
                        }
                    });
                });
            } }));
        exports.allCommands[name] = data;
    };
    try {
        for (var _b = __values(Object.entries(commands)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), name = _d[0], _data = _d[1];
            _loop_1(name, _data);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
}
function registerConsole(commands, serverHandler) {
    var e_4, _a;
    var _loop_2 = function (name, data) {
        //Process the args
        var processedCmdArgs = data.args.map(processArgString);
        serverHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
        serverHandler.register(name, convertArgs(processedCmdArgs, false), data.description, new CommandHandler.CommandRunner({ accept: function (rawArgs) {
                return __awaiter(this, void 0, void 0, function () {
                    var resolvedArgs, err_3, usageData, failed_2;
                    var _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!initialized)
                                    (0, funcs_1.crash)("Commands not initialized!");
                                _c.label = 1;
                            case 1:
                                _c.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, processArgs(rawArgs, processedCmdArgs, null)];
                            case 2:
                                resolvedArgs = _c.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_3 = _c.sent();
                                //if args are invalid
                                if (err_3 instanceof errors_1.CommandError)
                                    Log.err(err_3);
                                return [2 /*return*/];
                            case 4:
                                usageData = ((_a = globalUsageData[_b = "_console_" + name]) !== null && _a !== void 0 ? _a : (globalUsageData[_b] = { lastUsed: -1, lastUsedSuccessfully: -1 }));
                                try {
                                    failed_2 = false;
                                    data.handler(__assign({ rawArgs: rawArgs, args: resolvedArgs, data: data.data, outputFail: function (message) { (0, utils_1.outputConsole)(message, Log.err); failed_2 = true; }, outputSuccess: utils_1.outputConsole, output: utils_1.outputConsole, f: formatting_1.f_server, execServer: function (command) { return serverHandler.handleMessage(command); }, admins: Vars.netServer.admins }, usageData));
                                    usageData.lastUsed = Date.now();
                                    if (!failed_2)
                                        usageData.lastUsedSuccessfully = Date.now();
                                }
                                catch (err) {
                                    usageData.lastUsed = Date.now();
                                    if (err instanceof errors_1.CommandError) {
                                        Log.warn(typeof err.data == "function" ? err.data("&fr") : err.data);
                                    }
                                    else {
                                        Log.err("&lrAn error occured while executing the command!&fr");
                                        Log.err((0, funcs_1.parseError)(err));
                                    }
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            } }));
        exports.allConsoleCommands[name] = data;
    };
    try {
        for (var _b = __values(Object.entries(commands)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), name = _d[0], data = _d[1];
            _loop_2(name, data);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
}
function initialize() {
    var e_5, _a, e_6, _b;
    if (initialized) {
        (0, funcs_1.crash)("Already initialized commands.");
    }
    try {
        for (var _c = __values(Object.entries(exports.allConsoleCommands)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), key = _e[0], command_1 = _e[1];
            if (command_1.init)
                command_1.data = command_1.init();
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_5) throw e_5.error; }
    }
    try {
        for (var _f = __values(Object.entries(exports.allCommands)), _g = _f.next(); !_g.done; _g = _f.next()) {
            var _h = __read(_g.value, 2), key = _h[0], command_2 = _h[1];
            if (command_2.init)
                command_2.data = command_2.init();
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
        }
        finally { if (e_6) throw e_6.error; }
    }
    initialized = true;
}
function reset() {
    var e_7, _a, e_8, _b;
    initialized = false;
    try {
        for (var _c = __values(Object.entries(exports.allConsoleCommands)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), key = _e[0], command_3 = _e[1];
            if (command_3.init)
                command_3.data = undefined;
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_7) throw e_7.error; }
    }
    try {
        for (var _f = __values(Object.entries(exports.allCommands)), _g = _f.next(); !_g.done; _g = _f.next()) {
            var _h = __read(_g.value, 2), key = _h[0], command_4 = _h[1];
            if (command_4.init)
                command_4.data = undefined;
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
        }
        finally { if (e_8) throw e_8.error; }
    }
}
