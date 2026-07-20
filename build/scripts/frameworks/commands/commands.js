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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consoleState = exports.consoleCommandList = exports.commandList = exports.allConsoleCommands = exports.allCommands = void 0;
exports.command = command;
exports.processArgString = processArgString;
exports.formatArg = formatArg;
exports.joinArgs = joinArgs;
exports.disambiguateArgument = disambiguateArgument;
exports.processArgs = processArgs;
exports.convertArgs = convertArgs;
exports.handleTapEvent = handleTapEvent;
exports.register = register;
exports.registerConsole = registerConsole;
exports.initialize = initialize;
exports.reset = reset;
var api = __importStar(require("/api"));
var config_1 = require("/config");
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
function disambiguateArgument(options_1, arg_1, _a, sender_1, outputArgs_1, optionStringifier_1) {
    return __awaiter(this, arguments, void 0, function (options, arg, _b, sender, outputArgs, optionStringifier, columns) {
        var word, a_an_word, _c, _d;
        var name = _b.name, type = _b.type;
        if (columns === void 0) { columns = 3; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!(options == null)) return [3 /*break*/, 1];
                    (0, errors_1.fail)(arg.startsWith("@") ?
                        (0, errors_1.fail)("".concat((0, funcs_1.capitalizeText)(types_1.commandArgNames[type]), " selector ").concat(arg, " returned no results."))
                        : (0, errors_1.fail)("".concat((0, funcs_1.capitalizeText)(types_1.commandArgNames[type]), " \"").concat(arg, "\" not found.")));
                    return [3 /*break*/, 4];
                case 1:
                    if (!(options instanceof Array)) return [3 /*break*/, 3];
                    word = types_1.commandArgNames[type];
                    if (!sender)
                        (0, errors_1.fail)("Name \"".concat(arg, "\" could refer to more than one ").concat(word, "."));
                    a_an_word = (0, funcs_1.indefiniteArticle)(word);
                    _c = outputArgs;
                    _d = name;
                    return [4 /*yield*/, menus_1.Menu.menu("Select ".concat(a_an_word), "Select ".concat(a_an_word, " for the argument \"").concat(name, "\""), options, sender, {
                            includeCancel: true,
                            optionStringifier: optionStringifier,
                            columns: columns,
                        })];
                case 2:
                    _c[_d] = _e.sent();
                    return [3 /*break*/, 4];
                case 3:
                    outputArgs[name] = options;
                    _e.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
var argsSupportingBlank = ["player", "playerOn", "unittype", "map", "mapOrRandom", "rank", "roleflag", "item", "team"];
/** Takes a list of joined args passed to the command, and processes it, turning it into a kwargs style object. */
function processArgs(args, processedCmdArgs, sender, commandName) {
    return __awaiter(this, void 0, void 0, function () {
        var outputArgs, _loop_1, _a, _b, _c, i, cmdArg, e_2_1;
        var e_2, _d;
        var _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    outputArgs = {};
                    _loop_1 = function (i, cmdArg) {
                        var _k, _l, commonArgs, _m, options, uuid_1, player, info, data, needsConfirm, _o, left, right, r2, _p, _q, mouseX_1, mouseY_1, score_1, fishP, err_1, _r, mouseX_2, mouseY_2, closestPlayer, _s, x_1, y_1, query, rank_1, role_1, num, options_1, buttons, selection, num_1, number, milliseconds, block;
                        return __generator(this, function (_t) {
                            switch (_t.label) {
                                case 0:
                                    if (!(!(i in args) || args[i] === "" || args[i] === "@" || args[i] === "@0")) return [3 /*break*/, 5];
                                    if (!(cmdArg.isOptional && args[i] !== "@")) return [3 /*break*/, 1];
                                    outputArgs[cmdArg.name] = undefined;
                                    return [2 /*return*/, "continue"];
                                case 1:
                                    if (!(sender && argsSupportingBlank.includes(cmdArg.type))) return [3 /*break*/, 2];
                                    args[i] = "";
                                    return [3 /*break*/, 5];
                                case 2:
                                    if (!sender) return [3 /*break*/, 4];
                                    _k = args;
                                    _l = i;
                                    return [4 /*yield*/, menus_1.Menu.text("/".concat(commandName), "Specify a value for the argument \"".concat(cmdArg.name, "\""), sender)];
                                case 3:
                                    _k[_l] = _t.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    (0, errors_1.fail)("No value specified for arg ".concat(cmdArg.name, ". Did you type two spaces instead of one?"));
                                    _t.label = 5;
                                case 5:
                                    commonArgs = [args[i], cmdArg, sender, outputArgs];
                                    _m = cmdArg.type;
                                    switch (_m) {
                                        case "player": return [3 /*break*/, 6];
                                        case "playerOn": return [3 /*break*/, 6];
                                        case "team": return [3 /*break*/, 41];
                                        case "number": return [3 /*break*/, 49];
                                        case "time": return [3 /*break*/, 50];
                                        case "string": return [3 /*break*/, 51];
                                        case "boolean": return [3 /*break*/, 52];
                                        case "block": return [3 /*break*/, 53];
                                        case "unittype": return [3 /*break*/, 54];
                                        case "uuid": return [3 /*break*/, 56];
                                        case "map": return [3 /*break*/, 57];
                                        case "mapOrRandom": return [3 /*break*/, 59];
                                        case "rank": return [3 /*break*/, 61];
                                        case "roleflag": return [3 /*break*/, 63];
                                        case "item": return [3 /*break*/, 65];
                                    }
                                    return [3 /*break*/, 67];
                                case 6:
                                    options = void 0;
                                    if (!globals_1.uuidPattern.test(args[i])) return [3 /*break*/, 14];
                                    uuid_1 = args[i];
                                    player = players_1.FishPlayer.getById(uuid_1);
                                    if (!(player == null)) return [3 /*break*/, 12];
                                    if (cmdArg.type == "playerOn")
                                        (0, errors_1.fail)("This command only accepts online players.");
                                    info = Vars.netServer.admins.getInfoOptional(uuid_1);
                                    return [4 /*yield*/, api.getFishPlayerData(uuid_1).catch(function (err) {
                                            return (0, errors_1.fail)("Network error while downloading fish player data for ".concat(uuid_1, ": ").concat((0, funcs_1.parseError)(err)));
                                        })];
                                case 7:
                                    data = _t.sent();
                                    if (!data) return [3 /*break*/, 8];
                                    player = new players_1.FishPlayer(uuid_1, data, null);
                                    return [3 /*break*/, 11];
                                case 8:
                                    if (!info) return [3 /*break*/, 9];
                                    player = players_1.FishPlayer.createFromInfo(info);
                                    if (data)
                                        player.updateData(data);
                                    return [3 /*break*/, 11];
                                case 9:
                                    if (!sender)
                                        (0, errors_1.fail)("Player with uuid \"".concat(uuid_1, "\" not found in the server or the database. Are you sure this UUID is correct? If so, specify \"@create:").concat(uuid_1, "\""));
                                    return [4 /*yield*/, menus_1.Menu.confirm(sender, "Player with uuid \"".concat(uuid_1, "\" not found in this server or the database. Are you sure this UUID is correct?"), { title: "Confirm UUID" })];
                                case 10:
                                    _t.sent();
                                    info = Vars.netServer.admins.getInfo(uuid_1);
                                    player = players_1.FishPlayer.createFromInfo(info);
                                    _t.label = 11;
                                case 11: return [3 /*break*/, 13];
                                case 12:
                                    if (cmdArg.type == "playerOn" && !player.connected())
                                        (0, errors_1.fail)("This command only accepts online players.");
                                    _t.label = 13;
                                case 13:
                                    options = player;
                                    return [3 /*break*/, 39];
                                case 14:
                                    if (!args[i].startsWith("@")) return [3 /*break*/, 38];
                                    needsConfirm = false;
                                    _o = __read(Packages.java.lang.String(args[i]).split(":", 2), 2), left = _o[0], right = _o[1];
                                    r2 = Packages.java.lang.String(right).split(":", 2)[1];
                                    _p = left;
                                    switch (_p) {
                                        case "@cyrillic": return [3 /*break*/, 15];
                                        case "@russian": return [3 /*break*/, 15];
                                        case "@china": return [3 /*break*/, 16];
                                        case "@chinese": return [3 /*break*/, 16];
                                        case "cny": return [3 /*break*/, 16];
                                        case "@japanese": return [3 /*break*/, 17];
                                        case "@jpy": return [3 /*break*/, 17];
                                        case "@korean": return [3 /*break*/, 18];
                                        case "@kor": return [3 /*break*/, 18];
                                        case "@nonenglish": return [3 /*break*/, 19];
                                        case "@noneng": return [3 /*break*/, 19];
                                        case "@short": return [3 /*break*/, 20];
                                        case "@stopped": return [3 /*break*/, 21];
                                        case "@stelled": return [3 /*break*/, 21];
                                        case "@marked": return [3 /*break*/, 21];
                                        case "@muted": return [3 /*break*/, 22];
                                        case "@rand": return [3 /*break*/, 23];
                                        case "@s": return [3 /*break*/, 24];
                                        case "@me": return [3 /*break*/, 24];
                                        case "@self": return [3 /*break*/, 24];
                                        case "@c": return [3 /*break*/, 25];
                                        case "@cursor": return [3 /*break*/, 25];
                                        case "@offline": return [3 /*break*/, 26];
                                        case "@off": return [3 /*break*/, 26];
                                        case "@o": return [3 /*break*/, 26];
                                        case "@create": return [3 /*break*/, 27];
                                        case "@click": return [3 /*break*/, 32];
                                        case "@h": return [3 /*break*/, 34];
                                        case "@p": return [3 /*break*/, 34];
                                        case "@r": return [3 /*break*/, 35];
                                        case "@recent": return [3 /*break*/, 35];
                                    }
                                    return [3 /*break*/, 36];
                                case 15:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return /[\u0400-\u04FF]/.test(p.name); });
                                    return [3 /*break*/, 37];
                                case 16:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return /[\u4E00-\u9FFF]/.test(p.name); });
                                    return [3 /*break*/, 37];
                                case 17:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return /[\u3040-\u30FF]/.test(p.name); });
                                    return [3 /*break*/, 37];
                                case 18:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return /[\uAC00-\uD7AF\u1100-\u11FF]/.test(p.name); });
                                    return [3 /*break*/, 37];
                                case 19:
                                    //Anything beyond extended ASCII
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return /[\u0100-\uFFFF]/.test(p.name); });
                                    needsConfirm = true;
                                    return [3 /*break*/, 37];
                                case 20:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return p.cleanedName.length <= 3; });
                                    return [3 /*break*/, 37];
                                case 21:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return p.stelled(); });
                                    return [3 /*break*/, 37];
                                case 22:
                                    options = players_1.FishPlayer.getAllOnline().filter(function (p) { return p.muted(); });
                                    return [3 /*break*/, 37];
                                case 23:
                                    options = (0, funcs_1.random)(players_1.FishPlayer.getAllOnline());
                                    return [3 /*break*/, 37];
                                case 24:
                                    options = sender;
                                    return [3 /*break*/, 37];
                                case 25:
                                    {
                                        if (!(sender === null || sender === void 0 ? void 0 : sender.unit()))
                                            (0, errors_1.fail)("You must have a unit to use the @c selector.");
                                        _q = sender.player, mouseX_1 = _q.mouseX, mouseY_1 = _q.mouseY;
                                        if (mouseX_1 == 0 && mouseY_1 == 0)
                                            (0, errors_1.fail)("Unable to read your cursor position. (It says it's exactly at 0,0)");
                                        needsConfirm = true;
                                        options = [
                                            Seq.with.apply(Seq, __spreadArray([], __read(players_1.FishPlayer.getAllOnline().filter(function (p) { return p.unit() && p !== sender; })), false)).min(floatf(function (p) { return Mathf.dst2(p.unit().x, p.unit().y, mouseX_1, mouseY_1); }))
                                        ];
                                        needsConfirm = true;
                                        return [3 /*break*/, 37];
                                    }
                                    _t.label = 26;
                                case 26:
                                    {
                                        if (cmdArg.type == "playerOn")
                                            (0, errors_1.fail)("This command only accepts online players.");
                                        if (right) {
                                            if (globals_1.uuidPattern.test(right))
                                                (0, errors_1.fail)("To select by UUID, please specify \"".concat(right, "\" without the \"@offline:\" prefix."));
                                            else if (right.startsWith("create:") && r2 && globals_1.uuidPattern.test(r2))
                                                (0, errors_1.fail)("To select by UUID, please specify \"@create:".concat(r2, "\" without the \"@offline:\" prefix."));
                                            options = (_e = players_1.FishPlayer.search(Object.values(players_1.FishPlayer.cachedPlayers), right)) !== null && _e !== void 0 ? _e : (!sender || sender.ranksAtLeast("active") ?
                                                Vars.netServer.admins.searchNames(right).toSeq().toArray().slice(0, 50)
                                                    .map(players_1.FishPlayer.getFromInfo)
                                                    .sort(function (a, b) { return b.lastJoined - a.lastJoined; })
                                                : null);
                                            score_1 = function (fishP) {
                                                if (fishP.lastJoined > 0)
                                                    return fishP.lastJoined;
                                                return -fishP.info().timesJoined;
                                            };
                                            if (Array.isArray(options)) {
                                                options.sort(function (a, b) { return score_1(b) - score_1(a); });
                                            }
                                        }
                                        else {
                                            options = players_1.FishPlayer.recentLeaves;
                                        }
                                        return [3 /*break*/, 37];
                                    }
                                    _t.label = 27;
                                case 27:
                                    if (!right)
                                        (0, errors_1.fail)("You must specify a UUID to create, like this: @create:hIg/eqXDgzcAAAAADqsSYw==");
                                    fishP = players_1.FishPlayer.getFromInfo(Vars.netServer.admins.getInfo(right));
                                    if (!!fishP.connected()) return [3 /*break*/, 31];
                                    if (cmdArg.type == "playerOn")
                                        (0, errors_1.fail)("This command only accepts online players.");
                                    _t.label = 28;
                                case 28:
                                    _t.trys.push([28, 30, , 31]);
                                    return [4 /*yield*/, fishP.downloadData()];
                                case 29:
                                    _t.sent();
                                    return [3 /*break*/, 31];
                                case 30:
                                    err_1 = _t.sent();
                                    (0, errors_1.fail)("Network error while downloading fish player data for ".concat(right, ": ").concat((0, funcs_1.parseError)(err_1)));
                                    return [3 /*break*/, 31];
                                case 31:
                                    options = fishP;
                                    return [3 /*break*/, 37];
                                case 32:
                                    if (!(sender === null || sender === void 0 ? void 0 : sender.unit()))
                                        (0, errors_1.fail)("You must have a unit to use the @click selector.");
                                    sender.sendMessage("/".concat(commandName, ": Click a player's unit to select them."));
                                    return [4 /*yield*/, sender.waitForTap()];
                                case 33:
                                    _r = __read.apply(void 0, [(_t.sent()).map(function (t) { return t * 8; }), 2]), mouseX_2 = _r[0], mouseY_2 = _r[1];
                                    closestPlayer = Seq.with(players_1.FishPlayer.getAllOnline().filter(function (p) { return p.unit(); }))
                                        .min(floatf(function (p) { return Mathf.dst2(p.unit().x, p.unit().y, mouseX_2, mouseY_2); }));
                                    if (closestPlayer && Mathf.dst(closestPlayer.unit().x, closestPlayer.unit().y, mouseX_2, mouseY_2) > 32)
                                        (0, errors_1.fail)("Too far away, you must click within 4 tiles of the target.");
                                    options = closestPlayer;
                                    return [3 /*break*/, 37];
                                case 34:
                                    {
                                        _s = (_g = (_f = sender === null || sender === void 0 ? void 0 : sender.player) === null || _f === void 0 ? void 0 : _f.unit()) !== null && _g !== void 0 ? _g : (0, errors_1.fail)("You must have a unit to use the @h selector."), x_1 = _s.x, y_1 = _s.y;
                                        needsConfirm = true;
                                        options = [
                                            Seq.with.apply(Seq, __spreadArray([], __read(players_1.FishPlayer.getAllOnline().filter(function (p) { return p.unit() && p !== sender; })), false)).min(floatf(function (p) { return Mathf.dst2(p.unit().x, p.unit().y, x_1, y_1); }))
                                        ];
                                        return [3 /*break*/, 37];
                                    }
                                    _t.label = 35;
                                case 35:
                                    options = Array.from(sender ? sender.recentPlayers : exports.consoleState.recentPlayers);
                                    if (options.length == 0)
                                        (0, errors_1.fail)("No recent players. To use this selector, run a command that outputs some players.");
                                    if (cmdArg.type == "playerOn") {
                                        options = options.filter(function (p) { return p.connected(); });
                                        if (!options.length)
                                            (0, errors_1.fail)("All recent players are disconnected, but this command only accepts connected players.");
                                    }
                                    return [3 /*break*/, 37];
                                case 36:
                                    //Ranks / role flags
                                    if (args[i].startsWith("@+") || args[i].startsWith("@=") || args[i].startsWith("@-")) {
                                        query = args[i].slice(2);
                                        rank_1 = (0, funcs_1.resolveSearch)(ranks_1.Rank.search(query));
                                        if (rank_1) {
                                            options = players_1.FishPlayer.getAllOnline().filter(function (p) { return ({
                                                "-": p.rank.level <= rank_1.level,
                                                "=": p.rank == rank_1,
                                                "+": p.rank.level >= rank_1.level,
                                            }[args[i][1]]); });
                                            return [3 /*break*/, 37];
                                        }
                                        role_1 = (0, funcs_1.resolveSearch)(ranks_1.RoleFlag.getByName(query));
                                        if (role_1) {
                                            options = players_1.FishPlayer.getAllOnline().filter(function (p) { return p.flags.has(role_1); });
                                            return [3 /*break*/, 37];
                                        }
                                    }
                                    (0, errors_1.fail)("Unknown selector ".concat(args[i], "."));
                                    _t.label = 37;
                                case 37:
                                    if (Array.isArray(options)) {
                                        if (options.length == 0)
                                            options = null;
                                        else if (options.length == 1 && !needsConfirm)
                                            options = options[0];
                                    }
                                    return [3 /*break*/, 39];
                                case 38:
                                    options = players_1.FishPlayer.search(players_1.FishPlayer.getAllOnline(), args[i]);
                                    _t.label = 39;
                                case 39: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([options], __read(commonArgs), false), [function (player) { return (player.marked() ? config_1.prefixes.marked : player.autoflagged ? config_1.prefixes.flagged : "") + (Strings.stripColors(player.name).length >= 3 ?
                                            player.name
                                            : (0, funcs_1.escapeStringColorsClient)(player.name)); },
                                        2], false))];
                                case 40:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 41:
                                    num = void 0;
                                    if (!(args[i] && (!isNaN(num = Number(args[i])) ||
                                        args[i].slice(1) && !isNaN(num = Number(args[i].slice(1))) || //discard leading #
                                        args[i].slice(5) && !isNaN(num = Number(args[i].slice(5))) //discard leading team#
                                    ))) return [3 /*break*/, 42];
                                    if (num <= 255 && num >= 0 && Number.isInteger(num))
                                        outputArgs[cmdArg.name] = Team.all[num];
                                    else
                                        (0, errors_1.fail)("Team ".concat(num, " is not inside the valid range (integers 0-255)."));
                                    return [3 /*break*/, 48];
                                case 42:
                                    if (!(!args[i] && sender)) return [3 /*break*/, 46];
                                    options_1 = Team.baseTeams.concat(Team.neoplastic);
                                    Vars.state.teams.present.each(function (t) { return options_1.includes(t.team) || options_1.push(t.team); });
                                    buttons = __spreadArray(__spreadArray([], __read((0, funcs_1.to2DArray)(options_1, 3)), false), [
                                        ["other"]
                                    ], false);
                                    return [4 /*yield*/, menus_1.Menu.raw("Select a team", "Select a team for the argument \"".concat(cmdArg.name, "\""), buttons, sender, { optionStringifier: function (t) { return t == "other" ? "Other..." : t.coloredName(); } })];
                                case 43:
                                    selection = _t.sent();
                                    if (!(selection == "other")) return [3 /*break*/, 45];
                                    return [4 /*yield*/, menus_1.Menu.text("Select a team", "Enter the team's ID\nYou can also specify [accent]#123[] in the command.", sender, { positiveIntegersOnly: true })];
                                case 44:
                                    num_1 = _t.sent();
                                    if (num_1 <= 255 && num_1 >= 0)
                                        outputArgs[cmdArg.name] = Team.all[num_1];
                                    else
                                        (0, errors_1.fail)("Team ".concat(num_1, " is not inside the valid range (integers 0-255)."));
                                    _t.label = 45;
                                case 45: return [3 /*break*/, 48];
                                case 46: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([(0, utils_1.getTeam)(args[i])], __read(commonArgs), false), [function (t) { return t.coloredName(); }], false))];
                                case 47:
                                    _t.sent();
                                    _t.label = 48;
                                case 48: return [3 /*break*/, 68];
                                case 49:
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
                                        return [3 /*break*/, 68];
                                    }
                                    _t.label = 50;
                                case 50:
                                    {
                                        milliseconds = (0, utils_1.parseTimeString)(args[i]);
                                        if (milliseconds == null)
                                            (0, errors_1.fail)("Invalid time string \"".concat(args[i], "\""));
                                        outputArgs[cmdArg.name] = milliseconds;
                                        return [3 /*break*/, 68];
                                    }
                                    _t.label = 51;
                                case 51:
                                    outputArgs[cmdArg.name] = args[i];
                                    return [3 /*break*/, 68];
                                case 52:
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
                                    return [3 /*break*/, 68];
                                case 53:
                                    {
                                        block = (0, utils_1.getBlock)(args[i], "air");
                                        if (typeof block == "string")
                                            (0, errors_1.fail)(block);
                                        outputArgs[cmdArg.name] = block;
                                        return [3 /*break*/, 68];
                                    }
                                    _t.label = 54;
                                case 54: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([(0, utils_1.getUnitType)(args[i])], __read(commonArgs), false), [function (u) { return u.emoji() + (0, funcs_1.capitalizeText)(u.name); }], false))];
                                case 55:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 56:
                                    if (!globals_1.uuidPattern.test(args[i]))
                                        (0, errors_1.fail)("Invalid uuid string \"".concat(args[i], "\""));
                                    outputArgs[cmdArg.name] = args[i];
                                    return [3 /*break*/, 68];
                                case 57: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([(0, utils_1.getMap)(args[i])], __read(commonArgs), false), [function (r) { return r.name(); },
                                        2], false))];
                                case 58:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 59:
                                    if (["rand", "random"].includes((_h = args[i]) === null || _h === void 0 ? void 0 : _h.toLowerCase())) {
                                        outputArgs[cmdArg.name] = "random";
                                        return [3 /*break*/, 68];
                                    }
                                    return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([(0, utils_1.getMap)(args[i])], __read(commonArgs), false), [function (r) { return r.name(); },
                                            2], false))];
                                case 60:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 61: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([ranks_1.Rank.search(args[i])], __read(commonArgs), false), [function (r) { return r.coloredName(); }], false))];
                                case 62:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 63: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([ranks_1.RoleFlag.search(args[i])], __read(commonArgs), false), [function (f) { return f.coloredName(); }], false))];
                                case 64:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 65: return [4 /*yield*/, disambiguateArgument.apply(void 0, __spreadArray(__spreadArray([(0, utils_1.getItem)(args[i])], __read(commonArgs), false), [function (i) { return i.emoji() + (0, funcs_1.capitalizeText)(i.name, "-"); },
                                        2], false))];
                                case 66:
                                    _t.sent();
                                    return [3 /*break*/, 68];
                                case 67:
                                    cmdArg.type;
                                    (0, funcs_1.crash)("impossible");
                                    _t.label = 68;
                                case 68: return [2 /*return*/];
                            }
                        });
                    };
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 6, 7, 8]);
                    _a = __values(processedCmdArgs.entries()), _b = _a.next();
                    _j.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    _c = __read(_b.value, 2), i = _c[0], cmdArg = _c[1];
                    return [5 /*yield**/, _loop_1(i, cmdArg)];
                case 3:
                    _j.sent();
                    _j.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _j.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/, outputArgs];
            }
        });
    });
}
var variadicArgumentTypes = ["player", "string", "map", "mapOrRandom"];
function isArgOptional(arg, allowMenus) {
    return arg.isOptional || allowMenus;
}
/** Converts the CommandArg[] to the format accepted by Arc CommandHandler */
function convertArgs(processedCmdArgs, allowMenus) {
    return processedCmdArgs.map(function (arg, index, array) {
        var isOptional = isArgOptional(arg, allowMenus) &&
            !array.slice(index + 1).some(function (c) { return !isArgOptional(c, allowMenus); }); //this is enforced by the arc command handler
        //TODO internalize command handler
        var brackets = isOptional ? ["[", "]"] : ["<", ">"];
        //if the arg is a string and last argument, make it variadic (so if `/warn player a b c d` is run, the last arg is "a b c d" not "a")
        return brackets[0] + arg.name + (variadicArgumentTypes.includes(arg.type) && index + 1 == array.length ? "..." : "") + brackets[1];
    }).join(" ");
}
function handleTapEvent(event) {
    var _a;
    var sender = players_1.FishPlayer.get(event.player);
    if (sender.tapInfo.resolve) {
        var tmp = sender.tapInfo.resolve;
        sender.tapInfo.resolve = null;
        tmp(event.tile.x, event.tile.y);
    }
    if (sender.tapInfo.commandName == null)
        return;
    var command = exports.allCommands[sender.tapInfo.commandName];
    var usageData = sender.getUsageData(sender.tapInfo.commandName);
    var handleTapsUpdated = false;
    var shouldClearCopy = true;
    var shouldClearPlayers = true;
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
            copy: function (text) {
                if (shouldClearCopy) {
                    sender.copyOptions = [];
                    shouldClearCopy = false;
                }
                if (text)
                    sender.copyOptions.push(String(text));
                return text;
            },
            player: function (p) {
                if (shouldClearPlayers) {
                    sender.recentPlayers.clear();
                    shouldClearPlayers = false;
                }
                if (p instanceof players_1.FishPlayer)
                    sender.recentPlayers.add(p);
                else if (p instanceof Player)
                    sender.recentPlayers.add(players_1.FishPlayer.get(p));
                else if (p instanceof Administration.PlayerInfo)
                    sender.recentPlayers.add(players_1.FishPlayer.getFromInfo(p));
                return p;
            },
        });
        if (!failed_1)
            usageData.tapLastUsedSuccessfully = Date.now();
    }
    catch (err) {
        (0, utils_1.handleError)(err, sender, utils_1.outputFail, "".concat(sender.cleanedName, " ran /").concat(sender.tapInfo.commandName, " and tapped"));
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
    var _loop_2 = function (name, _data) {
        //Invoke thunk if necessary
        var data = typeof _data == "function" ? _data() : _data;
        //Process the args
        var processedCmdArgs = data.args.map(processArgString);
        clientHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
        clientHandler.register(name, convertArgs(processedCmdArgs, true), data.description, new CommandHandler.CommandRunner({ accept: function (unjoinedRawArgs, sender) {
                return __awaiter(this, void 0, void 0, function () {
                    var fishSender, rawArgs, resolvedArgs, err_2, shouldClearCopy, shouldClearPlayers, usageData, failed, args_1, requirements, err_3;
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
                                    if (data.customUnauthorizedMessage) {
                                        (0, utils_1.outputFail)(data.customUnauthorizedMessage, sender);
                                        globals_1.FishEvents.fire("commandUnauthorized", [fishSender, name]);
                                    }
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
                                return [4 /*yield*/, processArgs(rawArgs, processedCmdArgs, fishSender, name)];
                            case 2:
                                resolvedArgs = _b.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_2 = _b.sent();
                                (0, utils_1.handleError)(err_2, fishSender, utils_1.outputFail, "".concat(fishSender.cleanedName, " ran /").concat(name));
                                return [2 /*return*/];
                            case 4:
                                shouldClearCopy = true;
                                shouldClearPlayers = true;
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
                                    copy: function (text) {
                                        if (shouldClearCopy) {
                                            fishSender.copyOptions = [];
                                            shouldClearCopy = false;
                                        }
                                        if (text)
                                            fishSender.copyOptions.push(String(text));
                                        return text;
                                    },
                                    player: function (p) {
                                        if (shouldClearPlayers) {
                                            fishSender.recentPlayers.clear();
                                            shouldClearPlayers = false;
                                        }
                                        if (p instanceof players_1.FishPlayer)
                                            fishSender.recentPlayers.add(p);
                                        else if (p instanceof Player)
                                            fishSender.recentPlayers.add(players_1.FishPlayer.get(p));
                                        else if (p instanceof Administration.PlayerInfo)
                                            fishSender.recentPlayers.add(players_1.FishPlayer.getFromInfo(p));
                                        return p;
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
                                err_3 = _b.sent();
                                (0, utils_1.handleError)(err_3, fishSender, utils_1.outputFail, "".concat(fishSender.cleanedName, " ran /").concat(name));
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
            _loop_2(name, _data);
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
exports.consoleState = {
    recentPlayers: new Set(),
};
function registerConsole(commands, serverHandler) {
    var e_4, _a;
    var _loop_3 = function (name, data) {
        //Process the args
        var processedCmdArgs = data.args.map(processArgString);
        serverHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
        serverHandler.register(name, convertArgs(processedCmdArgs, false), data.description, new CommandHandler.CommandRunner({ accept: function (rawArgs) {
                return __awaiter(this, void 0, void 0, function () {
                    var resolvedArgs, err_4, shouldClearPlayers, usageData, failed_2;
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
                                return [4 /*yield*/, processArgs(rawArgs, processedCmdArgs, null, name)];
                            case 2:
                                resolvedArgs = _c.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_4 = _c.sent();
                                //if args are invalid
                                Log.err(err_4);
                                return [2 /*return*/];
                            case 4:
                                shouldClearPlayers = false;
                                usageData = ((_a = globalUsageData[_b = "_console_" + name]) !== null && _a !== void 0 ? _a : (globalUsageData[_b] = { lastUsed: -1, lastUsedSuccessfully: -1 }));
                                try {
                                    failed_2 = false;
                                    data.handler(__assign({ rawArgs: rawArgs, args: resolvedArgs, data: data.data, outputFail: function (message) { (0, utils_1.outputConsole)(message, Log.err); failed_2 = true; }, outputSuccess: utils_1.outputConsole, output: utils_1.outputConsole, f: formatting_1.f_server, execServer: function (command) { return serverHandler.handleMessage(command); }, player: function (p) {
                                            if (shouldClearPlayers) {
                                                exports.consoleState.recentPlayers.clear();
                                                shouldClearPlayers = false;
                                            }
                                            if (p instanceof players_1.FishPlayer)
                                                exports.consoleState.recentPlayers.add(p);
                                            else if (p instanceof Player)
                                                exports.consoleState.recentPlayers.add(players_1.FishPlayer.get(p));
                                            else if (p instanceof Administration.PlayerInfo)
                                                exports.consoleState.recentPlayers.add(players_1.FishPlayer.getFromInfo(p));
                                            return p;
                                        }, admins: Vars.netServer.admins }, usageData));
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
            _loop_3(name, data);
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
