"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = command;
exports.registerConsole = registerConsole;
var perm_1 = require("/frameworks/commands/perm");
var requirements_1 = require("/frameworks/commands/requirements");
var players_1 = require("/players");
function command(name, perm, callback) {
    var builder = {
        "~name": name,
        "~perm": perm,
        description: function (desc) {
            this["~description"] = desc;
            return this;
        },
        target: function () {
            var targets = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                targets[_i] = arguments[_i];
            }
            var _this = this;
            _this["~targets"] = targets;
            return _this;
        },
        misc: function (_a) {
            var customUnauthorizedMessage = _a.customUnauthorizedMessage, hidden = _a.hidden;
            this["~customUnauthorizedMessage"] = customUnauthorizedMessage;
            this["~isHidden"] = hidden;
            return this;
        },
        data: function (data) {
            var _this = this;
            _this["~data"] = data;
            return _this;
        },
        init: function (func) {
            this["~init"] = func;
            return this;
        },
        args: function (args) {
            if (args === void 0) { args = {}; }
            this["~args"] = new Map(Object.entries(args).map(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return [k,
                    typeof v == "string" ? {
                        name: k, type: v.endsWith("?") ? v.slice(0, -1) : v, isOptional: v.endsWith("?")
                    } : __assign({ name: k }, v)
                ];
            }));
            return this;
        },
        requirements: function () {
            var requirements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                requirements[_i] = arguments[_i];
            }
            this["~requirements"] = requirements;
            return this;
        },
        tapped: function (handler) {
            this["~tapped"] = handler;
            return this;
        },
        handler: function (handler) {
            var _a, _b;
            this["~handler"] = handler;
            var data = {
                name: this["~name"],
                args: (_a = this["~args"]) !== null && _a !== void 0 ? _a : new Map(),
                targets: (_b = this["~targets"]) !== null && _b !== void 0 ? _b : ["ingame"],
                description: this["~description"],
                handler: this["~handler"],
                perm: this["~perm"],
                customUnauthorizedMessage: this["~customUnauthorizedMessage"],
                isHidden: this["~isHidden"],
                data: this["~data"],
                init: this["~init"],
                requirements: this["~requirements"],
                tapped: this["~tapped"],
            };
            if (data.targets.includes("ingame"))
                register(data);
            if (data.targets.includes("console"))
                registerConsole(data);
            return data;
        },
    };
    return builder;
}
/**
 * Registers one command to a client command handler.
 **/
