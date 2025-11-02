"use strict";
/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains all the console commands, which can be run through the server console.
*/
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
exports.commands = void 0;
var api = require("/api");
var commands_1 = require("/commands");
var config_1 = require("/config");
var globals = require("/globals");
var config_2 = require("/config");
var globals_1 = require("/globals");
var files_1 = require("/files");
var fjsContext = require("/fjsContext");
var globals_2 = require("/globals");
var players_1 = require("/players");
var ranks_1 = require("/ranks");
var utils_1 = require("/utils");
var funcs_1 = require("/funcs");
exports.commands = (0, commands_1.consoleCommandList)({
    setrank: {
        args: ["player:player", "rank:rank"],
        description: "Set a player's rank.",
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.rank == ranks_1.Rank.pi && !config_1.Mode.localDebug)
                (0, commands_1.fail)(f(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Rank ", " is immutable."], ["Rank ", " is immutable."])), args.rank));
            if (args.player.immutable() && !config_1.Mode.localDebug)
                (0, commands_1.fail)(f(templateObject_2 || (templateObject_2 = __makeTemplateObject(["Player ", " is immutable."], ["Player ", " is immutable."])), args.player));
            args.player.setRank(args.rank);
            (0, utils_1.logAction)("set rank to ".concat(args.rank.name, " for"), "console", args.player);
            outputSuccess(f(templateObject_3 || (templateObject_3 = __makeTemplateObject(["Set rank of player ", " to ", ""], ["Set rank of player ", " to ", ""])), args.player, args.rank));
        }
    },
    admin: {
        args: ["nothing:string?"],
        description: "Use the setrank command instead.",
        handler: function () {
            (0, commands_1.fail)("Use the \"setrank\" command instead. Hint: \"setrank player admin\"");
        }
    },
    setflag: {
        args: ["player:player", "flag:roleflag", "value:boolean"],
        description: "Set a player's role flags.",
        handler: function (_a) {
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            args.player.setFlag(args.flag, args.value);
            (0, utils_1.logAction)("set roleflag ".concat(args.flag.name, " to ").concat(args.value, " for"), "console", args.player);
            outputSuccess(f(templateObject_4 || (templateObject_4 = __makeTemplateObject(["Set role flag ", " of player ", " to ", ""], ["Set role flag ", " of player ", " to ", ""])), args.flag, args.player, args.value));
        }
    },
    savePlayers: {
        args: [],
        description: "Runs FishPlayer.save()",
        handler: function (_a) {
            var outputSuccess = _a.outputSuccess;
            players_1.FishPlayer.saveAll();
            outputSuccess("Successfully wrote fish player data.");
        }
    },
    info: {
        args: ["player:string"],
        description: "Find player info(s). Displays all names and ips of a player.",
        handler: function (_a) {
            var e_1, _b;
            var args = _a.args, output = _a.output, admins = _a.admins;
            var infoList = admins.findByName(args.player)
                .toSeq()
                .map(function (p) { return [p, players_1.FishPlayer.getById(p.id)]; })
                .sort(floatf(function (_a) {
                var _b = __read(_a, 2), info = _b[0], fishP = _b[1];
                if (!fishP)
                    return -20000 + info.timesJoined;
                return fishP.lastJoined;
            }));
            if (infoList.size == 0)
                (0, commands_1.fail)("No players found.");
            var outputString = [""];
            var _loop_1 = function (playerInfo, fishP) {
                var flagsText = [
                    (fishP === null || fishP === void 0 ? void 0 : fishP.marked()) && "&lris marked&fr until ".concat((0, utils_1.formatTimeRelative)(fishP.unmarkTime)),
                    (fishP === null || fishP === void 0 ? void 0 : fishP.muted) && "&lris muted&fr",
                    (fishP === null || fishP === void 0 ? void 0 : fishP.hasFlag("member")) && "&lmis member&fr",
                    (fishP === null || fishP === void 0 ? void 0 : fishP.autoflagged) && "&lris autoflagged&fr",
                    playerInfo.banned && "&bris UUID banned&fr",
                ].filter(Boolean).join(", ");
                var lastJoinedColor = (fishP === null || fishP === void 0 ? void 0 : fishP.lastJoined) && fishP.lastJoined !== -1 ? (function () {
                    var timeSinceLastJoin = (Date.now() - fishP.lastJoined) / 1000;
                    if (timeSinceLastJoin < 3600)
                        return "&br";
                    if (timeSinceLastJoin < 24 * 3600)
                        return "&by";
                    if (timeSinceLastJoin < 7 * 24 * 3600)
                        return "&lw";
                    return "&lk";
                })() : "&fr";
                outputString.push([
                    "".concat(lastJoinedColor, "Trace info for player &fr&y").concat(playerInfo.id, "&fr").concat(lastJoinedColor, " / &c\"").concat((0, funcs_1.escapeStringColorsServer)(Strings.stripColors(playerInfo.lastName)), "\" &lk(").concat((0, funcs_1.escapeStringColorsServer)(playerInfo.lastName), ")&fr"),
                    playerInfo.names.size > 1 && "all names used: ".concat(playerInfo.names.map(funcs_1.escapeStringColorsServer).map(function (n) { return "&c\"".concat(n, "\"&fr"); }).items.join(', ')),
                    "all IPs used: ".concat(playerInfo.ips.map(function (n) { return (n == playerInfo.lastIP ? '&c' : '&w') + n + '&fr'; }).items.join(", ")),
                    "joined &c".concat(playerInfo.timesJoined, "&fr times, kicked &c").concat(playerInfo.timesKicked, "&fr times"),
                    fishP && fishP.lastJoined !== -1 && "Last joined: ".concat((0, utils_1.formatTimeRelative)(fishP.lastJoined)),
                    fishP && "USID: &c".concat(fishP.usid(), "&fr"),
                    fishP && fishP.rank !== ranks_1.Rank.player && "Rank: &c".concat(fishP.rank.name, "&fr"),
                    flagsText,
                ].filter(Boolean).map(function (l, i) { return i == 0 ? l : '\t' + l; }).join("\n"));
            };
            try {
                for (var _c = __values(infoList.toArray()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = __read(_d.value, 2), playerInfo = _e[0], fishP = _e[1];
                    _loop_1(playerInfo, fishP);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            output(outputString.join("\n"));
        }
    },
    infoonline: {
        args: ["player:string"],
        description: "Display information about an online player.",
        handler: function (_a) {
            var e_2, _b;
            var args = _a.args, output = _a.output, admins = _a.admins;
            var infoList = args.player == "*" ? players_1.FishPlayer.getAllOnline() : players_1.FishPlayer.getAllByName(args.player, false);
            if (infoList.length == 0)
                (0, commands_1.fail)("Nobody with that name could be found.");
            var outputString = [""];
            var _loop_2 = function (player) {
                var playerInfo = admins.getInfo(player.uuid);
                outputString.push("Info for player &c\"".concat(player.cleanedName, "\" &lk(").concat(player.name, ")&fr\n\tUUID: &c\"").concat(playerInfo.id, "\"&fr\n\tUSID: &c").concat(player.usid() ? "\"".concat(player.usid(), "\"") : "unknown", "&fr\n\tall names used: ").concat(playerInfo.names.map(function (n) { return "&c\"".concat(n, "\"&fr"); }).items.join(', '), "\n\tall IPs used: ").concat(playerInfo.ips.map(function (n) { return (n == playerInfo.lastIP ? '&c' : '&w') + n + '&fr'; }).items.join(", "), "\n\tjoined &c").concat(playerInfo.timesJoined, "&fr times, kicked &c").concat(playerInfo.timesKicked, "&fr times\n\trank: &c").concat(player.rank.name, "&fr").concat((player.marked() ? ", &lris marked&fr" : "") + (player.muted ? ", &lris muted&fr" : "") + (player.hasFlag("member") ? ", &lmis member&fr" : "") + (player.autoflagged ? ", &lris autoflagged&fr" : "")));
            };
            try {
                for (var infoList_1 = __values(infoList), infoList_1_1 = infoList_1.next(); !infoList_1_1.done; infoList_1_1 = infoList_1.next()) {
                    var player = infoList_1_1.value;
                    _loop_2(player);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (infoList_1_1 && !infoList_1_1.done && (_b = infoList_1.return)) _b.call(infoList_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            output(outputString.join("\n"));
        }
    },
    unblacklist: {
        args: ["ip:string"],
        description: "Unblacklists an ip from the DOS blacklist.",
        handler: function (_a) {
            var args = _a.args, output = _a.output, admins = _a.admins;
            if (args.ip === '*') {
                var size = admins.dosBlacklist.size;
                if (size == 0)
                    (0, commands_1.fail)('DOS blacklist is already empty.');
                admins.dosBlacklist.clear();
                output("Cleared ".concat(size, " IPs from the DOS blacklist."));
            }
            else {
                if (admins.dosBlacklist.remove(args.ip))
                    output("Removed ".concat(args.ip, " from the DOS blacklist."));
                else
                    (0, commands_1.fail)("IP address ".concat(args.ip, " is not DOS blacklisted."));
            }
        }
    },
    blacklist: {
        args: ["rich:boolean?"],
        description: "Allows you to view the DOS blacklist.",
        handler: function (_a) {
            var args = _a.args, output = _a.output, admins = _a.admins;
            var blacklist = admins.dosBlacklist;
            if (blacklist.isEmpty())
                (0, commands_1.fail)("The blacklist is empty");
            if (args.rich) {
                var outputString_1 = ["DOS Blacklist:"];
                blacklist.each(function (ip) {
                    var info = admins.findByIP(ip);
                    if (info) {
                        outputString_1.push("IP: &c".concat(ip, "&fr UUID: &c\"").concat(info.id, "\"&fr Last name used: &c\"").concat(info.plainLastName(), "\"&fr"));
                    }
                });
                output(outputString_1.join("\n"));
                output("".concat(blacklist.size, " blacklisted IPs"));
            }
            else {
                output(blacklist.toString());
                output("".concat(blacklist.size, " blacklisted IPs"));
            }
        }
    },
    whack: {
        args: ["target:string"],
        description: "Whacks (ipbans) a player.",
        handler: function (_a) {
            var args = _a.args, output = _a.output, outputFail = _a.outputFail, admins = _a.admins;
            var range;
            if (globals_2.ipPattern.test(args.target)) {
                //target is an ip
                api.ban({ ip: args.target });
                var info = admins.findByIP(args.target);
                if (info)
                    (0, utils_1.logAction)("whacked", "console", info);
                else
                    (0, utils_1.logAction)("console ip-whacked ".concat(args.target));
                if (admins.isIPBanned(args.target)) {
                    output("IP &c\"".concat(args.target, "\"&fr is already banned. Ban was synced to other servers."));
                }
                else {
                    admins.banPlayerIP(args.target);
                    output("&lrIP &c\"".concat(args.target, "\"&lr was banned. Ban was synced to other servers."));
                }
            }
            else if ((range = (0, utils_1.getIPRange)(args.target)) != null) {
                if (admins.subnetBans.contains(function (ip) { return ip.replace(/\.$/, "") == range; })) {
                    output("Subnet &c\"".concat(range, "\"&fr is already banned."));
                }
                else {
                    admins.subnetBans.add(range);
                    output("&lrIP range &c\"".concat(range, "\"&lr was banned. Subnet bans are not synced."));
                }
            }
            else if (globals_2.uuidPattern.test(args.target)) {
                var info = admins.getInfoOptional(args.target);
                if (info)
                    (0, utils_1.logAction)("whacked", "console", info);
                else
                    (0, utils_1.logAction)("console ip-whacked ".concat(args.target));
                api.addStopped(args.target, globals.maxTime);
                if (admins.isIDBanned(args.target)) {
                    api.ban({ uuid: args.target });
                    output("UUID &c\"".concat(args.target, "\"&fr is already banned. Ban was synced to other servers."));
                }
                else {
                    admins.banPlayerID(args.target);
                    if (info) {
                        admins.banPlayerIP(info.lastIP);
                        api.ban({ uuid: args.target, ip: info.lastIP });
                        output("&lrUUID &c\"".concat(args.target, "\" &lrwas banned. IP &c\"").concat(info.lastIP, "\"&lr was banned. Ban was synced to other servers."));
                    }
                    else {
                        api.ban({ uuid: args.target });
                        output("&lrUUID &c\"".concat(args.target, "\" &lrwas banned. Ban was synced to other servers. Warning: no stored info for this UUID, player may not exist. Unable to determine IP."));
                    }
                }
            }
            else {
                var player = players_1.FishPlayer.getOneMindustryPlayerByName(args.target);
                if (player === "none") {
                    outputFail("Could not find a player name matching &c\"".concat(args.target, "\""));
                }
                else if (player === "multiple") {
                    outputFail("Name &c\"".concat(args.target, "\"&fr could refer to more than one player."));
                }
                else {
                    if (player.admin)
                        (0, commands_1.fail)("Player &c\"".concat(player.name, "\"&fr is an admin, you probably don't want to ban them."));
                    var ip = player.ip();
                    var uuid = player.uuid();
                    admins.banPlayerID(uuid);
                    admins.banPlayerIP(ip);
                    (0, utils_1.logAction)("console whacked ".concat(Strings.stripColors(player.name), " (`").concat(uuid, "`/`").concat(ip, "`)"));
                    api.ban({ uuid: uuid, ip: ip });
                    api.addStopped(player.uuid(), globals.maxTime);
                    output("&lrIP &c\"".concat(ip, "\"&lr was banned. UUID &c\"").concat(uuid, "\"&lr was banned. Ban was synced to other servers."));
                }
            }
            (0, utils_1.updateBans)(function (player) { return "[scarlet]Player [yellow]".concat(player.name, "[scarlet] has been whacked."); });
        }
    },
    unwhack: {
        args: ["target:string"],
        description: "Unbans a player.",
        handler: function (_a) {
            var args = _a.args, output = _a.output, admins = _a.admins;
            var range;
            if (globals_2.ipPattern.test(args.target)) {
                //target is an ip
                if (players_1.FishPlayer.removePunishedIP(args.target)) {
                    output("Removed IP &c\"".concat(args.target, "\"&fr from the anti-evasion list."));
                }
                if (admins.kickedIPs.remove(args.target)) {
                    output("Removed temporary kick for IP &c\"".concat(args.target, "\"&fr."));
                }
                output("Checking ban status...");
                api.getBanned({ ip: args.target }, function (banned) {
                    if (banned) {
                        api.unban({ ip: args.target });
                        (0, utils_1.logAction)("console unbanned ip `".concat(args.target, "`"));
                        output("IP &c\"".concat(args.target, "\"&fr has been globally unbanned."));
                    }
                    else {
                        output("IP &c\"".concat(args.target, "\"&fr is not globally banned."));
                    }
                    if (admins.isIPBanned(args.target)) {
                        admins.unbanPlayerIP(args.target);
                        output("IP &c\"".concat(args.target, "\"&fr has been locally unbanned."));
                    }
                    else {
                        output("IP &c\"".concat(args.target, "\"&fr was not locally banned."));
                    }
                    var size = admins.subnetBans.size;
                    admins.subnetBans.removeAll(function (r) { return args.target.startsWith(r); });
                    if (admins.subnetBans.size < size) {
                        output("Unbanned IP ranges affecting this IP.");
                    }
                });
            }
            else if ((range = (0, utils_1.getIPRange)(args.target)) != null) {
                if (admins.subnetBans.remove(function (b) { return b.replace(/\.$/, ".") == range.replace(/\.$/, "."); })) {
                    output("IP range &c\"".concat(range, "\"&fr was unbanned."));
                }
                else {
                    output("IP range &c\"".concat(range, "\"&fr was not banned."));
                }
            }
            else if (globals_2.uuidPattern.test(args.target)) {
                if (players_1.FishPlayer.removePunishedUUID(args.target)) {
                    output("Removed UUID &c\"".concat(args.target, "\"&fr from the anti-evasion list."));
                }
                output("Checking ban status...");
                var info_1 = admins.findByIP(args.target);
                api.getBanned({ uuid: args.target }, function (banned) {
                    if (banned) {
                        api.unban({ uuid: args.target });
                        (0, utils_1.logAction)("console unbanned uuid `".concat(args.target, "`"));
                        output("UUID &c\"".concat(args.target, "\"&fr has been globally unbanned."));
                    }
                    else {
                        output("UUID &c\"".concat(args.target, "\"&fr is not globally banned."));
                    }
                    if (admins.isIDBanned(args.target)) {
                        admins.unbanPlayerID(args.target);
                        output("UUID &c\"".concat(args.target, "\"&fr has been locally unbanned."));
                    }
                    else {
                        output("UUID &c\"".concat(args.target, "\"&fr was not locally banned."));
                    }
                    if (info_1) {
                        if (info_1.lastKicked > 0) {
                            info_1.lastKicked = 0;
                            output("Removed temporary kick for UUID &c\"".concat(args.target, "\"&fr."));
                        }
                        output("You may also want to consider unbanning the IP \"".concat(info_1.lastIP, "\"."));
                    }
                });
            }
            else {
                (0, commands_1.fail)("Cannot unban by name; please use the info or search commands to find the IP and UUID of the player you are looking for.");
            }
        }
    },
    ban: {
        args: ["any:string"],
        description: "Please use the whack command instead.",
        handler: function () {
            (0, commands_1.fail)("Use the whack command instead.");
        }
    },
    unban: {
        args: ["any:string"],
        description: "Please use the unwhack command instead.",
        handler: function () {
            (0, commands_1.fail)("Use the unwhack command instead.");
        }
    },
    "subnet-ban": {
        args: ["any:string?", "anyb:string?"],
        description: "Please use the whack and unwhack commands instead.",
        handler: function (_a) {
            var args = _a.args, output = _a.output, admins = _a.admins;
            if (args.any)
                (0, commands_1.fail)("Use the whack and unwhack commands instead.");
            output("List of all subnet bans:");
            output(admins.subnetBans.toString("\n"));
        }
    },
    joinbell: {
        args: ["on:boolean?"],
        description: "Toggles the join bell function.",
        handler: function (_a) {
            var _b = _a.args.on, on = _b === void 0 ? !globals_2.fishState.joinBell : _b;
            globals_2.fishState.joinBell = on;
            if (globals_2.fishState.joinBell) {
                Log.info("Enabled sound on new player join. Run \"joinbell\" again to turn it off.");
            }
            else {
                Log.info("Disabled sound on new player join.");
            }
        }
    },
    loadfishplayerdata: {
        args: ["areyousure:boolean", "fishplayerdata:string"],
        description: "Overwrites current fish player data.",
        handler: function (_a) {
            var args = _a.args, output = _a.output;
            if (args.areyousure) {
                var before = Object.keys(players_1.FishPlayer.cachedPlayers).length;
                players_1.FishPlayer.loadAll(args.fishplayerdata);
                output("Loaded fish player data. before:".concat(before, ", after:").concat(Object.keys(players_1.FishPlayer.cachedPlayers).length));
            }
        }
    },
    clearallstoredusids: {
        args: ["areyousure:boolean?", "areyoureallysure:boolean?", "areyoureallyreallysure:boolean?"],
        description: "Removes every stored USID. NOT RECOMMENDED.",
        handler: function (_a) {
            var e_3, _b;
            var args = _a.args, output = _a.output;
            if (args.areyousure && args.areyoureallysure && args.areyoureallyreallysure) {
                var total = 0;
                try {
                    for (var _c = __values(Object.entries(players_1.FishPlayer.cachedPlayers)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), uuid = _e[0], fishP = _e[1];
                        total++;
                        fishP.setUSID(undefined);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                players_1.FishPlayer.saveAll();
                output("Removed ".concat(total, " stored USIDs."));
            }
            else {
                output("Are you sure?!?!?!?!?!!");
            }
        }
    },
    resetauth: {
        args: ["player:string"],
        description: "Removes the USID of the player provided, use this if they are getting kicked with the message \"Authorization failure!\". Specify \"last\" to use the last player that got kicked.",
        handler: function (_a) {
            var _b, _c;
            var args = _a.args, outputSuccess = _a.outputSuccess, admins = _a.admins;
            var player = args.player == "last" ? ((_b = players_1.FishPlayer.lastAuthKicked) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("Nobody has been kicked for authorization failure since the last restart.")) :
                (_c = players_1.FishPlayer.getById(args.player)) !== null && _c !== void 0 ? _c : (0, commands_1.fail)(admins.getInfoOptional(args.player)
                    ? "Player ".concat(args.player, " has joined the server, but their info was not cached, most likely because they have no rank, so there is no stored USID.")
                    : "Unknown player ".concat(args.player));
            if (player.ranksAtLeast("admin"))
                (0, commands_1.fail)("Please use the approveauth command instead.");
            var oldusid = player.usid();
            player.setUSID(undefined);
            outputSuccess("Removed the usid of player ".concat(player.name, "/").concat(player.uuid, " (was ").concat(oldusid, ")"));
        }
    },
    approveauth: {
        args: ["usid:string"],
        description: "Sets the USID of a player.",
        handler: function (_a) {
            var _b;
            var args = _a.args, outputSuccess = _a.outputSuccess, f = _a.f;
            if (args.usid.length !== 12)
                (0, commands_1.fail)("Invalid USID: should be 12 characters ending with an equal sign");
            var player = (_b = players_1.FishPlayer.lastAuthKicked) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("No authorization failures have occurred since the last restart.");
            player.setUSID(args.usid);
            outputSuccess(f(templateObject_5 || (templateObject_5 = __makeTemplateObject(["Set USID for player ", " to ", "."], ["Set USID for player ", " to ", "."])), player, args.usid));
        }
    },
    update: {
        args: ["branch:string?"],
        description: "Updates the plugin.",
        handler: function (_a) {
            var args = _a.args, output = _a.output, outputSuccess = _a.outputSuccess, outputFail = _a.outputFail;
            if (config_1.Mode.localDebug)
                (0, commands_1.fail)("Cannot update in local debug mode.");
            output("Updating...");
            var path = (0, utils_1.fishCommandsRootDirPath)().toString();
            Threads.thread(function () {
                var _a, _b;
                try {
                    var initialVersion = OS.exec("git", "-C", path, "rev-parse", "HEAD");
                    var gitFetch = new ProcessBuilder("git", "-C", path, "fetch", "origin")
                        .redirectErrorStream(true)
                        .redirectOutput(ProcessBuilder.Redirect.INHERIT)
                        .start();
                    gitFetch.waitFor();
                    if (gitFetch.exitValue() == 0) {
                        outputSuccess("Fetched data, updating files...");
                    }
                    else {
                        outputFail("Update failed!");
                        return;
                    }
                    var newVersion = OS.exec("git", "-C", path, "rev-parse", "origin/".concat((_a = args.branch) !== null && _a !== void 0 ? _a : "master"));
                    if (initialVersion == newVersion) {
                        outputSuccess("Already up to date.");
                        return;
                    }
                    var gitCheckout = new ProcessBuilder("git", "-C", path, "checkout", "-q", "-f", "origin/".concat((_b = args.branch) !== null && _b !== void 0 ? _b : "master"))
                        .redirectErrorStream(true)
                        .redirectOutput(ProcessBuilder.Redirect.INHERIT)
                        .start();
                    gitCheckout.waitFor();
                    if (gitCheckout.exitValue() == 0) {
                        outputSuccess("Updated successfully from ".concat(initialVersion, " to ").concat(newVersion, ". Restart to apply changes."));
                    }
                    else {
                        outputFail("Update failed!");
                        return;
                    }
                }
                catch (err) {
                    Log.err(err);
                    outputFail("Update failed!");
                }
            });
        }
    },
    restart: {
        args: ["time:number?"],
        description: "Restarts the server.",
        handler: function (_a) {
            var _b, _c;
            var args = _a.args;
            (_b = globals_2.fishState.restartLoopTask) === null || _b === void 0 ? void 0 : _b.cancel();
            if (config_2.Gamemode.pvp()) {
                if (Groups.player.isEmpty()) {
                    Log.info("Restarting immediately as no players are online.");
                    (0, utils_1.serverRestartLoop)(0);
                }
                else if (args.time === -1) {
                    Log.info("&rRestarting in 15 seconds (this will interrupt the current PVP match).&fr");
                    Call.sendMessage("[accent]---[[[coral]+++[]]---\n[accent]Server restart imminent. [green]We'll be back after 15 seconds.[]\n[accent]---[[[coral]+++[]]---");
                    (0, utils_1.serverRestartLoop)(15);
                }
                else {
                    Call.sendMessage("[accent]---[[[coral]+++[]]---\n[accent]Server restart queued. The server will restart after the current match is over.[]\n[accent]---[[[coral]+++[]]---");
                    Log.info("PVP detected, restart will occur at the end of the current match. Run \"restart -1\" to override, but &rthat would interrupt the current pvp match, and players would lose their teams.&fr");
                    globals_2.fishState.restartQueued = true;
                }
            }
            else {
                var time = (_c = args.time) !== null && _c !== void 0 ? _c : 60;
                if (time < 0 || time > 100)
                    (0, commands_1.fail)("Invalid time: out of valid range.");
                Call.sendMessage("[accent]---[[[coral]+++[]]---\n[accent]Server restart imminent. [green]We'll be back with 15 seconds of downtime, and all progress will be saved.[]\n[accent]---[[[coral]+++[]]---");
                Log.info("Restarting in ".concat(time, " seconds..."));
                (0, utils_1.serverRestartLoop)(time);
            }
        }
    },
    restartcancel: {
        args: [],
        description: "Cancels a planned server restart.",
        handler: function (_a) {
            var _b;
            var outputSuccess = _a.outputSuccess;
            var task = (_b = globals_2.fishState.restartLoopTask) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("No restart scheduled.");
            Call.sendMessage("[scarlet]Aborting...");
            task.cancel();
            Call.sendMessage("[scarlet]Server restart canceled.");
            outputSuccess("Canceled restart.");
        }
    },
    rename: {
        args: ["player:player", "newname:string"],
        description: "Changes the name of a player.",
        handler: function (_a) {
            var args = _a.args, f = _a.f, outputSuccess = _a.outputSuccess;
            if (args.player.hasPerm("blockTrolling"))
                (0, commands_1.fail)(f(templateObject_6 || (templateObject_6 = __makeTemplateObject(["Operation aborted: Player ", " is insufficiently trollable."], ["Operation aborted: Player ", " is insufficiently trollable."])), args.player));
            var oldName = args.player.name;
            args.player.player.name = args.player.prefixedName = args.newname;
            args.player.shouldUpdateName = false;
            outputSuccess("Renamed ".concat(oldName, " to ").concat(args.newname, "."));
        }
    },
    fjs: {
        args: ["js:string"],
        description: "Executes arbitrary javascript code, but has access to fish-commands's variables.",
        handler: function (_a) {
            var args = _a.args;
            fjsContext.runJS(args.js);
        }
    },
    checkmem: {
        args: [],
        description: "Checks memory usage of various objects.",
        handler: function (_a) {
            var output = _a.output;
            output("Memory usage:\nTotal: ".concat(Math.round(Core.app.getJavaHeap() / (Math.pow(2, 10))), " KB\nNumber of cached fish players: ").concat(Object.keys(players_1.FishPlayer.cachedPlayers).length, " (has data: ").concat(Object.values(players_1.FishPlayer.cachedPlayers).filter(function (p) { return p.hasData(); }).length, ")\nFish player data string length: ").concat(players_1.FishPlayer.getFishPlayersString.length, " (").concat(Core.settings.getInt("fish-subkeys"), " subkeys)\nLength of tilelog entries: ").concat(Math.round(Object.values(globals_2.tileHistory).reduce(function (acc, a) { return acc + a.length; }, 0) / (Math.pow(2, 10))), " KB"));
        }
    },
    stopplayer: {
        args: ['player:player', "time:time?", "message:string?"],
        description: 'Stops a player.',
        handler: function (_a) {
            var _b, _c, _d;
            var args = _a.args, f = _a.f, outputSuccess = _a.outputSuccess;
            if (args.player.marked()) {
                //overload: overwrite stoptime
                if (!args.time)
                    (0, commands_1.fail)(f(templateObject_7 || (templateObject_7 = __makeTemplateObject(["Player ", " is already marked."], ["Player ", " is already marked."])), args.player));
                var previousTime = (0, utils_1.formatTime)(args.player.unmarkTime - Date.now());
                args.player.updateStopTime(args.time);
                outputSuccess(f(templateObject_8 || (templateObject_8 = __makeTemplateObject(["Player ", "'s stop time has been updated to ", " (was ", ")."], ["Player ", "'s stop time has been updated to ", " (was ", ")."])), args.player, (0, utils_1.formatTime)(args.time), previousTime));
                return;
            }
            var time = (_b = args.time) !== null && _b !== void 0 ? _b : 604800000;
            if (time + Date.now() > globals_1.maxTime)
                (0, commands_1.fail)("Error: time too high.");
            args.player.stop("console", time, (_c = args.message) !== null && _c !== void 0 ? _c : undefined);
            (0, utils_1.logAction)('stopped', "console", args.player, (_d = args.message) !== null && _d !== void 0 ? _d : undefined, time);
            Call.sendMessage("[scarlet]Player \"".concat(args.player.prefixedName, "[scarlet]\" has been marked for ").concat((0, utils_1.formatTime)(time)).concat(args.message ? " with reason: [white]".concat(args.message, "[]") : "", "."));
        }
    },
    stopoffline: {
        args: ["uuid:uuid", "time:time?"],
        description: "Stops a player by uuid.",
        handler: function (_a) {
            var _b = _a.args, uuid = _b.uuid, time = _b.time, outputSuccess = _a.outputSuccess, admins = _a.admins;
            var stopTime = time !== null && time !== void 0 ? time : (globals_1.maxTime - Date.now() - 10000);
            var info = admins.getInfoOptional(uuid);
            if (info == null)
                (0, commands_1.fail)("Unknown player ".concat(uuid));
            var fishP = players_1.FishPlayer.getFromInfo(info);
            fishP.stop("console", stopTime);
            (0, utils_1.logAction)('stopped', "console", info, undefined, stopTime);
            outputSuccess("Player \"".concat(info.lastName, "\" was marked for ").concat((0, utils_1.formatTime)(stopTime), "."));
        }
    },
    clearfire: {
        args: [],
        description: "Clears all the fires.",
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
    status: {
        args: [],
        description: "Displays server status.",
        handler: function (_a) {
            var output = _a.output;
            if (Vars.state.isMenu())
                (0, commands_1.fail)("Status: Server closed.");
            var uptime = Packages.java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
            var numStaff = 0;
            players_1.FishPlayer.forEachPlayer(function (p) {
                if (p.ranksAtLeast("mod"))
                    numStaff++;
            });
            var uptimeColor = uptime < 2 * 24 * 3600000 ? "" :
                uptime < 5 * 24 * 3600000 ? "&ly" :
                    uptime < 9 * 24 * 3600000 ? "&y" :
                        "&br";
            output("\nStatus:\nPlaying on map &fi".concat(Vars.state.map.plainName(), "&fr for ").concat((0, utils_1.formatTime)(1000 * Vars.state.tick / 60), "\n").concat(Vars.state.rules.waves ? "Wave &c".concat(Vars.state.wave, "&fr, &c").concat(Math.ceil(Vars.state.wavetime / 60), "&fr seconds until next wave.\n") : "", "&c").concat(Groups.unit.size(), "&fr units, &c").concat(Vars.state.enemies, "&fr enemies, &c").concat(Groups.build.size(), "&fr buildings\nTPS: ").concat((0, utils_1.colorNumber)(Core.graphics.getFramesPerSecond(), function (f) { return f > 58 ? "&g" : f > 30 ? "&y" : f > 10 ? "&r" : "&br&w"; }, "server"), ", Memory: &c").concat(Math.round(Core.app.getJavaHeap() / 1048576), "&fr MB\nServer uptime: ").concat(uptimeColor).concat((0, utils_1.formatTime)(uptime), "&fr (since ").concat((0, utils_1.formatTimestamp)(Date.now() - uptime), ")\n").concat([
                globals_2.fishState.restartQueued ? "&by&lwRestart queued&fr" : "",
                globals_2.fishState.restartLoopTask ? "&by&lwRestarting now&fr" : "",
                players_1.FishPlayer.antiBotMode() ? "&br&wANTIBOT ACTIVE!&fr" + (0, utils_1.getAntiBotInfo)("server") : "",
            ].filter(function (l) { return l.length > 0; }).join("\n"), "\n").concat((0, utils_1.colorNumber)(Groups.player.size(), function (n) { return n > 0 ? "&c" : "&lr"; }, "server"), " players online, ").concat((0, utils_1.colorNumber)(numStaff, function (n) { return n > 0 ? "&c" : "&lr"; }, "server"), " staff members.\n").concat(players_1.FishPlayer.mapPlayers(function (p) {
                return "\t".concat(p.rank.shortPrefix, " &c").concat(p.uuid, "&fr &c").concat(p.name, "&fr");
            }).join("\n") || "&lrNo players connected.&fr", "\n"));
        }
    },
    tmux: {
        args: ["attach:string"],
        description: "Oopsie",
        handler: function () {
            (0, commands_1.fail)("You are already in the Mindustry server console. Please regain situational awareness before running any further commands.");
        }
    },
    BEGIN: {
        args: ["transaction:string"],
        description: "Oopsie",
        handler: function (_a) {
            var args = _a.args;
            if (args.transaction == "TRANSACTION")
                (0, commands_1.fail)("Not possible :( please download and run locally, and make a backup");
            else
                (0, commands_1.fail)("Command not found. Did you mean \"BEGIN TRANSACTION\"?");
        }
    },
    prune: {
        args: ["confirm:boolean?"],
        description: "Prunes fish player data",
        handler: function (_a) {
            var args = _a.args, admins = _a.admins, outputSuccess = _a.outputSuccess, outputFail = _a.outputFail;
            var playersToPrune = Object.values(players_1.FishPlayer.cachedPlayers)
                .filter(function (player) {
                if (player.hasData())
                    return false;
                var data = admins.getInfoOptional(player.uuid);
                return (!data ||
                    data.timesJoined == 1 ||
                    (data.timesJoined < 10 &&
                        (Date.now() - player.lastJoined) > (30 * 86400 * 1000)));
            });
            if (args.confirm) {
                outputSuccess("Creating backup...");
                var backupScript = Core.settings.getDataDirectory().child("backup.sh");
                if (!backupScript.exists())
                    (0, commands_1.fail)("./backup.sh does not exist! aborting");
                var backupProcess_1 = new ProcessBuilder(backupScript.absolutePath())
                    .directory(Core.settings.getDataDirectory().file())
                    .redirectErrorStream(true)
                    .redirectOutput(ProcessBuilder.Redirect.INHERIT)
                    .start();
                Threads.daemon(function () {
                    backupProcess_1.waitFor();
                    if (backupProcess_1.exitValue() == 0) {
                        outputSuccess("Successfully created a backup.");
                        Core.app.post(function () {
                            playersToPrune.forEach(function (u) { delete players_1.FishPlayer.cachedPlayers[u.uuid]; });
                            outputSuccess("Pruned ".concat(playersToPrune.length, " players."));
                        });
                    }
                    else {
                        outputFail("Backup failed!");
                    }
                });
            }
            else {
                outputSuccess("Pruning would remove fish data for ".concat(playersToPrune.length, " players with no data and (1 join or inactive with <10 joins). (Mindustry data will remain.)\nRun \"prune y\" to prune data."));
            }
        }
    },
    backup: {
        args: [],
        description: "Creates a backup of the settings.bin file.",
        handler: function (_a) {
            var output = _a.output, outputFail = _a.outputFail, outputSuccess = _a.outputSuccess;
            output("Creating backup...");
            var backupScript = Core.settings.getDataDirectory().child("backup.sh");
            if (!backupScript.exists())
                (0, commands_1.fail)("./backup.sh does not exist! aborting");
            var backupProcess = new ProcessBuilder(backupScript.absolutePath())
                .directory(Core.settings.getDataDirectory().file())
                .redirectErrorStream(true)
                .redirectOutput(ProcessBuilder.Redirect.INHERIT)
                .start();
            Threads.daemon(function () {
                backupProcess.waitFor();
                if (backupProcess.exitValue() == 0)
                    outputSuccess("Successfully created a backup.");
                else
                    outputFail("Backup failed!");
            });
        }
    },
    updateMaps: {
        args: [],
        description: 'Attempt to fetch and update all map files',
        handler: function (_a) {
            var output = _a.output, outputSuccess = _a.outputSuccess, outputFail = _a.outputFail;
            output("Updating maps... (this may take a while)");
            (0, files_1.updateMaps)()
                .then(function (changed) { return outputSuccess(changed ? "Maps were updated." : "Map update completed, already up to date."); })
                .catch(function (message) { return outputFail("Map update failed: ".concat(message)); });
        },
    },
    switchall: {
        args: ["server:string"],
        description: "Forces all currently online players to another server.",
        handler: function (_a) {
            var _b;
            var args = _a.args;
            if (globals_1.ipPortPattern.test(args.server)) {
                Groups.player.each(function (target) {
                    //direct connect
                    Call.connect.apply(Call, __spreadArray([target.con], __read(args.server.split(":")), false));
                });
            }
            else {
                var server_1 = (_b = config_1.FishServer.byName(args.server)) !== null && _b !== void 0 ? _b : (0, commands_1.fail)("Unknown server ".concat(args.server, ". Valid options: ").concat(config_1.FishServer.all.map(function (s) { return s.name; }).join(", ")));
                Groups.player.each(function (target) {
                    Call.connect(target.con, server_1.ip, server_1.port);
                });
            }
        }
    },
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
