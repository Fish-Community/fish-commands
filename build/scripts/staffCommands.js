"use strict";
/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains the in-game chat commands that can be run by trusted staff.
*/
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
exports.commands = void 0;
var api = require("/api");
var commands_1 = require("/commands");
var config_1 = require("/config");
var files_1 = require("/files");
var fjsContext = require("/fjsContext");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var menus_1 = require("/menus");
var players_1 = require("/players");
var ranks_1 = require("/ranks");
var utils_1 = require("/utils");
exports.commands = (0, commands_1.commandList)({
    warn: {
        args: ['player:player', 'message:string?'],
        description: 'Sends the player a warning (menu popup).',
        perm: commands_1.Perm.warn,
        requirements: [commands_1.Req.cooldown(3000)],
        handler: function (_a) {
            var _b;
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.player.hasPerm("blockTrolling"))
                (0, commands_1.fail)(f(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Player ", " is insufficiently trollable."], ["Player ", " is insufficiently trollable."])), args.player));
            var message = (_b = args.message) !== null && _b !== void 0 ? _b : "You have been warned. I suggest you stop what you're doing";
            menus_1.Menu.menu('Warning', message, ["[green]Accept"], args.player, { onCancel: 'null' })
                .then(function () { return outputSuccess('Player acknowledged the warning.'); });
            (0, utils_1.logAction)('warned', sender, args.player, message);
            outputSuccess(f(templateObject_2 || (templateObject_2 = __makeTemplateObject(["Warned player ", " for \"", "\""], ["Warned player ", " for \"", "\""])), args.player, message));
        }
    },
    mute: {
        args: ['player:player'],
        description: 'Stops a player from chatting.',
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("player")],
        handler: function (_a) {
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.player.muted)
                (0, commands_1.fail)(f(templateObject_3 || (templateObject_3 = __makeTemplateObject(["Player ", " is already muted."], ["Player ", " is already muted."])), args.player));
            args.player.mute(sender);
            (0, utils_1.logAction)('muted', sender, args.player);
            outputSuccess(f(templateObject_4 || (templateObject_4 = __makeTemplateObject(["Muted player ", "."], ["Muted player ", "."])), args.player));
        }
    },
    unmute: {
        args: ['player:player'],
        description: 'Unmutes a player',
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (!args.player.muted && args.player.autoflagged)
                (0, commands_1.fail)(f(templateObject_5 || (templateObject_5 = __makeTemplateObject(["Player ", " is not muted, but they are autoflagged. You probably want to free them with /free."], ["Player ", " is not muted, but they are autoflagged. You probably want to free them with /free."])), args.player));
            if (!args.player.muted)
                (0, commands_1.fail)(f(templateObject_6 || (templateObject_6 = __makeTemplateObject(["Player ", " is not muted."], ["Player ", " is not muted."])), args.player));
            args.player.unmute(sender);
            (0, utils_1.logAction)('unmuted', sender, args.player);
            outputSuccess(f(templateObject_7 || (templateObject_7 = __makeTemplateObject(["Unmuted player ", "."], ["Unmuted player ", "."])), args.player));
        }
    },
    kick: {
        args: ["player:player", "duration:time?", "reason:string?"],
        description: 'Kick a player with optional reason.',
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("player")],
        handler: function (_a) {
            var _b, _c, _d;
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f, sender = _a.sender;
            if (!sender.hasPerm("admin") && args.duration && args.duration > 3600000 * 6)
                (0, commands_1.fail)("Maximum kick duration is 6 hours.");
            var reason = (_b = args.reason) !== null && _b !== void 0 ? _b : "A staff member did not like your actions.";
            var duration = (_c = args.duration) !== null && _c !== void 0 ? _c : 60000;
            args.player.kick(reason, duration);
            (0, utils_1.logAction)("kicked", sender, args.player, (_d = args.reason) !== null && _d !== void 0 ? _d : undefined, duration);
            if (duration > 60000)
                args.player.setPunishedIP(config_1.stopAntiEvadeTime);
            outputSuccess(f(templateObject_8 || (templateObject_8 = __makeTemplateObject(["Kicked player ", " for ", " with reason \"", "\""], ["Kicked player ", " for ", " with reason \"", "\""])), args.player, (0, utils_1.formatTime)(duration), reason));
        }
    },
    stop: {
        args: ['player:player', "time:time?", "message:string?"],
        description: 'Stops a player.',
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("player", true)],
        handler: function (_a) {
            var _b, _c, _d, _e;
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.player.marked()) {
                //overload: overwrite stoptime
                if (!args.time)
                    (0, commands_1.fail)(f(templateObject_9 || (templateObject_9 = __makeTemplateObject(["Player ", " is already marked."], ["Player ", " is already marked."])), args.player));
                var previousTime = (0, utils_1.formatTimeRelative)(args.player.unmarkTime, true);
                args.player.updateStopTime(args.time);
                outputSuccess(f(templateObject_10 || (templateObject_10 = __makeTemplateObject(["Player ", "'s stop time has been updated to ", " (was ", ")."], ["Player ", "'s stop time has been updated to ", " (was ", ")."])), args.player, (0, utils_1.formatTime)(args.time), previousTime));
                (0, utils_1.logAction)("updated stop time of", sender, args.player, (_b = args.message) !== null && _b !== void 0 ? _b : undefined, args.time);
            }
            else {
                var time = (_c = args.time) !== null && _c !== void 0 ? _c : (0, utils_1.untilForever)();
                if (time + Date.now() > globals_1.maxTime)
                    (0, commands_1.fail)("Error: time too high.");
                args.player.stop(sender, time, (_d = args.message) !== null && _d !== void 0 ? _d : undefined);
                (0, utils_1.logAction)('stopped', sender, args.player, (_e = args.message) !== null && _e !== void 0 ? _e : undefined, time);
                //TODO outputGlobal()
                Call.sendMessage("[orange]Player \"".concat(args.player.prefixedName, "[orange]\" has been marked for ").concat((0, utils_1.formatTime)(time)).concat(args.message ? " with reason: [white]".concat(args.message, "[]") : "", "."));
            }
        }
    },
    free: {
        args: ['player:player'],
        description: 'Frees a player.',
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, outputFail = _a.outputFail, f = _a.f;
            if (args.player.marked()) {
                args.player.free(sender);
                (0, utils_1.logAction)('freed', sender, args.player);
                outputSuccess(f(templateObject_11 || (templateObject_11 = __makeTemplateObject(["Player ", " has been unmarked."], ["Player ", " has been unmarked."])), args.player));
            }
            else if (args.player.autoflagged) {
                args.player.autoflagged = false;
                args.player.sendMessage("[yellow]You have been freed! Enjoy!");
                args.player.updateName();
                args.player.forceRespawn();
                outputSuccess(f(templateObject_12 || (templateObject_12 = __makeTemplateObject(["Player ", " has been unflagged."], ["Player ", " has been unflagged."])), args.player));
            }
            else {
                outputFail(f(templateObject_13 || (templateObject_13 = __makeTemplateObject(["Player ", " is not marked or autoflagged."], ["Player ", " is not marked or autoflagged."])), args.player));
            }
        }
    },
    setrank: {
        args: ["player:player", "rank:rank"],
        description: "Set a player's rank.",
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("player")],
        handler: function (_a) {
            var _b = _a.args, rank = _b.rank, player = _b.player, outputSuccess = _a.outputSuccess, f = _a.f, sender = _a.sender;
            if (rank.level >= sender.rank.level)
                (0, commands_1.fail)(f(templateObject_14 || (templateObject_14 = __makeTemplateObject(["You do not have permission to promote players to rank ", ", because your current rank is ", ""], ["You do not have permission to promote players to rank ", ", because your current rank is ", ""])), rank, sender.rank));
            if (rank == ranks_1.Rank.pi && !config_1.Mode.localDebug)
                (0, commands_1.fail)(f(templateObject_15 || (templateObject_15 = __makeTemplateObject(["Rank ", " is immutable."], ["Rank ", " is immutable."])), rank));
            if (player.immutable() && !config_1.Mode.localDebug)
                (0, commands_1.fail)(f(templateObject_16 || (templateObject_16 = __makeTemplateObject(["Player ", " is immutable."], ["Player ", " is immutable."])), player));
            player.setRank(rank);
            (0, utils_1.logAction)("set rank to ".concat(rank.name, " for"), sender, player);
            outputSuccess(f(templateObject_17 || (templateObject_17 = __makeTemplateObject(["Set rank of player ", " to ", ""], ["Set rank of player ", " to ", ""])), player, rank));
        }
    },
    setflag: {
        args: ["player:player", "flag:roleflag", "value:boolean"],
        description: "Set a player's role flags.",
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("player")],
        handler: function (_a) {
            var _b = _a.args, flag = _b.flag, player = _b.player, value = _b.value, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (!sender.hasPerm("admin") && !flag.assignableByModerators)
                (0, commands_1.fail)(f(templateObject_18 || (templateObject_18 = __makeTemplateObject(["You do not have permission to change the value of role flag ", ""], ["You do not have permission to change the value of role flag ", ""])), flag));
            player.setFlag(flag, value);
            (0, utils_1.logAction)("set roleflag ".concat(flag.name, " to ").concat(value, " for"), sender, player);
            outputSuccess(f(templateObject_19 || (templateObject_19 = __makeTemplateObject(["Set role flag ", " of player ", " to ", ""], ["Set role flag ", " of player ", " to ", ""])), flag, player, value));
        }
    },
    murder: {
        args: [],
        description: 'Kills all ohno units',
        perm: commands_1.Perm.mod,
        customUnauthorizedMessage: "[yellow]You're a [scarlet]monster[].",
        handler: function (_a) {
            var output = _a.output, f = _a.f, allCommands = _a.allCommands;
            var Ohnos = allCommands["ohno"].data; //this is not ideal... TODO commit omega shenanigans
            var numOhnos = Ohnos.amount();
            Ohnos.killAll();
            output(f(templateObject_20 || (templateObject_20 = __makeTemplateObject(["[orange]You massacred ", " helpless ohno crawlers."], ["[orange]You massacred ", " helpless ohno crawlers."])), numOhnos));
        }
    },
    stop_offline: {
        args: ["time:time?", "name:string?"],
        description: "Stops an offline player.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                function stop(option, time) {
                    var fishP = players_1.FishPlayer.getFromInfo(option);
                    if (sender.canModerate(fishP, true)) {
                        (0, utils_1.logAction)(fishP.marked() ? time == 1000 ? "freed" : "updated stop time of" : "stopped", sender, option, undefined, time);
                        fishP.stop(sender, time);
                        outputSuccess(f(templateObject_21 || (templateObject_21 = __makeTemplateObject(["Player ", " was marked for ", "."], ["Player ", " was marked for ", "."])), option, (0, utils_1.formatTime)(time)));
                    }
                    else {
                        outputFail("You do not have permission to stop this player.");
                    }
                }
                var maxPlayers, info, possiblePlayers, exactPlayers, score_1, optionPlayer, _c, _d, _e;
                var _f, _g;
                var args = _b.args, sender = _b.sender, outputFail = _b.outputFail, outputSuccess = _b.outputSuccess, f = _b.f, admins = _b.admins;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            maxPlayers = 60;
                            if (args.name && globals_1.uuidPattern.test(args.name)) {
                                info = admins.getInfoOptional(args.name);
                                if (info != null) {
                                    stop(info, (_f = args.time) !== null && _f !== void 0 ? _f : (0, utils_1.untilForever)());
                                }
                                else {
                                    outputFail(f(templateObject_22 || (templateObject_22 = __makeTemplateObject(["Unknown UUID ", ""], ["Unknown UUID ", ""])), args.name));
                                }
                                return [2 /*return*/];
                            }
                            if (args.name) {
                                possiblePlayers = (0, funcs_1.setToArray)(admins.searchNames(args.name));
                                if (possiblePlayers.length > maxPlayers) {
                                    exactPlayers = (0, funcs_1.setToArray)(admins.findByName(args.name));
                                    if (exactPlayers.length > 0) {
                                        possiblePlayers = exactPlayers;
                                    }
                                    else {
                                        (0, commands_1.fail)("Too many players with that name.");
                                    }
                                }
                                else if (possiblePlayers.length == 0) {
                                    (0, commands_1.fail)("No players with that name were found.");
                                }
                                score_1 = function (data) {
                                    var fishP = players_1.FishPlayer.getById(data.id);
                                    if (fishP)
                                        return fishP.lastJoined;
                                    return -data.timesJoined;
                                };
                                possiblePlayers.sort(function (a, b) { return score_1(b) - score_1(a); });
                            }
                            else {
                                possiblePlayers = players_1.FishPlayer.recentLeaves.map(function (p) { return p.info(); });
                            }
                            return [4 /*yield*/, menus_1.Menu.menu("Stop", "Choose a player to mark", possiblePlayers, sender, {
                                    includeCancel: true,
                                    optionStringifier: function (p) { return p.lastName; }
                                })];
                        case 1:
                            optionPlayer = _h.sent();
                            if (!((_g = args.time) !== null && _g !== void 0)) return [3 /*break*/, 2];
                            _c = _g;
                            return [3 /*break*/, 4];
                        case 2:
                            _d = args;
                            _e = utils_1.match;
                            return [4 /*yield*/, menus_1.Menu.menu("Stop", "Select stop time", ["2 days", "7 days", "30 days", "forever"], sender)];
                        case 3:
                            _c = (_d.time = _e.apply(void 0, [_h.sent(), {
                                    "2 days": 172800000,
                                    "7 days": 604800000,
                                    "30 days": 2592000000,
                                    "forever": globals_1.maxTime - Date.now() - 10000,
                                }]));
                            _h.label = 4;
                        case 4:
                            _c;
                            stop(optionPlayer, args.time);
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    mute_offline: {
        args: ["name:string?"],
        description: "Mutes an offline player.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                function mute(option) {
                    return __awaiter(this, void 0, void 0, function () {
                        var fishP;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    fishP = players_1.FishPlayer.getFromInfo(option);
                                    if (!sender.canModerate(fishP, true))
                                        (0, commands_1.fail)("You do not have permission to mute this player.");
                                    return [4 /*yield*/, menus_1.Menu.confirm(sender, "Are you sure you want to ".concat(fishP.muted ? "unmute" : "mute", " player ").concat(option.lastName, "?"), {
                                            title: "Mute Offine Confirmation",
                                            confirmText: "[green]Yes, ".concat(fishP.muted ? "unmute" : "mute", " them"),
                                        })];
                                case 1:
                                    _a.sent();
                                    (0, utils_1.logAction)(fishP.muted ? "unmuted" : "muted", sender, fishP);
                                    if (fishP.muted)
                                        fishP.unmute(sender);
                                    else
                                        fishP.mute(sender);
                                    outputSuccess("".concat(fishP.muted ? "Muted" : "Unmuted", " ").concat(option.lastName, "."));
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
                var maxPlayers, info, possiblePlayers, exactPlayers, score_2, option;
                var _c;
                var args = _b.args, sender = _b.sender, outputSuccess = _b.outputSuccess, f = _b.f, admins = _b.admins;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            maxPlayers = 300;
                            if (args.name && globals_1.uuidPattern.test(args.name)) {
                                info = (_c = admins.getInfoOptional(args.name)) !== null && _c !== void 0 ? _c : (0, commands_1.fail)(f(templateObject_23 || (templateObject_23 = __makeTemplateObject(["Unknown UUID ", ""], ["Unknown UUID ", ""])), args.name));
                                mute(info);
                                return [2 /*return*/];
                            }
                            if (args.name) {
                                possiblePlayers = (0, funcs_1.setToArray)(admins.searchNames(args.name));
                                if (possiblePlayers.length > maxPlayers) {
                                    exactPlayers = (0, funcs_1.setToArray)(admins.findByName(args.name));
                                    if (exactPlayers.length > 0) {
                                        possiblePlayers = exactPlayers;
                                    }
                                    else {
                                        (0, commands_1.fail)("Too many players with that name.");
                                    }
                                }
                                else if (possiblePlayers.length == 0) {
                                    (0, commands_1.fail)("No players with that name were found.");
                                }
                                score_2 = function (data) {
                                    var fishP = players_1.FishPlayer.getById(data.id);
                                    if (fishP)
                                        return fishP.lastJoined;
                                    return -data.timesJoined;
                                };
                                possiblePlayers.sort(function (a, b) { return score_2(b) - score_2(a); });
                            }
                            else {
                                possiblePlayers = players_1.FishPlayer.recentLeaves.map(function (p) { return p.info(); });
                            }
                            return [4 /*yield*/, menus_1.Menu.pagedList(sender, "Mute", "Choose a player to mute", possiblePlayers, {
                                    optionStringifier: function (p) { return p.lastName; }
                                })];
                        case 1:
                            option = _d.sent();
                            mute(option);
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    restart: {
        args: [],
        description: "Stops and restarts the server. Do not run when the player count is high.",
        perm: commands_1.Perm.admin,
        handler: function () {
            (0, utils_1.serverRestartLoop)(30);
        }
    },
    history: {
        args: ["player:player"],
        description: "Shows moderation history for a player.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var args = _a.args, output = _a.output, f = _a.f;
            if (args.player.history && args.player.history.length > 0) {
                output("[yellow]_______________Player history_______________\n\n" +
                    args.player.history.map(function (e) {
                        return "".concat(e.by, " [yellow]").concat(e.action, " ").concat(args.player.prefixedName, " [white]").concat((0, utils_1.formatTimeRelative)(e.time));
                    }).join("\n"));
            }
            else {
                output(f(templateObject_24 || (templateObject_24 = __makeTemplateObject(["[yellow]No history was found for player ", "."], ["[yellow]No history was found for player ", "."])), args.player));
            }
        }
    },
    save: {
        args: [],
        description: "Saves the game state.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var outputSuccess = _a.outputSuccess;
            players_1.FishPlayer.saveAll();
            globals_1.FishEvents.fire("saveData", []);
            var file = Vars.saveDirectory.child("1.".concat(Vars.saveExtension));
            SaveIO.save(file);
            outputSuccess("Game saved.");
        }
    },
    wave: {
        args: ["wave:number"],
        description: "Sets the wave number.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.wave < 0)
                (0, commands_1.fail)("Wave must be positive.");
            if (!Number.isSafeInteger(args.wave))
                (0, commands_1.fail)("Wave must be an integer.");
            Vars.state.wave = args.wave;
            outputSuccess(f(templateObject_25 || (templateObject_25 = __makeTemplateObject(["Set wave to ", ""], ["Set wave to ", ""])), Vars.state.wave));
        }
    },
    label: {
        args: ["time:time", "message:string"],
        description: "Places a label at your position for a specified amount of time.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var _b;
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.time > 36000000)
                (0, commands_1.fail)("Time must be less than 10 hours.");
            var unit = (_b = sender.unit()) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("You must be in a unit to use this command.");
            var timeRemaining = args.time / 1000;
            var labelx = unit.x;
            var labely = unit.y;
            globals_1.fishState.labels.push(Timer.schedule(function () {
                if (timeRemaining > 0) {
                    var timeseconds = timeRemaining % 60;
                    var timeminutes = (timeRemaining - timeseconds) / 60;
                    Call.label("".concat(sender.name, "\n\n[white]").concat(args.message, "\n\n[acid]").concat(timeminutes.toString().padStart(2, "0"), ":").concat(timeseconds.toString().padStart(2, "0")), 1, labelx, labely);
                    timeRemaining--;
                }
            }, 0, 1, args.time));
            outputSuccess(f(templateObject_26 || (templateObject_26 = __makeTemplateObject(["Placed label \"", "\" for ", " seconds."], ["Placed label \"", "\" for ", " seconds."])), args.message, timeRemaining));
        }
    },
    labelsticky: {
        args: ["time:time", "message:string"],
        description: "Places a label at the bottom left corner of everyone's screen.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.time > 36000000)
                (0, commands_1.fail)("Time must be less than 10 hours.");
            var timeRemaining = args.time / 1000;
            globals_1.fishState.labels.push(Timer.schedule(function () {
                if (timeRemaining > 0) {
                    Call.label(args.message, 5, NaN, NaN);
                    timeRemaining -= 5;
                }
            }, 0, 5, Math.ceil(args.time / 5)));
            outputSuccess(f(templateObject_27 || (templateObject_27 = __makeTemplateObject(["Placed label \"", "\" for ", " seconds."], ["Placed label \"", "\" for ", " seconds."])), args.message, timeRemaining));
        }
    },
    clearlabels: {
        args: [],
        description: "Removes all labels.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var outputSuccess = _a.outputSuccess;
            globals_1.fishState.labels.forEach(function (l) { return l.cancel(); });
            outputSuccess("Removed all labels.");
        }
    },
    member: {
        args: ["value:boolean", "player:player"],
        description: "Sets a player's member status.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            args.player.setFlag("member", args.value);
            outputSuccess(f(templateObject_28 || (templateObject_28 = __makeTemplateObject(["Set membership status of player ", " to ", "."], ["Set membership status of player ", " to ", "."])), args.player, args.value));
        }
    },
    remind: {
        args: ["rule:number", "target:player?"],
        description: "Remind players in chat of a specific rule.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var _b;
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            var rule = (_b = config_1.rules[args.rule - 1]) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("The rule you requested does not exist.");
            if (args.target) {
                args.target.sendMessage("A staff member wants to remind you of the following rule:\n" + rule);
                outputSuccess(f(templateObject_29 || (templateObject_29 = __makeTemplateObject(["Reminded ", " of rule ", ""], ["Reminded ", " of rule ", ""])), args.target, args.rule));
            }
            else {
                Call.sendMessage("A staff member wants to remind everyone of the following rule:\n" + rule);
            }
        },
    },
    ban: {
        args: ["uuid_or_ip:string?"],
        description: "Bans a player by UUID and IP.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var uuid, data, name, ip, ip, info, alreadyBanned, option;
                var args = _b.args, sender = _b.sender, outputSuccess = _b.outputSuccess, f = _b.f, admins = _b.admins;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(args.uuid_or_ip && globals_1.uuidPattern.test(args.uuid_or_ip))) return [3 /*break*/, 2];
                            uuid = args.uuid_or_ip;
                            data = void 0;
                            if ((data = admins.getInfoOptional(uuid)) != null && data.admin)
                                (0, commands_1.fail)("Cannot ban an admin.");
                            name = data ? "".concat((0, funcs_1.escapeStringColorsClient)(data.lastName), " (").concat(uuid, "/").concat(data.lastIP, ")") : uuid;
                            return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "Are you sure you want to ban ".concat(name, "?"))];
                        case 1:
                            _c.sent();
                            admins.banPlayerID(uuid);
                            if (data) {
                                ip = data.lastIP;
                                admins.banPlayerIP(ip);
                                api.ban({ ip: ip, uuid: uuid });
                                Log.info("".concat(uuid, "/").concat(ip, " was banned."));
                                (0, utils_1.logAction)("banned", sender, data);
                                outputSuccess(f(templateObject_30 || (templateObject_30 = __makeTemplateObject(["Banned player ", " (", "/", ")"], ["Banned player ", " (", "/", ")"])), (0, funcs_1.escapeStringColorsClient)(data.lastName), uuid, ip));
                                //TODO add way to specify whether to activate or escape color tags
                            }
                            else {
                                api.ban({ uuid: uuid });
                                Log.info("".concat(uuid, " was banned."));
                                (0, utils_1.logAction)("banned", sender, uuid);
                                outputSuccess(f(templateObject_31 || (templateObject_31 = __makeTemplateObject(["Banned player ", ". [yellow]Unable to determine IP.[]"], ["Banned player ", ". [yellow]Unable to determine IP.[]"])), uuid));
                            }
                            (0, utils_1.updateBans)(function (player) { return "[scarlet]Player [yellow]".concat(player.name, "[scarlet] has been whacked by ").concat(sender.prefixedName, "."); });
                            return [2 /*return*/];
                        case 2:
                            if (!(args.uuid_or_ip && globals_1.ipPattern.test(args.uuid_or_ip))) return [3 /*break*/, 4];
                            ip = args.uuid_or_ip;
                            return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "Are you sure you want to ban IP ".concat(ip, "?"))];
                        case 3:
                            _c.sent();
                            api.ban({ ip: ip });
                            info = admins.findByIP(ip);
                            if (info)
                                (0, utils_1.logAction)("banned", sender, info);
                            else
                                (0, utils_1.logAction)("banned ".concat(ip), sender);
                            alreadyBanned = admins.banPlayerIP(ip);
                            if (alreadyBanned) {
                                outputSuccess(f(templateObject_32 || (templateObject_32 = __makeTemplateObject(["IP ", " is already banned. Ban was synced to other servers."], ["IP ", " is already banned. Ban was synced to other servers."])), ip));
                            }
                            else {
                                outputSuccess(f(templateObject_33 || (templateObject_33 = __makeTemplateObject(["IP ", " has been banned. Ban was synced to other servers."], ["IP ", " has been banned. Ban was synced to other servers."])), ip));
                            }
                            (0, utils_1.updateBans)(function (player) { return "[scarlet]Player [yellow]".concat(player.name, "[scarlet] has been whacked by ").concat(sender.prefixedName, "."); });
                            return [2 /*return*/];
                        case 4: return [4 /*yield*/, menus_1.Menu.menu("[scarlet]BAN[]", "Choose a player to ban.", (0, funcs_1.setToArray)(Groups.player), sender, {
                                includeCancel: true,
                                optionStringifier: function (opt) { return opt.name; }
                            })];
                        case 5:
                            option = _c.sent();
                            if (option.admin)
                                (0, commands_1.fail)("Cannot ban an admin.");
                            return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "Are you sure you want to ban ".concat(option.name, "?"))];
                        case 6:
                            _c.sent();
                            admins.banPlayerIP(option.ip()); //this also bans the UUID
                            api.ban({ ip: option.ip(), uuid: option.uuid() });
                            Log.info("".concat(option.ip(), "/").concat(option.uuid(), " was banned."));
                            (0, utils_1.logAction)("banned", sender, option.getInfo());
                            outputSuccess(f(templateObject_34 || (templateObject_34 = __makeTemplateObject(["Banned player ", "."], ["Banned player ", "."])), option));
                            (0, utils_1.updateBans)(function (player) { return "[scarlet]Player [yellow]".concat(player.name, "[scarlet] has been whacked by ").concat(sender.prefixedName, "."); });
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    kill: {
        args: ["player:player"],
        description: "Kills a player's unit.",
        perm: commands_1.Perm.admin,
        requirements: [commands_1.Req.moderate("player", true)],
        handler: function (_a) {
            var args = _a.args, outputFail = _a.outputFail, outputSuccess = _a.outputSuccess, f = _a.f;
            var unit = args.player.unit();
            if (unit) {
                unit.kill();
                outputSuccess(f(templateObject_35 || (templateObject_35 = __makeTemplateObject(["Killed the unit of player ", "."], ["Killed the unit of player ", "."])), args.player));
            }
            else {
                outputFail(f(templateObject_36 || (templateObject_36 = __makeTemplateObject(["Player ", " does not have a unit."], ["Player ", " does not have a unit."])), args.player));
            }
        }
    },
    killunits: {
        args: ["team:team?", "unit:unittype?"],
        description: "Kills all units, optionally specifying a team and unit type.",
        perm: commands_1.Perm.massKill,
        handler: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var i_1, before, i_2, before;
                var _c = _b.args, team = _c.team, unit = _c.unit, sender = _b.sender, outputSuccess = _b.outputSuccess, f = _b.f;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!team) return [3 /*break*/, 2];
                            return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "This will kill [scarlet]every ".concat(unit ? unit.localizedName : "unit", "[] on the team ").concat(team.coloredName(), "."), { confirmText: "[orange]Kill units[]" })];
                        case 1:
                            _d.sent();
                            if (unit) {
                                i_1 = 0;
                                team.data().units.each(function (u) { return u.type == unit; }, function (u) {
                                    u.kill();
                                    i_1++;
                                });
                                outputSuccess(f(templateObject_37 || (templateObject_37 = __makeTemplateObject(["Killed ", " units on ", "."], ["Killed ", " units on ", "."])), i_1, team));
                            }
                            else {
                                before = team.data().units.size;
                                team.data().units.each(function (u) { return u.kill(); });
                                outputSuccess(f(templateObject_38 || (templateObject_38 = __makeTemplateObject(["Killed ", " units on ", "."], ["Killed ", " units on ", "."])), before, team));
                            }
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "This will kill [scarlet]every single ".concat(unit ? unit.localizedName : "unit", "[]."), { confirmText: "[orange]Kill all units[]" })];
                        case 3:
                            _d.sent();
                            if (unit) {
                                i_2 = 0;
                                Groups.unit.each(function (u) { return u.type == unit; }, function (u) {
                                    u.kill();
                                    i_2++;
                                });
                                outputSuccess(f(templateObject_39 || (templateObject_39 = __makeTemplateObject(["Killed ", " units."], ["Killed ", " units."])), i_2));
                            }
                            else {
                                before = Groups.unit.size();
                                Groups.unit.each(function (u) { return u.kill(); });
                                outputSuccess(f(templateObject_40 || (templateObject_40 = __makeTemplateObject(["Killed ", " units."], ["Killed ", " units."])), before));
                            }
                            _d.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    },
    killbuildings: {
        args: ["team:team?"],
        description: "Kills all buildings (except cores), optionally specifying a team.",
        perm: commands_1.Perm.massKill,
        handler: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var count, count;
                var team = _b.args.team, sender = _b.sender, outputSuccess = _b.outputSuccess, f = _b.f;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!team) return [3 /*break*/, 2];
                            return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "This will kill [scarlet]every building[] on the team ".concat(team.coloredName(), ", except cores."), { confirmText: "[orange]Kill buildings[]" })];
                        case 1:
                            _c.sent();
                            count = team.data().buildings.size;
                            team.data().buildings.each(function (b) { return !(b.block instanceof CoreBlock); }, function (b) { return b.tile.remove(); });
                            outputSuccess(f(templateObject_41 || (templateObject_41 = __makeTemplateObject(["Killed ", " buildings on ", "."], ["Killed ", " buildings on ", "."])), count, team));
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, menus_1.Menu.confirmDangerous(sender, "This will kill [scarlet]every building[] except cores.", { confirmText: "[orange]Kill buildings[]" })];
                        case 3:
                            _c.sent();
                            count = Groups.build.size();
                            Groups.build.each(function (b) { return !(b.block instanceof CoreBlock); }, function (b) { return b.tile.remove(); });
                            outputSuccess(f(templateObject_42 || (templateObject_42 = __makeTemplateObject(["Killed ", " buildings."], ["Killed ", " buildings."])), count));
                            _c.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    },
    respawn: {
        args: ["player:player"],
        description: "Forces a player to respawn.",
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("player", true, "mod", true)],
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            args.player.forceRespawn();
            outputSuccess(f(templateObject_43 || (templateObject_43 = __makeTemplateObject(["Respawned player ", "."], ["Respawned player ", "."])), args.player));
        }
    },
    stealunit: {
        args: ["target:player", "newcontroller:player?"],
        description: "Steals the unit of a player, putting you in their unit and forcing them to respawn.",
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.moderate("target", true, "mod", true), commands_1.Req.moderate("newcontroller", true, "mod", true)],
        handler: function (_a) {
            var _b;
            var sender = _a.sender, _c = _a.args, target = _c.target, _d = _c.newcontroller, newcontroller = _d === void 0 ? sender : _d, outputSuccess = _a.outputSuccess, f = _a.f;
            var unit = (_b = target.unit()) !== null && _b !== void 0 ? _b : (0, commands_1.fail)(f(templateObject_44 || (templateObject_44 = __makeTemplateObject(["Targeted player ", " is not in a unit."], ["Targeted player ", " is not in a unit."])), target));
            if (target.team() !== newcontroller.team()) {
                if (!sender.hasPerm("changeTeamExternal")) {
                    if (!sender.hasPerm("changeTeam"))
                        (0, commands_1.fail)("You do not have permission to change teams.");
                    newcontroller.setTeam(unit.team());
                }
            }
            target.forceRespawn();
            newcontroller.unit(unit);
            if (newcontroller == sender) {
                outputSuccess(f(templateObject_45 || (templateObject_45 = __makeTemplateObject(["Commandeered the unit of player ", "."], ["Commandeered the unit of player ", "."])), target));
            }
            else {
                outputSuccess(f(templateObject_46 || (templateObject_46 = __makeTemplateObject(["Transferred player ", " into the unit of ", "."], ["Transferred player ", " into the unit of ", "."])), newcontroller, target));
                newcontroller.sendMessage(f(templateObject_47 || (templateObject_47 = __makeTemplateObject(["[green]You were transferred to the unit of player ", " by ", "."], ["[green]You were transferred to the unit of player ", " by ", "."])), target, sender)('[green]'));
            }
        }
    },
    m: {
        args: ["message:string"],
        description: "Sends a message to muted players only.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var sender = _a.sender, args = _a.args;
            players_1.FishPlayer.messageMuted(sender.prefixedName, args.message);
        }
    },
    info: {
        args: ["target:player", "showColors:boolean?"],
        description: "Displays information about an online player.",
        perm: commands_1.Perm.none,
        handler: function (_a) {
            var sender = _a.sender, args = _a.args, output = _a.output, f = _a.f;
            var info = args.target.info();
            var names = args.showColors
                ? info.names.map(funcs_1.escapeStringColorsClient).toString(", ")
                : __spreadArray([], __read(new Set(info.names.map(function (n) { return Strings.stripColors(n); }).toArray())), false).join(", ");
            output(f(templateObject_48 || (templateObject_48 = __makeTemplateObject(["[accent]Info for player ", " [gray](", ") (#", ")\n\t[accent]Rank: ", "\n\t[accent]Role flags: ", "\n\t[accent]Stopped: ", "\n\t[accent]marked: ", "\n\t[accent]muted: ", "\n\t[accent]autoflagged: ", "\n\t[accent]VPN detected: ", "\n\t[accent]times joined / kicked: ", "/", "\n\t[accent]First joined: ", "\n\t[accent]Names used: [[", "]"], ["\\\n[accent]Info for player ", " [gray](", ") (#", ")\n\t[accent]Rank: ", "\n\t[accent]Role flags: ", "\n\t[accent]Stopped: ", "\n\t[accent]marked: ", "\n\t[accent]muted: ", "\n\t[accent]autoflagged: ", "\n\t[accent]VPN detected: ", "\n\t[accent]times joined / kicked: ", "/", "\n\t[accent]First joined: ", "\n\t[accent]Names used: [[", "]"])), args.target, (0, funcs_1.escapeStringColorsClient)(args.target.name), args.target.player.id.toString(), args.target.rank, Array.from(args.target.flags).map(function (f) { return f.coloredName(); }).join(" "), f.boolBad(!args.target.hasPerm("play")), args.target.marked() ? "until ".concat((0, utils_1.formatTimeRelative)(args.target.unmarkTime)) : "[green]false", f.boolBad(args.target.muted), f.boolBad(args.target.autoflagged), f.boolBad(args.target.ipDetectedVpn), info.timesJoined, info.timesKicked, (0, utils_1.formatTimeRelative)(args.target.firstJoined), names));
            if (sender.hasPerm("viewUUIDs"))
                output(f(templateObject_49 || (templateObject_49 = __makeTemplateObject(["\t[#FFAAAA]UUID: ", "\n\t[#FFAAAA]IP: ", ""], ["\\\n\t[#FFAAAA]UUID: ", "\n\t[#FFAAAA]IP: ", ""])), args.target.uuid, args.target.ip()));
        }
    },
    spawn: {
        args: ["type:unittype", "x:number?", "y:number?", "count:number?", "team:team?", "effects:string?", "stack:boolean?"],
        description: "Spawns a unit of specified type at your position. [scarlet]Usage will be logged.[]",
        perm: commands_1.Perm.admin,
        data: [],
        handler: function (_a) {
            var _b, _c;
            var sender = _a.sender, args = _a.args, data = _a.data, outputSuccess = _a.outputSuccess, f = _a.f;
            var x = args.x ? (args.x * 8) : sender.player.x;
            var y = args.y ? (args.y * 8) : sender.player.y;
            var team = (_b = args.team) !== null && _b !== void 0 ? _b : sender.team();
            var count = Math.min((_c = args.count) !== null && _c !== void 0 ? _c : 1, 1000);
            for (var i = 0; i < count; i++) {
                var unit = args.type.create(team);
                var xOffset = args.stack ? 0 : 0.01 * i;
                var yOffset = args.stack ? 0 : 0.5 * (i % 10);
                unit.set(x + xOffset, y + yOffset);
                if (args.effects)
                    (0, utils_1.applyEffectMode)(args.effects, unit, 1e12);
                unit.add();
                data.push(unit);
            }
            if (!config_1.Gamemode.sandbox() && args.effects !== 'paper')
                (0, utils_1.logAction)("spawned unit ".concat(args.type.name).concat(count == 1 ? '' : " x".concat(count), " at ").concat(Math.round(x / 8), ", ").concat(Math.round(y / 8)) + (args.effects ? "with ".concat(args.effects, " effects") : ''), sender);
            outputSuccess(f(templateObject_50 || (templateObject_50 = __makeTemplateObject(["Spawned unit ", " at (", ", ", ")"], ["Spawned unit ", " at (", ", ", ")"])), args.type, Math.round(x / 8), Math.round(y / 8)));
        }
    },
    setblock: {
        args: ["x:number", "y:number", "block:block", "team:team?", "rotation:number?"],
        description: "Sets the block at a location.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var _b, _c;
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            var team = (_b = args.team) !== null && _b !== void 0 ? _b : sender.team();
            var tile = Vars.world.tile(args.x, args.y);
            if (args.rotation != null && (args.rotation < 0 || args.rotation > 3))
                (0, commands_1.fail)(f(templateObject_51 || (templateObject_51 = __makeTemplateObject(["Invalid rotation ", ""], ["Invalid rotation ", ""])), args.rotation));
            if (tile == null)
                (0, commands_1.fail)(f(templateObject_52 || (templateObject_52 = __makeTemplateObject(["Position (", ", ", ") is out of bounds."], ["Position (", ", ", ") is out of bounds."])), args.x, args.y));
            tile.setNet(args.block, team, (_c = args.rotation) !== null && _c !== void 0 ? _c : 0);
            (0, utils_1.addToTileHistory)({
                pos: "".concat(args.x, ",").concat(args.y),
                uuid: sender.uuid,
                action: "setblocked",
                type: args.block.localizedName
            });
            if (!config_1.Gamemode.sandbox())
                (0, utils_1.logAction)("set block to ".concat(args.block.localizedName, " at ").concat(args.x, ",").concat(args.y), sender);
            outputSuccess(f(templateObject_53 || (templateObject_53 = __makeTemplateObject(["Set block at ", ", ", " to ", ""], ["Set block at ", ", ", " to ", ""])), args.x, args.y, args.block));
        }
    },
    setblockr: {
        args: ["block:block?", "team:team?", "rotation:number?"],
        description: "Sets the block at tapped locations, repeatedly.",
        perm: commands_1.Perm.admin,
        tapped: function (_a) {
            var _b, _c;
            var args = _a.args, sender = _a.sender, f = _a.f, x = _a.x, y = _a.y, outputSuccess = _a.outputSuccess;
            if (!args.block)
                (0, funcs_1.crash)("uh oh");
            var team = (_b = args.team) !== null && _b !== void 0 ? _b : sender.team();
            var tile = Vars.world.tile(x, y);
            if (args.rotation != null && (args.rotation < 0 || args.rotation > 3))
                (0, commands_1.fail)(f(templateObject_54 || (templateObject_54 = __makeTemplateObject(["Invalid rotation ", ""], ["Invalid rotation ", ""])), args.rotation));
            if (tile == null)
                (0, commands_1.fail)(f(templateObject_55 || (templateObject_55 = __makeTemplateObject(["Position (", ", ", ") is out of bounds."], ["Position (", ", ", ") is out of bounds."])), x, y));
            tile.setNet(args.block, team, (_c = args.rotation) !== null && _c !== void 0 ? _c : 0);
            (0, utils_1.addToTileHistory)({
                pos: "".concat(x, ",").concat(y),
                uuid: sender.uuid,
                action: "setblocked",
                type: args.block.localizedName
            });
            if (!config_1.Gamemode.sandbox())
                (0, utils_1.logAction)("set block to ".concat(args.block.localizedName, " at ").concat(x, ",").concat(y), sender);
            outputSuccess(f(templateObject_56 || (templateObject_56 = __makeTemplateObject(["Set block at ", ", ", " to ", ""], ["Set block at ", ", ", " to ", ""])), x, y, args.block));
        },
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, handleTaps = _a.handleTaps, currentTapMode = _a.currentTapMode, f = _a.f;
            if (args.block) {
                handleTaps("on");
                if (currentTapMode == "off") {
                    outputSuccess("setblockr enabled.\n[scarlet]Be careful, you have the midas touch now![] Turn it off by running /setblockr again.");
                }
                else {
                    outputSuccess(f(templateObject_57 || (templateObject_57 = __makeTemplateObject(["Changed setblockr's block to ", ""], ["Changed setblockr's block to ", ""])), args.block));
                }
            }
            else {
                if (currentTapMode == "off") {
                    (0, commands_1.fail)("Please specify the block to place.");
                }
                else {
                    handleTaps("off");
                    outputSuccess("setblockr disabled.");
                }
            }
        }
    },
    exterminate: {
        args: [],
        description: "Removes all spawned units.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f, allCommands = _a.allCommands;
            var numKilled = 0;
            allCommands.spawn.data.forEach(function (u) {
                if (u.isAdded() && !u.dead) {
                    u.kill();
                    numKilled++;
                }
            });
            if (!config_1.Gamemode.sandbox())
                (0, utils_1.logAction)("exterminated ".concat(numKilled, " units"), sender);
            outputSuccess(f(templateObject_58 || (templateObject_58 = __makeTemplateObject(["Exterminated ", " units."], ["Exterminated ", " units."])), numKilled));
        }
    },
    js: {
        args: ["javascript:string"],
        description: "Run arbitrary javascript.",
        perm: commands_1.Perm.runJS,
        customUnauthorizedMessage: "[scarlet]You are not in the jsers file. This incident will be reported.[]",
        handler: function (_a) {
            var javascript = _a.args.javascript, output = _a.output, outputFail = _a.outputFail, sender = _a.sender;
            //Additional validation couldn't hurt...
            var playerInfo_AdminUsid = sender.info().adminUsid;
            if (!playerInfo_AdminUsid || playerInfo_AdminUsid != sender.player.usid() || sender.usid() != sender.player.usid()) {
                api.sendModerationMessage("# !!!!! /js authentication failed !!!!!\nServer: ".concat(config_1.Gamemode.name(), " Player: ").concat((0, funcs_1.escapeTextDiscord)(sender.cleanedName), "/`").concat(sender.uuid, "`\n<@!709904412033810533>"));
                (0, commands_1.fail)("Authentication failure");
            }
            if (javascript == "Timer.instance().clear()")
                (0, commands_1.fail)("Are you really sure you want to do that? If so, prepend \"void\" to your command.");
            try {
                var scripts = Vars.mods.getScripts();
                var out = scripts.context.evaluateString(scripts.scope, javascript, "fish-js-console.js", 1);
                if (out instanceof Array) {
                    output("[cyan]Array: [[[]" + out.join(", ") + "[cyan]]");
                }
                else if (out === undefined) {
                    output("[blue]undefined[]");
                }
                else if (out === null) {
                    output("[blue]null[]");
                }
                else if (out instanceof Error) {
                    outputFail((0, funcs_1.parseError)(out));
                }
                else if (typeof out == "number") {
                    output("[blue]".concat(out, "[]"));
                }
                else {
                    output(out);
                }
            }
            catch (err) {
                outputFail((0, funcs_1.parseError)(err));
            }
        }
    },
    fjs: {
        args: ["javascript:string"],
        description: "Run arbitrary javascript in the fish-commands context.",
        perm: commands_1.Perm.runJS,
        customUnauthorizedMessage: "[scarlet]You are not in the jsers file. This incident will be reported.[]",
        handler: function (_a) {
            var javascript = _a.args.javascript, output = _a.output, outputFail = _a.outputFail, sender = _a.sender;
            //Additional validation couldn't hurt...
            var playerInfo_AdminUsid = sender.info().adminUsid;
            if (!playerInfo_AdminUsid || playerInfo_AdminUsid != sender.player.usid() || sender.usid() != sender.player.usid()) {
                api.sendModerationMessage("# !!!!! /js authentication failed !!!!!\nServer: ".concat(config_1.Gamemode.name(), " Player: ").concat((0, funcs_1.escapeTextDiscord)(sender.cleanedName), "/`").concat(sender.uuid, "`\n<@!709904412033810533>"));
                (0, commands_1.fail)("Authentication failure");
            }
            fjsContext.runJS(javascript, output, outputFail, sender);
        }
    },
    antibot: {
        args: ["state:boolean?"],
        description: "Checks anti bot stats, or force enables anti bot mode, MAKE SURE TO TURN IT OFF",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, output = _a.output, f = _a.f;
            if (args.state != undefined) {
                players_1.FishPlayer.antiBotModeOverride = args.state;
                outputSuccess("Set antibot mode override to ".concat(f.boolBad(args.state), "."));
                if (args.state)
                    output("[scarlet]MAKE SURE TO TURN IT OFF!!!");
            }
            else {
                output("[acid]Antibot status:\n[acid]Enabled: ".concat(f.boolBad(players_1.FishPlayer.antiBotMode()), "\n").concat((0, utils_1.getAntiBotInfo)("client")));
            }
        }
    },
    chatstrictness: {
        args: ["player:player", "value:string"],
        description: "Sets chat strictness for a player.",
        perm: commands_1.Perm.mod,
        handler: function (_a) {
            var _b = _a.args, player = _b.player, value = _b.value, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            if (!sender.canModerate(player, true))
                (0, commands_1.fail)("You do not have permission to set the chat strictness level of this player.");
            if (!(value == "chat" || value == "strict"))
                (0, commands_1.fail)("Invalid chat strictness level: valid levels are \"chat\", \"strict\"");
            player.chatStrictness = value;
            (0, utils_1.logAction)("set chat strictness to ".concat(value, " for"), sender, player);
            outputSuccess(f(templateObject_59 || (templateObject_59 = __makeTemplateObject(["Set chat strictness for player ", " to \"", "\"."], ["Set chat strictness for player ", " to \"", "\"."])), player, value));
        }
    },
    emanate: (0, commands_1.command)(function () {
        var unitMapping = {};
        Timer.schedule(function () {
            var e_1, _a;
            try {
                for (var _b = __values(Object.entries(unitMapping)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), uuid = _d[0], unit = _d[1];
                    var fishP = players_1.FishPlayer.getById(uuid);
                    if (!fishP || !fishP.connected() || (unit.getPlayer() != fishP.player)) {
                        delete unitMapping[uuid];
                        unit === null || unit === void 0 ? void 0 : unit.kill();
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, 1, 0.5);
        return {
            args: [],
            description: "Puts you in an emanate.",
            perm: commands_1.Perm.admin,
            data: { unitMapping: unitMapping },
            requirements: [],
            handler: function (_a) {
                var sender = _a.sender, outputSuccess = _a.outputSuccess;
                var emanate = UnitTypes.emanate.spawn(sender.team(), sender.player.x, sender.player.y);
                sender.player.unit(emanate);
                unitMapping[sender.uuid] = emanate;
                if (!config_1.Gamemode.sandbox())
                    (0, utils_1.logAction)("spawned an emanate", sender);
                outputSuccess("Spawned an emanate.");
            }
        };
    }),
    updatemaps: {
        args: [],
        description: 'Attempt to fetch and update all map files',
        perm: commands_1.Perm.trusted,
        requirements: [commands_1.Req.cooldownGlobal(300000)],
        handler: function (_a) {
            var output = _a.output, outputSuccess = _a.outputSuccess, outputFail = _a.outputFail;
            output("Updating maps... (this may take a while)");
            (0, files_1.updateMaps)()
                .then(function (changed) {
                Log.info("Maps updated.");
                if (changed) {
                    outputSuccess("Map update completed.");
                    Call.sendMessage("[orange]Maps have been updated. Run [white]/maps[] to view available maps.");
                }
                else {
                    outputSuccess("Map update completed; already up to date.");
                }
            })
                .catch(function (message) {
                outputFail("Map update failed: ".concat(message));
                Log.err("Map updates failed: ".concat(message));
            });
        }
    },
    clearfire: {
        args: [],
        description: "Clears all the fires.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var output = _a.output, outputSuccess = _a.outputSuccess;
            output("Removing fires...");
            var totalRemoved = 0;
            Call.sendMessage("[scarlet][[Fire Department]:[yellow] Fires were reported. Trucks are en-route. Removing all fires shortly.");
            Timer.schedule(function () {
                totalRemoved += Groups.fire.size();
                Groups.fire.each(function (f) { return f.remove(); });
                Groups.fire.clear();
            }, 2, 0.1, 40);
            Timer.schedule(function () {
                outputSuccess("Removed ".concat(totalRemoved, " fires."));
                Call.sendMessage("[scarlet][[Fire Department]:[yellow] We've extinguished ".concat(totalRemoved, " fires."));
            }, 6.1);
        }
    },
    search: {
        args: ["input:string"],
        description: "Searches playerinfo by name, IP, or UUID.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var fishP, info, matches, matches_1, displayMatches;
                var input = _b.args.input, admins = _b.admins, output = _b.output, f = _b.f, sender = _b.sender;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!globals_1.uuidPattern.test(input)) return [3 /*break*/, 1];
                            fishP = players_1.FishPlayer.getById(input);
                            info = admins.getInfoOptional(input);
                            if (fishP == null && info == null)
                                (0, commands_1.fail)(f(templateObject_60 || (templateObject_60 = __makeTemplateObject(["No stored data matched uuid ", "."], ["No stored data matched uuid ", "."])), input));
                            else if (fishP == null && info)
                                output(f(templateObject_61 || (templateObject_61 = __makeTemplateObject(["[accent]Found player info (but no fish player data) for uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""], ["[accent]\\\nFound player info (but no fish player data) for uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""])), input, info.plainLastName(), (0, funcs_1.escapeStringColorsClient)(info.lastName), info.names.map(funcs_1.escapeStringColorsClient).items.join(", "), info.ips.map(function (i) { return "[blue]".concat(i, "[]"); }).toString(", ")));
                            else if (fishP && info)
                                output(f(templateObject_62 || (templateObject_62 = __makeTemplateObject(["[accent]Found fish player data for uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""], ["[accent]\\\nFound fish player data for uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""])), input, fishP.name, (0, funcs_1.escapeStringColorsClient)(info.lastName), info.names.map(funcs_1.escapeStringColorsClient).items.join(", "), info.ips.map(function (i) { return "[blue]".concat(i, "[]"); }).toString(", ")));
                            else
                                (0, commands_1.fail)(f(templateObject_63 || (templateObject_63 = __makeTemplateObject(["Super weird edge case: found fish player data but no player info for uuid ", "."], ["Super weird edge case: found fish player data but no player info for uuid ", "."])), input));
                            return [3 /*break*/, 5];
                        case 1:
                            if (!globals_1.ipPattern.test(input)) return [3 /*break*/, 2];
                            matches = admins.findByIPs(input);
                            if (matches.isEmpty())
                                (0, commands_1.fail)(f(templateObject_64 || (templateObject_64 = __makeTemplateObject(["No stored data matched IP ", ""], ["No stored data matched IP ", ""])), input));
                            output(f(templateObject_65 || (templateObject_65 = __makeTemplateObject(["[accent]Found ", " match", " for search \"", "\"."], ["[accent]Found ", " match", " for search \"", "\"."])), matches.size, matches.size == 1 ? "" : "es", input));
                            matches.each(function (info) { return output(f(templateObject_66 || (templateObject_66 = __makeTemplateObject(["[accent]Player with uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""], ["[accent]\\\nPlayer with uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""])), info.id, info.plainLastName(), (0, funcs_1.escapeStringColorsClient)(info.lastName), info.names.map(funcs_1.escapeStringColorsClient).items.join(", "), info.ips.map(function (i) { return "[blue]".concat(i, "[]"); }).toString(", "))); });
                            return [3 /*break*/, 5];
                        case 2:
                            matches_1 = Vars.netServer.admins.searchNames(input);
                            if (matches_1.isEmpty())
                                (0, commands_1.fail)(f(templateObject_67 || (templateObject_67 = __makeTemplateObject(["No stored data matched name ", ""], ["No stored data matched name ", ""])), input));
                            output(f(templateObject_68 || (templateObject_68 = __makeTemplateObject(["[accent]Found ", " match", " for search \"", "\"."], ["[accent]Found ", " match", " for search \"", "\"."])), matches_1.size, matches_1.size == 1 ? "" : "es", input));
                            displayMatches = function () {
                                matches_1.each(function (info) { return output(f(templateObject_69 || (templateObject_69 = __makeTemplateObject(["[accent]Player with uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""], ["[accent]\\\nPlayer with uuid ", "\nLast name used: \"", "\" [gray](", ")[] [[", "]\nIPs used: ", ""])), info.id, info.plainLastName(), (0, funcs_1.escapeStringColorsClient)(info.lastName), info.names.map(funcs_1.escapeStringColorsClient).items.join(", "), info.ips.map(function (i) { return "[blue]".concat(i, "[]"); }).toString(", "))); });
                            };
                            if (!(matches_1.size > 20)) return [3 /*break*/, 4];
                            return [4 /*yield*/, menus_1.Menu.confirm(sender, "Are you sure you want to view all ".concat(matches_1.size, " matches?"))];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            displayMatches();
                            _c.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
    },
    peace: {
        args: ["peace:boolean"],
        description: "Toggles peaceful mode for sandbox.",
        perm: commands_1.Perm.mod,
        requirements: [commands_1.Req.mode('sandbox')],
        handler: function (_a) {
            var args = _a.args;
            if (args.peace) {
                globals_1.fishState.peacefulMode = true;
                Groups.player.each(function (p) {
                    if (p.team() != Vars.state.rules.defaultTeam) {
                        p.team(Vars.state.rules.defaultTeam);
                    }
                });
                Call.sendMessage("[[Sandbox] [green]Enabled peaceful mode.");
            }
            else {
                globals_1.fishState.peacefulMode = false;
                Call.sendMessage("[[Sandbox] [red]Disabled peaceful mode.");
            }
        },
    },
    effects: {
        args: ["mode:string", "player:player?", "duration:time?"],
        description: "Applies effects to a player's unit.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var _b, _c, _d;
            var args = _a.args, sender = _a.sender, f = _a.f, outputSuccess = _a.outputSuccess;
            if ((_b = args.player) === null || _b === void 0 ? void 0 : _b.hasPerm("blockTrolling"))
                (0, commands_1.fail)(f(templateObject_70 || (templateObject_70 = __makeTemplateObject(["Player ", " is insufficiently trollable."], ["Player ", " is insufficiently trollable."])), args.player));
            if (args.player && !sender.canModerate(args.player, false))
                (0, commands_1.fail)("You do not have permission to perform moderation actions on this player.");
            var target = (_c = args.player) !== null && _c !== void 0 ? _c : sender;
            var unit = target.unit();
            if (!unit || unit.dead)
                (0, commands_1.fail)(f(templateObject_71 || (templateObject_71 = __makeTemplateObject(["", "'s unit is dead."], ["", "'s unit is dead."])), target));
            var ticks = ((_d = args.duration) !== null && _d !== void 0 ? _d : 1e12) / 1000 * 60;
            (0, utils_1.applyEffectMode)(args.mode, unit, ticks);
            outputSuccess("".concat(args.mode === "clear" ? "Cleared" : "Applied", " effects."));
            if (!config_1.Gamemode.sandbox())
                (0, utils_1.logAction)("applied **".concat(args.mode, "** effects to"), sender, target);
        }
    },
    items: {
        args: ["team:team", "item:item", "amount:number"],
        description: "Gives items to a team.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var _b;
            var _c = _a.args, team = _c.team, item = _c.item, amount = _c.amount, sender = _a.sender, outputSuccess = _a.outputSuccess, f = _a.f;
            var core = (_b = team.data().cores.firstOpt()) !== null && _b !== void 0 ? _b : (0, commands_1.fail)(f(templateObject_72 || (templateObject_72 = __makeTemplateObject(["Team ", " has no cores."], ["Team ", " has no cores."])), team));
            core.items.add(item, amount);
            outputSuccess(f(templateObject_73 || (templateObject_73 = __makeTemplateObject(["Gave ", " ", " to ", "."], ["Gave ", " ", " to ", "."])), amount, item, team));
            if (!config_1.Gamemode.sandbox())
                (0, utils_1.logAction)("gave items to ".concat(team.name), sender);
        }
    },
    explosion: {
        args: ["radius:number", "x:number", "y:number", "team:team?", "damage:number?", "damageMode:string?"],
        description: "Causes an explosion at specified coordinates.",
        perm: commands_1.Perm.admin,
        handler: function (_a) {
            var _b;
            var _c = _a.args, radius = _c.radius, x = _c.x, y = _c.y, _d = _c.team, team = _d === void 0 ? Team.derelict : _d, _e = _c.damage, damage = _e === void 0 ? 1e12 : _e, _f = _c.damageMode, damageMode = _f === void 0 ? "both" : _f, outputSuccess = _a.outputSuccess;
            var _g = __read((_b = (0, utils_1.match)(damageMode, {
                air: [true, false],
                ground: [false, true],
                both: [true, true],
                none: [false, false],
            })) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("Valid values of damageMode: air, ground, both, none"), 2), air = _g[0], ground = _g[1];
            if (radius > 100)
                (0, commands_1.fail)("Maximum radius is 100");
            if (damage < 0)
                Call.effect(Fx.dynamicSpikes, x * 8, y * 8, radius * 8, Pal.heal);
            else
                Call.effect(Fx.dynamicExplosion, x * 8, y * 8, Math.max(radius, 8) / 7, Color.white);
            Damage.damage(team, x * 8, y * 8, radius * 8, damage, true, air, ground);
            outputSuccess("Created an explosion at (".concat(x, ", ").concat(y, ")."));
        }
    }
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26, templateObject_27, templateObject_28, templateObject_29, templateObject_30, templateObject_31, templateObject_32, templateObject_33, templateObject_34, templateObject_35, templateObject_36, templateObject_37, templateObject_38, templateObject_39, templateObject_40, templateObject_41, templateObject_42, templateObject_43, templateObject_44, templateObject_45, templateObject_46, templateObject_47, templateObject_48, templateObject_49, templateObject_50, templateObject_51, templateObject_52, templateObject_53, templateObject_54, templateObject_55, templateObject_56, templateObject_57, templateObject_58, templateObject_59, templateObject_60, templateObject_61, templateObject_62, templateObject_63, templateObject_64, templateObject_65, templateObject_66, templateObject_67, templateObject_68, templateObject_69, templateObject_70, templateObject_71, templateObject_72, templateObject_73;