function register(command) {
    var clientHandler = Vars.netServer.clientCommands;
    var serverHandler = ServerControl.instance.handler;
    var name = command.name;
    clientHandler.removeCommand(name); //The function silently fails if the argument doesn't exist so this is safe
    clientHandler.register(name, convertArgs(command.args, true), command.description, 
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    new CommandHandler.CommandRunner({ accept: function (unjoinedRawArgs, sender) {
            return __awaiter(this, void 0, void 0, function () {
                var fishSender, rawArgs, resolvedArgs, err_1, shouldClearCopy, shouldClearPlayers, usageData, failed, args_1, requirements, err_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!initialized)
                                crash("Commands not initialized!");
                            fishSender = players_1.FishPlayer.get(sender);
                            players_1.FishPlayer.onPlayerCommand(fishSender, name, unjoinedRawArgs);
                            //Verify authorization
                            //as a bonus, this crashes if data.perm is undefined
                            if (!command.perm.check(fishSender)) {
                                if (command.customUnauthorizedMessage) {
                                    outputFail(command.customUnauthorizedMessage, sender);
                                    FishEvents.fire("commandUnauthorized", [fishSender, name]);
                                }
                                else if (command.isHidden)
                                    outputMessage(hiddenUnauthorizedMessage, sender);
                                else
                                    outputFail(command.perm.unauthorizedMessage, sender);
                                return [2 /*return*/];
                            }
                            rawArgs = joinArgs(unjoinedRawArgs);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, processArgs(rawArgs, command, fishSender, name)];
                        case 2:
                            resolvedArgs = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _b.sent();
                            handleError(err_1, fishSender, outputFail, "".concat(fishSender.cleanedName, " ran /").concat(name));
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
                                data: command.data,
                                outputFail: function (message) { outputFail(message, sender); failed = true; },
                                outputSuccess: function (message) { return outputSuccess(message, sender); },
                                output: function (message) { return outputMessage(message, sender); },
                                f: f_client,
                                execServer: function (command) { return serverHandler.handleMessage(command); },
                                admins: Vars.netServer.admins,
                                lastUsedSender: usageData.lastUsed,
                                lastUsedSuccessfullySender: usageData.lastUsedSuccessfully,
                                lastUsedSuccessfully: ((_a = globalUsageData[name]) !== null && _a !== void 0 ? _a : (globalUsageData[name] = { lastUsed: -1, lastUsedSuccessfully: -1 })).lastUsedSuccessfully,
                                allCommands: allCommands,
                                currentTapMode: fishSender.tapInfo.commandName == null ? "off" : fishSender.tapInfo.mode,
                                handleTaps: function (mode) {
                                    if (command.tapped == undefined)
                                        crash("No tap handler to activate: command \"".concat(name, "\""));
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
                            requirements = command.requirements;
                            requirements === null || requirements === void 0 ? void 0 : requirements.forEach(function (r) { return r(args_1); });
                            return [4 /*yield*/, command.handler(args_1)];
                        case 6:
                            _b.sent();
                            //Update usage data
                            if (!failed) {
                                usageData.lastUsedSuccessfully = globalUsageData[name].lastUsedSuccessfully = Date.now();
                            }
                            return [3 /*break*/, 9];
                        case 7:
                            err_2 = _b.sent();
                            handleError(err_2, fishSender, outputFail, "".concat(fishSender.cleanedName, " ran /").concat(name));
                            return [3 /*break*/, 9];
                        case 8:
                            usageData.lastUsed = globalUsageData[name].lastUsed = Date.now();
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        } }));
    allCommands[name] = command;
}
function registerConsole(command) {
    //todo
}
command("unpause", perm_1.Perm.trusted)
    .description("Unpauses the game.")
    .data({ unpaused: false })
    .init(function (data) {
    Events.on(EventType.PlayEvent, function () {
        if (data.unpaused) {
            data.unpaused = false;
            Vars.state.rules.pvpAutoPause = true;
        }
    });
})
    .args()
    .requirements(requirements_1.Req.mode("pvp"))
    .handler(function (_a) {
    var data = _a.data, sender = _a.sender, outputSuccess = _a.outputSuccess;
    Vars.state.rules.pvpAutoPause = false;
    data.unpaused = true;
    Core.app.post(function () { return Vars.state.set(GameState.State.playing); });
    outputSuccess("Unpaused.");
});
// command("spectate", Perm.play, cmd => {
// 	/** Mapping between player and original team */
// 	const spectators = new Map<FishPlayer, Team>();
// 	function spectate(target:FishPlayer){
// 		spectators.set(target, target.team());
// 		target.forceRespawn();
// 		target.setTeam(Team.derelict);
// 		target.forceRespawn();
// 	}
// 	function resume(target:FishPlayer){
// 		if(spectators.get(target) == null) return; // this state is possible for a person who left not in spectate
// 		target.setTeam(spectators.get(target)!);
// 		spectators.delete(target);
// 		target.forceRespawn();
// 	}
// 	Events.on(EventType.GameOverEvent, () => spectators.clear());
// 	Events.on(EventType.PlayerLeave, ({player}:{player:mindustryPlayer}) => resume(FishPlayer.get(player)));
// 	cmd
// 		.description("Toggles spectator mode in PVP games.")
// 		.args({ target: Arg.player().optional() })
// 		.requirements(Req.gameRunning)
// 		.handler(({sender, args: {target = sender}, outputSuccess, f}) => {
// 			if(!Gamemode.pvp() && !sender.hasPerm("mod")) fail(`You do not have permission to spectate on a non-pvp server.`);
// 			if(target !== sender && target.hasPerm("blockTrolling")) fail(`Target player is insufficiently trollable.`);
// 			if(target !== sender && !sender.ranksAtLeast("admin")) fail(`You do not have permission to force other players to spectate.`);
// 			if(spectators.has(target)){
// 				resume(target);
// 				outputSuccess(target == sender
// 					? f`Rejoining game as team ${target.team()}.`
// 					: f`Forced ${target} out of spectator mode.`
// 				);
// 			} else {
// 				spectate(target);
// 				outputSuccess(target == sender
// 					? f`Now spectating. Run /spectate again to resume gameplay.`
// 					: f`Forced ${target} into spectator mode.`)
// 				;
// 			}
// 		});
// });
