"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains automatic moderation and antibot code.
*/
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heuristics = exports.Automod = exports.Antibot = exports.lastVKActions = exports.votekickActionRate = exports.globalSusChat = void 0;
exports.checkVPNAndJoins = checkVPNAndJoins;
var api = __importStar(require("/api"));
var utils_1 = require("/utils");
var funcs_1 = require("/funcs");
var players_1 = require("/players");
var config_1 = require("/config");
var globals_1 = require("/globals");
var menus_1 = require("/frameworks/menus");
exports.globalSusChat = new Ratekeeper();
exports.votekickActionRate = new Ratekeeper();
exports.lastVKActions = [];
Events.on(EventType.PlayerChatEvent, function (_a) {
    var player = _a.player, message = _a.message;
    var fishP = players_1.FishPlayer.get(player);
    if (message.trim().toLowerCase().startsWith("/vote y") || message.startsWith("/votekick ")) {
        checkVotekickAction(fishP, message);
    }
    if (!message.startsWith("/") || message.startsWith("/t")) {
        checkChatMessage(fishP);
    }
});
exports.Antibot = {
    antibotExpires: -1,
    kickNewPlayersExpires: -1,
    lastAntibotReason: "",
    connectRate: new Ratekeeper(),
    autoflagRate: new Ratekeeper(),
    antiBotMode: function () {
        return Date.now() < this.antibotExpires;
    },
    shouldKickNewPlayers: function () {
        return false;
    },
    shouldWhackFlaggedPlayers: function () {
        return Date.now() < this.antibotExpires;
    },
    whackFlaggedPlayers: function () {
        players_1.FishPlayer.forEachPlayer(function (p) {
            if (p.ipDetectedVpn && p.suspicionLevel() == 3) {
                Vars.netServer.admins.blacklistDos(p.ip());
                try {
                    Vars.netServer.admins.blacklistDos(p.con().connection.getRemoteAddressUDP().getAddress().getHostAddress());
                }
                catch (_a) { }
                Log.info("&yAntibot killed connection ".concat(p.ip(), " due to flagged while under attack"));
                p.player.kick(Packets.KickReason.banned, 10000000);
            }
        });
    },
    triggerAntibot: function (duration, reason, category, kickNewPlayers, pingConsole) {
        if (pingConsole === void 0) { pingConsole = false; }
        if (category == "automatic") {
            //Ping reports based on time
            var message = void 0;
            if (Date.now() - this.antibotExpires > funcs_1.Duration.hours(1))
                message = "!!! ".concat(config_1.text.reportsPing, " Possible ongoing bot attack in **").concat(config_1.Gamemode.name(), "**  Reason: ").concat((0, funcs_1.escapeTextDiscord)(reason));
            else if (Date.now() - this.antibotExpires > funcs_1.Duration.minutes(10))
                message = "!!! Possible ongoing bot attack in **".concat(config_1.Gamemode.name(), "**  Reason: ").concat((0, funcs_1.escapeTextDiscord)(reason));
            if (message)
                api.sendModerationMessage(pingConsole ? message + " <@&1096094397625532558>" : message);
        }
        if (Date.now() > this.antibotExpires || reason != this.lastAntibotReason)
            Log.info("&yAntibot triggered: ".concat((0, funcs_1.escapeStringColorsServer)(reason)));
        this.antibotExpires = Math.max(this.antibotExpires, Date.now() + duration);
        if (kickNewPlayers)
            this.kickNewPlayersExpires = Date.now() + 8000;
        this.lastAntibotReason = reason;
        if (this.shouldWhackFlaggedPlayers())
            this.whackFlaggedPlayers();
    }
};
function checkVotekickAction(fishP, message) {
    var e_1, _a, e_2, _b, e_3, _c;
    var _d, _e;
    var sus = fishP.suspicionLevel();
    var timeSinceJoin = Date.now() - fishP.lastJoined;
    var target;
    if (message.startsWith("/votekick")) {
        var id = Number((_d = message.split(" ")[1]) === null || _d === void 0 ? void 0 : _d.split("#")[1]);
        if (isNaN(id))
            return;
        target = Groups.player.getByID(id);
        if (!target)
            return; //invalid votekick command, harmless
    }
    else { //TODO these "harmless" actions could be indications of a malfunctioning vkbot and should be logged if they repeat a lot (eg more than 5 times per minute)
        if (!Vars.netServer.currentlyKicking)
            return; //nobody to votekick, harmless
        target = Reflect.get(Vars.netServer.currentlyKicking, "target");
    }
    var targetSusLevel = players_1.FishPlayer.get(target).suspicionLevel();
    //Evaluate if this action should be blocked
    if (sus <= 1)
        return;
    var reason = undefined;
    if (!exports.votekickActionRate.allow(108000, 8))
        reason = "Exceeded 8 votekick actions in the last 2 minutes";
    else if (sus == 3 && exports.lastVKActions.find(function (a) { return Date.now() - a.time < 10000 && a.playerSusLevel == 3; }) && timeSinceJoin < 6000)
        reason = "Performed votekick within 6 seconds of joining and there was a recent suspicious vote";
    else if (sus == 3 && timeSinceJoin < 80000 && exports.lastVKActions.find(function (a) { return a.player == fishP; }) && targetSusLevel <= 1)
        reason = "Two votekick actions within 80 seconds of joining and the target is not suspicious";
    else if (sus >= 2 && exports.lastVKActions.filter(function (a) { return a.playerSusLevel == 3 && Date.now() - a.time < 33000; }).length >= 3)
        reason = "More than 3 recent votekick actions by suspicious players";
    else if (sus >= 2 && exports.lastVKActions.filter(function (a) { return a.playerSusLevel >= 2; }).length >= 6 && exports.lastVKActions.filter(function (a) { return a.player == fishP; }).length >= 3)
        reason = "More than 6 slightly suspicious votekick actions within the past 20 minutes and this player has already performed 3 of them";
    if (reason != undefined) {
        //Should we ban everyone?
        var suspiciousActions = exports.lastVKActions.filter(function (action) {
            return (action.playerSusLevel == 3 || (action.targetSusLevel <= 2 && action.playerSusLevel >= 2) || action.player == fishP) && Date.now() - action.time < 78000;
        });
        if (suspiciousActions.length >= 3) {
            //Ban everyone
            var playersToBan = suspiciousActions.map(function (a) { return a.player; }).reduce(function (map, p) {
                var _a;
                map.set(p, ((_a = map.get(p)) !== null && _a !== void 0 ? _a : 0) + 1);
                return map;
            }, new Map());
            //Only ban players that appeared in the list twice or are high suslevel
            var admins = Vars.netServer.admins;
            try {
                for (var playersToBan_1 = __values(playersToBan), playersToBan_1_1 = playersToBan_1.next(); !playersToBan_1_1.done; playersToBan_1_1 = playersToBan_1.next()) {
                    var _f = __read(playersToBan_1_1.value, 2), p = _f[0], times = _f[1];
                    if (p.suspicionLevel() == 3 || p.suspicionLevel() == 2 && times > 1) {
                        admins.banPlayerID(p.uuid);
                        admins.bannedIPs.add(p.ip());
                        api.ban({ ip: p.ip(), uuid: p.uuid });
                        (0, utils_1.logHTrip)(p, "votekick abuse", (p == fishP ? "Player banned automatically" : "Player banned automatically based on previous activity") +
                            ". Trigger reason: ".concat(reason));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (playersToBan_1_1 && !playersToBan_1_1.done && (_a = playersToBan_1.return)) _a.call(playersToBan_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            (0, utils_1.updateBans)(function (player) { return "[scarlet]Player [yellow]".concat(player.name, "[scarlet] has been whacked automatically for suspected votekick abuse."); });
            //Pardon most of the votekick targets (the ones that weren't voted on by a non-sus player)
            var candidatePardons = new Set(exports.lastVKActions.map(function (a) { return a.target; }));
            try {
                for (var lastVKActions_1 = __values(exports.lastVKActions), lastVKActions_1_1 = lastVKActions_1.next(); !lastVKActions_1_1.done; lastVKActions_1_1 = lastVKActions_1.next()) {
                    var action = lastVKActions_1_1.value;
                    if (action.playerSusLevel <= 1)
                        candidatePardons.delete(action.target);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (lastVKActions_1_1 && !lastVKActions_1_1.done && (_b = lastVKActions_1.return)) _b.call(lastVKActions_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var playersToPardon = __spreadArray([], __read(candidatePardons), false).map(players_1.FishPlayer.get);
            try {
                //Don't pardon players with suslevel 3
                for (var playersToPardon_1 = __values(playersToPardon), playersToPardon_1_1 = playersToPardon_1.next(); !playersToPardon_1_1.done; playersToPardon_1_1 = playersToPardon_1.next()) {
                    var p = playersToPardon_1_1.value;
                    if (!p.isSuspicious("high")) {
                        p.info().lastKicked = 0;
                        admins.kickedIPs.remove(p.ip());
                        Log.info("Pardoned player @ (@/@)", p.name, p.uuid, p.ip());
                        (0, utils_1.logAction)("pardoned", "automod", p, "kicked by suspected votekick bot");
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (playersToPardon_1_1 && !playersToPardon_1_1.done && (_c = playersToPardon_1.return)) _c.call(playersToPardon_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        else {
            //Just kick the player
            (0, utils_1.logHTrip)(fishP, "votekick abuse", "sus=".concat(sus));
            fishP.kick("You have been kicked [accent]automatically[] due to suspicious behavior. Please wait [accent]35[] seconds before rejoining.", 30000);
            Call.sendMessage("[scarlet]Player [yellow]".concat(fishP.prefixedName, "[scarlet] was kicked due to suspected votekick abuse."));
            //If this message is going to start a votekick, cancel it
            if (message.startsWith("/votekick") && Vars.netServer.currentlyKicking == null)
                Core.app.post(function () {
                    Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.name, "[lightgray].[accent] (-\u221E/").concat(Vars.netServer.votesRequired(), ")\n\t[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff."));
                    if (Vars.netServer.currentlyKicking)
                        Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
                    Vars.netServer.currentlyKicking = null;
                });
            //If there is an ongoing votekick and the initiator is suspicious, cancel that
            else if (((_e = exports.lastVKActions.slice().reverse().find(function (a) { return a.type == "start"; })) === null || _e === void 0 ? void 0 : _e.playerSusLevel) == 3) {
                Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.name, "[lightgray].[accent] (-\u221E/").concat(Vars.netServer.votesRequired(), ")\n\t[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff."));
                if (Vars.netServer.currentlyKicking)
                    Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
                Vars.netServer.currentlyKicking = null;
            }
            //Otherwise, revoke the vote
            else
                Core.app.post(function () {
                    if (Vars.netServer.currentlyKicking) {
                        var votes = Reflect.get(Vars.netServer.currentlyKicking, "votes") - 1;
                        Reflect.set(Vars.netServer.currentlyKicking, "votes", votes);
                        var voted = Reflect.get(Vars.netServer.currentlyKicking, "voted");
                        voted.put(fishP.uuid, 0);
                        voted.put(fishP.ip(), 0);
                        Call.sendMessage("[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff.");
                    }
                });
        }
    }
    //Update state to catch future actions
    exports.lastVKActions.push({
        player: fishP,
        playerSusLevel: sus,
        target: target,
        targetSusLevel: targetSusLevel,
        time: Date.now(),
        type: message.startsWith("/votekick") ? "start" : "vote y",
        reason: message.startsWith("/votekick") ? message.split(" ").slice(2).join(" ") : undefined
    });
    exports.lastVKActions.splice.apply(exports.lastVKActions, __spreadArray([0, exports.lastVKActions.length], __read(exports.lastVKActions.filter(function (a) { return Date.now() - a.time < funcs_1.Duration.minutes(10); })), false));
}
function checkChatMessage(fishP) {
    var susLevel = fishP.suspicionLevel();
    if (!fishP.chatSpam.allow(14300, susLevel == 3 ? 3 : susLevel == 2 ? 5 : 30)) {
        if (susLevel == 3 || Date.now() > fishP.kickForSpamAt) {
            fishP.kick("You have been kicked for spamming.", 30000);
            if (exports.Antibot.antiBotMode())
                Vars.netServer.admins.blacklistDos(fishP.ip());
        }
        else {
            fishP.sendMessage("[scarlet]You are sending chat messages too quickly.");
            fishP.kickForSpamAt = Date.now() + 3000;
        }
    }
    if (susLevel >= 2 && !exports.globalSusChat.allow(30000, 20)) {
        exports.Antibot.triggerAntibot(funcs_1.Duration.minutes(2), "too many chat messages", "automatic", true);
    }
}
function checkVPNAndJoins(fishP) {
    var ip = fishP.ip();
    var info = fishP.info();
    api.isVpn(ip, function (isVpn) {
        if (isVpn) {
            Log.warn("IP ".concat(ip, " was flagged as VPN. Flag rate: ").concat(players_1.FishPlayer.stats.numIpsFlagged, "/").concat(players_1.FishPlayer.stats.numIpsChecked, " (").concat(100 * players_1.FishPlayer.stats.numIpsFlagged / players_1.FishPlayer.stats.numIpsChecked, "%)"));
            fishP.ipDetectedVpn = true;
            if (!exports.Antibot.autoflagRate.allow(30000, 5)) {
                exports.Antibot.triggerAntibot(funcs_1.Duration.minutes(3), "rate of flagged IPs exceeded 5 / 30s", "automatic", false);
                return;
            }
            if ((info.timesJoined <= 1 || (exports.Antibot.autoflagRate.occurences > 3 && info.timesJoined <= 10)) //is this smart?
                && !fishP.ranksAtLeast("active")
                && exports.Automod.shouldAutoflag()) {
                fishP.autoflagged = true;
                if (fishP.connected())
                    fishP.stopUnit();
                fishP.updateName();
                if (exports.Antibot.shouldWhackFlaggedPlayers()) {
                    exports.Antibot.whackFlaggedPlayers(); //calls whack all flagged players
                }
                else {
                    (0, utils_1.logAction)("autoflagged", "AntiVPN", fishP);
                    void api.sendStaffMessage("Autoflagged player ".concat(fishP.cleanedName, "[cyan] for suspected vpn!"), "AntiVPN", true);
                    if (!exports.Antibot.antiBotMode())
                        players_1.FishPlayer.messageStaff("[yellow]WARNING:[scarlet] player [cyan]\"".concat(fishP.prefixedName, "[cyan]\"[yellow] is new (").concat(info.timesJoined - 1, " joins) and using a vpn. Unless there is an ongoing griefer raid, they are most likely innocent. Free them with /free."));
                    Log.warn("Player ".concat(fishP.cleanedName, " (").concat(fishP.uuid, ") was autoflagged."));
                    if (fishP.connected())
                        void menus_1.Menu.buttons(fishP, "[gold]Welcome to Fish Community!", "[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ".concat(config_1.FColor.discord(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Join our Discord"], ["Join our Discord"]))), " to request a staff member come online if none are on."), [[
                                { data: "Close", text: "Close" },
                                { data: "Discord", text: config_1.FColor.discord("Discord") },
                            ]]).then(function (option) {
                            if (option == "Discord") {
                                Call.openURI(fishP.con(), config_1.text.discordURL);
                            }
                        });
                    fishP.sendMessage("[gold]Welcome to Fish Community!\n[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ".concat(config_1.FColor.discord(templateObject_2 || (templateObject_2 = __makeTemplateObject(["Join our Discord"], ["Join our Discord"]))), " to request a staff member come online if none are on."));
                }
            }
            else if (info.timesJoined < 5) {
                players_1.FishPlayer.messageStaff("[yellow]WARNING:[scarlet] player [cyan]\"".concat(fishP.prefixedName, "[cyan]\"[yellow] is new (").concat(info.timesJoined - 1, " joins) and using a vpn."));
            }
        }
        else {
            if (info.timesJoined == 1) {
                players_1.FishPlayer.messageTrusted("[yellow]Player \"".concat(fishP.prefixedName, "[yellow]\" is on first join."));
            }
        }
        if (info.timesJoined == 1) {
            var message = "&lrNew player joined: &c".concat(fishP.cleanedName, "&lr (&c").concat(fishP.uuid, "&lr/&c").concat(ip, "&lr)");
            //Add BEL, this causes an audible noise
            if (globals_1.fishState.joinBell)
                message += '\x07';
            Log.info(message);
        }
    }, function (err) {
        Log.err("Error while checking for VPN status of ip ".concat(ip, "!"));
        Log.err(err);
    });
}
var easterEggVotekickTarget = null;
function validateVotekickSession() {
    var _a;
    if (!Vars.netServer.currentlyKicking)
        return;
    var target = players_1.FishPlayer.get(Reflect.get(Vars.netServer.currentlyKicking, "target"));
    var voted = Reflect.get(Vars.netServer.currentlyKicking, "voted");
    if (voted.size == 2) {
        //Try to find the UUID of the initiator
        var uuid_1 = null;
        voted.entries().toArray().each(function (e) {
            if (globals_1.uuidPattern.test(e.key))
                uuid_1 = e.key;
        });
        if (uuid_1) {
            var initiator = players_1.FishPlayer.getById(uuid_1);
            if (initiator === null || initiator === void 0 ? void 0 : initiator.stelled()) {
                if (initiator.hasPerm("bypassVotekick")) {
                    if (target !== easterEggVotekickTarget) {
                        easterEggVotekickTarget = target;
                        var msg = (_a = (new Error()).stack) === null || _a === void 0 ? void 0 : _a.split("\n").slice(0, 4).join("\n");
                        Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(initiator.prefixedName, "[lightgray].[accent] (\u221E/").concat(Vars.netServer.votesRequired(), ")\n[scarlet]Error: failed to kick player ").concat(initiator.prefixedName, "[scarlet]\n").concat(msg, "\n[scarlet]Error: failed to cancel votekick\n").concat(msg));
                    }
                    return;
                }
                Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(initiator.prefixedName, "[lightgray].[accent] (\u221E/").concat(Vars.netServer.votesRequired(), ")\n[scarlet]Vote passed."));
                initiator.kick("You are not allowed to votekick other players while marked.", 2);
                Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
                Vars.netServer.currentlyKicking = null;
                return;
            }
            else if ((initiator === null || initiator === void 0 ? void 0 : initiator.hasPerm("immediatelyVotekickNewPlayers")) && target.isSuspicious("high")) {
                Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.prefixedName, "[lightgray].[accent] (").concat(Vars.netServer.votesRequired(), "/").concat(Vars.netServer.votesRequired(), ")\n[scarlet]Vote passed."));
                target.kick(Packets.KickReason.vote, funcs_1.Duration.minutes(30));
                Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
                Vars.netServer.currentlyKicking = null;
                return;
            }
            else if (target.isSuspicious("high") && !target.hasPerm("bypassVotekick")) {
                //Increase votes by 1, from 1 to 2
                Reflect.set(Vars.netServer.currentlyKicking, "votes", Packages.java.lang.Integer(2));
                voted.put("__server__", 1);
                Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.prefixedName, "[lightgray].[accent] (2/").concat(Vars.netServer.votesRequired(), ")\n[lightgray]Type[orange] /vote <y/n>[] to agree."));
                return;
            }
        }
    }
    if (target.hasPerm("bypassVotekick")) {
        Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.prefixedName, "[lightgray].[accent] (-\u221E/").concat(Vars.netServer.votesRequired(), ")\n[scarlet]Vote cancelled."));
        Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
        Vars.netServer.currentlyKicking = null;
    }
    else if (target.ranksAtLeast("trusted") && Groups.player.size() > 4 && voted.get("__server__") == 0) {
        //decrease votes by two, goes from 1 to negative 1
        Reflect.set(Vars.netServer.currentlyKicking, "votes", Packages.java.lang.Integer(-1));
        voted.put("__server__", -2);
        Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.prefixedName, "[lightgray].[accent] (-1/").concat(Vars.netServer.votesRequired(), ")\n[lightgray]Type[orange] /vote <y/n>[] to agree."));
    }
}
Timer.schedule(validateVotekickSession, 1, 0.3);
exports.Automod = {
    /**
     * List of IPs that were recently punished.
     * If a new account joins from one of these IPs,
     * we assume they are trying to evade the punishment
     * and the IP gets banned.
     */
    punishedIPs: [],
    updatePunishedIPs: function () {
        for (var i = 0; i < this.punishedIPs.length; i++) {
            if (this.punishedIPs[i][2] < Date.now()) {
                this.punishedIPs.splice(i, 1);
            }
        }
    },
    checkAntiEvasion: function (fishP) {
        var e_4, _a;
        var _b, _c;
        this.updatePunishedIPs();
        try {
            for (var _d = __values(this.punishedIPs), _e = _d.next(); !_e.done; _e = _d.next()) {
                var _f = __read(_e.value, 2), ip = _f[0], uuid = _f[1];
                if (ip == fishP.ip() && uuid != fishP.uuid && !fishP.ranksAtLeast("mod")) {
                    api.sendModerationMessage("Automatically banned player `".concat(fishP.cleanedName, "` (`").concat(fishP.uuid, "`/`").concat(fishP.ip(), "`) for suspected punishment evasion.\n\tPreviously used UUID `").concat(uuid, "`(").concat((_b = Vars.netServer.admins.getInfoOptional(uuid)) === null || _b === void 0 ? void 0 : _b.plainLastName(), "), currently using UUID `").concat(fishP.uuid, "` from the same IP address."));
                    Log.warn("&yAutomatically banned player &b".concat(fishP.cleanedName, "&y (&b").concat(fishP.uuid, "&y/&b").concat(fishP.ip(), "&y) for suspected punishment evasion.\n\t&yPreviously used UUID &b").concat(uuid, "&y(&b").concat((_c = Vars.netServer.admins.getInfoOptional(uuid)) === null || _c === void 0 ? void 0 : _c.plainLastName(), "&y), currently using UUID &b").concat(fishP.uuid, "&y from the same IP address."));
                    players_1.FishPlayer.messageStaff("[yellow]Automatically banned player [white]".concat(fishP.name, "[yellow] for suspected punishment evasion."));
                    Vars.netServer.admins.bannedIPs.add(ip);
                    api.ban({ ip: ip, uuid: uuid });
                    fishP.kick(Packets.KickReason.banned);
                    return false;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return true;
    },
    shouldAutoflag: function () {
        return this.punishedIPs.length > 0;
    },
    removePunishedIP: function (target) {
        var ipIndex;
        if ((ipIndex = this.punishedIPs.findIndex(function (_a) {
            var _b = __read(_a, 1), ip = _b[0];
            return ip == target;
        })) != -1) {
            this.punishedIPs.splice(ipIndex, 1);
            return true;
        }
        else
            return false;
    },
    removePunishedUUID: function (target) {
        var uuidIndex;
        if ((uuidIndex = this.punishedIPs.findIndex(function (_a) {
            var _b = __read(_a, 2), uuid = _b[1];
            return uuid == target;
        })) != -1) {
            this.punishedIPs.splice(uuidIndex, 1);
            return true;
        }
        else
            return false;
    }
};
exports.Heuristics = {
    chatSpam: new Ratekeeper(),
    chatSpamSlow: new Ratekeeper(),
    activateHeuristics: function (fishP) {
        var _this = this;
        if (config_1.Gamemode.hexed() || config_1.Gamemode.sandbox() || config_1.Gamemode.testsrv())
            return;
        //Blocks broken check
        if (fishP.joinsLessThan(5)) {
            var tripped_1 = false;
            fishP.tstats.blocksBroken = 0;
            Timer.schedule(function () {
                if (fishP.connected() && !tripped_1) {
                    var limit = fishP.firstJoin() && exports.Antibot.antiBotMode() ?
                        Date.now() < exports.Antibot.kickNewPlayersExpires + 30000 ? 1 : 25
                        : config_1.heuristics.blocksBrokenAfterJoin;
                    if (fishP.tstats.blocksBroken > limit) {
                        tripped_1 = true;
                        (0, utils_1.logHTrip)(fishP, "blocks broken after join", "".concat(fishP.tstats.blocksBroken, "/").concat(limit));
                        void fishP.stop("automod", fishP.tstats.blocksBroken > 40 ? globals_1.maxTime : funcs_1.Duration.minutes(3), "Automatic stop due to suspicious activity");
                        players_1.FishPlayer.messageAllExcept(fishP, "[yellow]Player ".concat(fishP.cleanedName, " has been stopped automatically due to suspected griefing.\nPlease look at ").concat(fishP.position(), " and see if they were actually griefing. If they were not, please inform a staff member."));
                    }
                }
            }, 0, 1, (fishP.firstJoin() && !fishP.joinedAlready) ? 30 : fishP.joinsLessThan(3) ? 25 : 15);
        }
        if (fishP.firstJoin() && !fishP.joinedAlready) {
            fishP.joinedAlready = true;
            var tripped_2 = false;
            Timer.schedule(function () {
                if (fishP.stats.chatMessagesSent >= 3 && !tripped_2) {
                    tripped_2 = true;
                    if (exports.Antibot.antiBotMode())
                        Vars.netServer.admins.dosBlacklist.add(fishP.ip());
                    else if (!_this.chatSpam.allow(10000, 1)) {
                        Vars.netServer.admins.dosBlacklist.add(fishP.ip());
                        exports.Antibot.triggerAntibot(funcs_1.Duration.minutes(15), "multiple players spamming chat", "automatic", true);
                    }
                    else {
                        void fishP.mute("automod", funcs_1.Duration.months(1));
                        (0, utils_1.logHTrip)(fishP, "new player spamming chat");
                    }
                }
            }, 1, 1, 4);
            Timer.schedule(function () {
                if (fishP.stats.chatMessagesSent >= 4 && !tripped_2) {
                    tripped_2 = true;
                    if (!_this.chatSpamSlow.allow(30000, 2)) {
                        Vars.netServer.admins.dosBlacklist.add(fishP.ip());
                        exports.Antibot.triggerAntibot(funcs_1.Duration.minutes(15), "multiple players spamming chat slowly", "automatic", true);
                    }
                }
            }, 1, 2, 10);
        }
    }
};
Events.on(EventType.PlayerJoin, function (e) {
    //Don't activate heuristics until they've joined
    //a lot of time can pass between connect and join
    //also the player might connect but fail to join for a lot of reasons,
    //or connect, fail to join, then connect again and join successfully
    //which would cause heuristics to activate twice
    exports.Heuristics.activateHeuristics(players_1.FishPlayer.get(e.player));
});
var templateObject_1, templateObject_2;
