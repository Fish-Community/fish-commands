"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the FishPlayer class, and many player-related functions.
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
exports.FishPlayer = void 0;
var api = __importStar(require("/api"));
var config_1 = require("/config");
var commands_1 = require("/frameworks/commands");
var menus_1 = require("/frameworks/menus");
var funcs_1 = require("/funcs");
var globals = __importStar(require("/globals"));
var globals_1 = require("/globals");
var maps_1 = require("/maps");
var ranks_1 = require("/ranks");
var utils_1 = require("/utils");
var FishPlayer = /** @class */ (function () {
    //#endregion
    function FishPlayer(uuid, data, player) {
        //#endregion
        //#region Transient properties
        //Commands framework
        /** Front-to-back queue of menus to show. */
        this.activeMenus = [];
        /** Mapping from command to usage data. */
        this.usageData = {};
        this.tapInfo = {
            resolve: null,
            commandName: null,
            lastArgs: {},
            mode: "once",
        };
        //Misc
        this.player = null;
        /** Used for the /trail command. */
        this.trail = null;
        /** Like name but without the colors. */
        this.cleanedName = "Unnamed player [ERROR}";
        /** Includes prefixes. Same as .player.name */
        this.prefixedName = "Unnamed player [ERROR}";
        /** Set when ClashGone is feeling especially chaotic. Used instead of {@link name} for prefixed name computation. */
        this.jokeName = null;
        /** Used to freeze players when votekicking. */
        this.frozen = false;
        /** Used to avoid spamming players with ads by the tip message system */
        this.lastShownAd = globals.maxTime;
        /** Used to avoid spamming players with ads by the tip message system */
        this.showAdNext = false;
        /** Transient statistics, used by the automatic griefer detection. */
        this.tstats = {
            //remember to clear this in updateSavedInfoFromPlayer!
            blocksBroken: 0,
            blockInteractionsThisMap: 0,
            lastMapStartTime: 0,
            lastMapPlayedTime: 0,
            wavesSurvived: 0,
        };
        /** Whether the player has manually marked themselves as AFK. */
        this.manualAfk = false;
        //Used for AFK detection.
        this.lastMousePosition = [0, 0];
        this.lastUnitPosition = [0, 0];
        this.lastActive = Date.now();
        /** Used by the sendMessage() ratelimit system. */
        this.lastRatelimitedMessage = -1;
        /** Keeps track of whether a player has changed team this match, for win rate calculation. */
        this.changedTeam = false;
        /** Whether the player's IP was detected as a VPN. */
        this.ipDetectedVpn = false;
        /**
         * If a player's IP is detected as a VPN on their first join,
         * they are autoflagged and cannot build or talk in chat.
         */
        this.autoflagged = false;
        /** Timestamp until which this player will not be allowed to control units. */
        this.blockedFromPossessingUnitsUntil = 0;
        /** Timestamp until which this player will not be allowed to control units. */
        this.blockedFromCommandingUnitsUntil = 0;
        // Used by the data syncing framework.
        this.infoUpdated = false;
        this.dataSynced = false;
        this.restoreTeam = null;
        this.autoConfirmSkipWaveUntil = -1;
        this.chatSpam = new Ratekeeper();
        this.skipConfirm = -1;
        this.copyOptions = null;
        this.recentPlayers = new Set();
        /** The effective original name. Usually the same as originalName, but can be modified by filters and commands. */
        this.name = "Unnamed player [ERROR}";
        this.unmuteTime = -1;
        this.unmarkTime = -1;
        this.rank = ranks_1.Rank.player;
        this.flags = new Set();
        /** Used to color chat messages for the member command */
        this.highlight = null;
        /** Used to color the player's name for the member command */
        this.rainbow = null;
        /** List of all moderation actions that have been performed on this player. */
        this.history = [];
        /**
         * The USID for this player.
         * USID stands for Unique Server IDentifier. It is like a UUID, but unique to each server (by IP and port).
         * It cannot be viewed by admins and it cannot be obtained by other servers.
         */
        this.usid = null;
        /** If chat strictness is set to "strict", the player will not be allowed to swear. */
        this.chatStrictness = "chat";
        this.language = "";
        /** -1 represents unknown */
        this.lastJoined = -1;
        /** -1 represents unknown */
        this.firstJoined = -1;
        /** -1 represents unknown */
        this.globalLastJoined = -1;
        /** -1 represents unknown */
        this.globalFirstJoined = -1;
        this.stats = {
            blocksBroken: 0,
            blocksPlaced: 0,
            timeInGame: 0,
            chatMessagesSent: 0,
            gamesFinished: 0,
            gamesWon: 0,
        };
        this.globalStats = this.stats;
        /** Used for the /vanish command. */
        this.showRankPrefix = true;
        this.achievements = new Bits();
        this.uuid = uuid;
        this.player = player;
        this.updateData(data);
    }
    //#region getplayer
    //Contains methods used to get FishPlayer instances.
    FishPlayer.createFromPlayer = function (player) {
        return new this(player.uuid(), {}, player);
    };
    FishPlayer.createFromInfo = function (playerInfo) {
        var _a;
        return new this(playerInfo.id, {
            uuid: playerInfo.id,
            name: playerInfo.lastName,
            usid: (_a = playerInfo.adminUsid) !== null && _a !== void 0 ? _a : null
        }, null);
    };
    FishPlayer.getFromInfo = function (playerInfo) {
        var _a;
        var _b, _c;
        return (_a = (_b = FishPlayer.cachedPlayers)[_c = playerInfo.id]) !== null && _a !== void 0 ? _a : (_b[_c] = FishPlayer.createFromInfo(playerInfo));
    };
    FishPlayer.get = function (player) {
        var _a;
        var _b, _c;
        return (_a = (_b = FishPlayer.cachedPlayers)[_c = player.uuid()]) !== null && _a !== void 0 ? _a : (_b[_c] = FishPlayer.createFromPlayer(player));
    };
    FishPlayer.resolve = function (player) {
        var _a;
        var _b, _c;
        if (player instanceof FishPlayer)
            return player;
        else
            return (_a = (_b = FishPlayer.cachedPlayers)[_c = player.uuid()]) !== null && _a !== void 0 ? _a : (_b[_c] = FishPlayer.createFromPlayer(player));
    };
    FishPlayer.getById = function (id) {
        var _a;
        return (_a = this.cachedPlayers[id]) !== null && _a !== void 0 ? _a : null;
    };
    /** Returns the FishPlayer representing the first online player matching a given name. */
    FishPlayer.getByName = function (name) {
        if (name == "")
            return null;
        var realPlayer = Groups.player.find(function (p) {
            return p.name === name ||
                p.name.includes(name) ||
                p.name.toLowerCase().includes(name.toLowerCase()) ||
                Strings.stripColors(p.name).toLowerCase() === name.toLowerCase() ||
                Strings.stripColors(p.name).toLowerCase().includes(name.toLowerCase()) ||
                false;
        });
        return realPlayer ? this.get(realPlayer) : null;
    };
    ;
    /** Returns the FishPlayers representing all online players matching a given name. */
    FishPlayer.getAllByName = function (name, strict) {
        if (strict === void 0) { strict = true; }
        if (name == "")
            return [];
        var output = [];
        Groups.player.each(function (p) {
            var fishP = FishPlayer.get(p);
            if (fishP.connected() && fishP.cleanedName.includes(name) || (!strict && fishP.cleanedName.toLowerCase().includes(name)))
                output.push(fishP);
        });
        return output;
    };
    FishPlayer.getOneMindustryPlayerByName = function (str) {
        var e_1, _a;
        if (str == "")
            return "none";
        var players = (0, funcs_1.setToArray)(Groups.player);
        var matchingPlayers;
        var filters = [
            function (p) { return p.name === str; },
            // p => Strings.stripColors(p.name) === str,
            function (p) { return Strings.stripColors(p.name).toLowerCase() === str.toLowerCase(); },
            // p => p.name.includes(str),
            function (p) { return p.name.toLowerCase().includes(str.toLowerCase()); },
            function (p) { return Strings.stripColors(p.name).includes(str); },
            function (p) { return Strings.stripColors(p.name).toLowerCase().includes(str.toLowerCase()); },
        ];
        try {
            for (var filters_1 = __values(filters), filters_1_1 = filters_1.next(); !filters_1_1.done; filters_1_1 = filters_1.next()) {
                var filter = filters_1_1.value;
                matchingPlayers = players.filter(filter);
                if (matchingPlayers.length == 1)
                    return matchingPlayers[0];
                else if (matchingPlayers.length > 1)
                    return "multiple";
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (filters_1_1 && !filters_1_1.done && (_a = filters_1.return)) _a.call(filters_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return "none";
    };
    //This method exists only because there is no easy way to turn an entitygroup into an array
    FishPlayer.getAllOnline = function () {
        var players = [];
        Groups.player.each(function (p) {
            var fishP = FishPlayer.get(p);
            if (fishP.connected())
                players.push(fishP);
        });
        return players;
    };
    /** Returns all cached FishPlayers with names matching the search string. */
    FishPlayer.getAllOfflineByName = function (name) {
        var e_2, _a;
        var matching = [];
        try {
            for (var _b = __values(Object.entries(this.cachedPlayers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), uuid = _d[0], player = _d[1];
                if (player.cleanedName.toLowerCase().includes(name))
                    matching.push(player);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return matching;
    };
    FishPlayer.onConnectPacket = function (_a) {
        var _this = this;
        var uuid = _a.uuid, name = _a.name;
        var entry = this.cachedPlayers[uuid];
        if (entry) {
            entry.infoUpdated = false;
            entry.dataSynced = false;
            entry.setName(name);
        }
        api.getFishPlayerData(uuid).then(function (data) {
            if (!data)
                return; //nothing to sync
            var fishP;
            if (!(uuid in _this.cachedPlayers)) {
                fishP = new FishPlayer(uuid, data, null);
                fishP.originalName = name;
                fishP.setName(name);
                fishP.dataSynced = true;
                _this.cachedPlayers[uuid] = fishP;
            }
            else {
                fishP = _this.cachedPlayers[uuid];
                fishP.dataSynced = true;
                fishP.updateData(data);
                if (fishP.infoUpdated) {
                    //Player has already connected
                    //Run it again
                    if (fishP.player)
                        fishP.updateSavedInfoFromPlayer(fishP.player, true);
                }
                else {
                    //Player has not connected yet, nothing further needed
                }
            }
            if (fishP.connected()) {
                fishP.checkUsid();
                fishP.updateMemberExclusiveState();
                fishP.updateName();
                fishP.updateAdminStatus();
                fishP.updateAutoflaggedStatus();
                fishP.checkAutoRanks();
                fishP.sendWelcomeMessage();
            }
        }, function () {
            var fishP = _this.cachedPlayers[uuid];
            fishP.updateAdminStatus();
            fishP.updateAutoflaggedStatus();
            fishP.sendWelcomeMessage();
            if (fishP === null || fishP === void 0 ? void 0 : fishP.player)
                fishP.player.sendMessage(config_1.text.dataFetchFailed);
            else
                _this.dataFetchFailedUuids.add(uuid);
        });
    };
    /** Must be called at player join, before updateName(). */
    FishPlayer.prototype.updateSavedInfoFromPlayer = function (player, repeated) {
        if (repeated === void 0) { repeated = false; }
        this.player = player;
        if (repeated) {
            this.name = this.originalName;
        }
        else {
            this.originalName = this.name = player.name;
        }
        if (this.firstJoined < 1)
            this.firstJoined = Date.now();
        //Do not update USID here
        this.manualAfk = false;
        this.cleanedName = Strings.stripColors(this.name);
        this.lastJoined = Date.now();
        this.lastMousePosition = [0, 0];
        this.lastActive = Date.now();
        if (this.highlight === "[white]")
            this.highlight = null;
        this.changedTeam = false;
        this.ipDetectedVpn = false;
        this.tstats.blocksBroken = 0;
        if (this.tstats.lastMapPlayedTime != FishPlayer.lastMapStartTime) {
            this.tstats.blockInteractionsThisMap = 0;
            this.tstats.lastMapPlayedTime = FishPlayer.lastMapStartTime;
        }
        this.infoUpdated = true;
    };
    FishPlayer.prototype.updateData = function (data) {
        var _a;
        if (data.name != undefined)
            this.name = data.name;
        if (data.unmuteTime != undefined)
            this.unmuteTime = data.unmuteTime;
        if (data.unmarkTime != undefined)
            this.unmarkTime = data.unmarkTime;
        if (data.lastJoined != undefined)
            this.lastJoined = data.lastJoined;
        if (data.firstJoined != undefined)
            this.firstJoined = data.firstJoined;
        if (data.globalLastJoined != undefined)
            this.globalLastJoined = data.globalLastJoined;
        if (data.globalFirstJoined != undefined)
            this.globalFirstJoined = data.globalFirstJoined;
        if (data.highlight != undefined)
            this.highlight = data.highlight;
        if (data.history != undefined)
            this.history = data.history;
        if (data.rainbow != undefined)
            this.rainbow = data.rainbow;
        if (data.usid != undefined)
            this.usid = data.usid;
        if (data.chatStrictness != undefined)
            this.chatStrictness = data.chatStrictness;
        if (data.language != undefined)
            this.language = data.language;
        if (data.stats != undefined)
            this.stats = data.stats;
        if (data.globalStats != undefined)
            this.globalStats = data.globalStats;
        if (data.showRankPrefix != undefined)
            this.showRankPrefix = data.showRankPrefix;
        if (data.rank != undefined)
            this.rank = (_a = ranks_1.Rank.getByName(data.rank)) !== null && _a !== void 0 ? _a : ranks_1.Rank.player;
        if (data.flags != undefined)
            this.flags = new Set(data.flags.map(ranks_1.RoleFlag.getByName).filter(Boolean));
        if (data.achievements != undefined)
            this.achievements = JsonIO.read(Bits, "{bits:".concat(data.achievements, "}"));
    };
    /** Use when creating a new FishPlayer. */
    FishPlayer.prototype.downloadData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.getFishPlayerData(this.uuid)];
                    case 1:
                        data = _a.sent();
                        if (data)
                            this.updateData(data);
                        return [2 /*return*/, data != null];
                }
            });
        });
    };
    FishPlayer.prototype.getData = function () {
        var _a = this, uuid = _a.uuid, name = _a.name, unmuteTime = _a.unmuteTime, unmarkTime = _a.unmarkTime, rank = _a.rank, flags = _a.flags, highlight = _a.highlight, rainbow = _a.rainbow, history = _a.history, usid = _a.usid, chatStrictness = _a.chatStrictness, language = _a.language, lastJoined = _a.lastJoined, firstJoined = _a.firstJoined, stats = _a.stats, showRankPrefix = _a.showRankPrefix;
        return {
            uuid: uuid,
            name: name,
            unmuteTime: unmuteTime,
            unmarkTime: unmarkTime,
            highlight: highlight,
            rainbow: rainbow,
            history: history,
            usid: usid,
            chatStrictness: chatStrictness,
            language: language,
            lastJoined: lastJoined,
            firstJoined: firstJoined,
            stats: stats,
            showRankPrefix: showRankPrefix,
            rank: rank.name,
            flags: __spreadArray([], __read(flags.values()), false).map(function (f) { return f.name; }),
            achievements: JsonIO.write(Reflect.get(this.achievements, "bits"))
        };
    };
    /** Warning: the "update" callback is run twice. */
    FishPlayer.prototype.updateSynced = function (update, beforeFetch, afterFetch) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        update(this);
                        beforeFetch === null || beforeFetch === void 0 ? void 0 : beforeFetch(this);
                        return [4 /*yield*/, api.getFishPlayerData(this.uuid)];
                    case 1:
                        data = _a.sent();
                        if (data)
                            this.updateData(data);
                        update(this);
                        //of course, this is a race condition
                        //but it's unlikely to happen
                        //could be fixed by transmitting the update operation to the server as a mongo update command
                        afterFetch === null || afterFetch === void 0 ? void 0 : afterFetch(this);
                        return [4 /*yield*/, api.setFishPlayerData(this.getData(), 1, false)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //#endregion
    //#region actively synced data updates
    FishPlayer.prototype.stop = function (by, duration, message, notify) {
        var _this = this;
        if (notify === void 0) { notify = true; }
        if (duration > 60000)
            this.setPunishedIP(config_1.stopAntiEvadeTime);
        this.showRankPrefix = true;
        var unmarkTime = Date.now() + duration;
        if (unmarkTime > globals.maxTime)
            unmarkTime = globals.maxTime;
        return this.updateSynced(function () {
            _this.unmarkTime = unmarkTime;
            _this.updateName();
        }, function () {
            _this.setUnmarkTimer(duration);
            if (_this.connected() && notify) {
                _this.stopUnit();
                _this.sendMessage(message
                    ? "[scarlet]Oopsy Whoopsie! You've been stopped, and marked as a griefer for reason: [white]".concat(message, "[]")
                    : "[scarlet]Oopsy Whoopsie! You've been stopped, and marked as a griefer.");
                if (duration < funcs_1.Duration.hours(1)) {
                    //less than one hour
                    _this.sendMessage("[yellow]Your mark will expire in ".concat((0, utils_1.formatTime)(duration), "."));
                }
            }
        }, function () { return _this.addHistoryEntry({
            action: 'stopped',
            by: by instanceof FishPlayer ? by.name : by,
            time: Date.now(),
        }); });
    };
    FishPlayer.prototype.free = function (by) {
        var _this = this;
        by !== null && by !== void 0 ? by : (by = "console");
        this.autoflagged = false; //Might as well set autoflagged to false
        FishPlayer.removePunishedIP(this.ip());
        FishPlayer.removePunishedUUID(this.uuid);
        return this.updateSynced(function () {
            _this.unmarkTime = -1;
        }, function () {
            if (_this.connected()) {
                _this.sendMessage('[yellow]Looks like someone had mercy on you.');
                _this.updateName();
                _this.forceRespawn();
            }
        }, function () { return _this.addHistoryEntry({
            action: 'freed',
            by: by instanceof FishPlayer ? by.name : by,
            time: Date.now(),
        }); });
    };
    FishPlayer.prototype.setRank = function (rank) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof rank === "string" || !rank) {
                            rank;
                            (0, funcs_1.crash)("Type error in FishPlayer.setFlag(): rank is invalid");
                        }
                        if (rank == ranks_1.Rank.pi && !config_1.Mode.localDebug)
                            throw new TypeError("Cannot find function setRank in object [object Object].");
                        return [4 /*yield*/, this.updateSynced(function () {
                                _this.rank = rank;
                                _this.updateName();
                                _this.updateAdminStatus();
                            }, function () { return FishPlayer.saveAll(); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FishPlayer.prototype.setFlag = function (flag_, value) {
        return __awaiter(this, void 0, void 0, function () {
            var flag;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        flag = typeof flag_ == "string" ?
                            (ranks_1.RoleFlag.getByName(flag_))
                            : flag_;
                        // eslint-disable-next-line @typescript-eslint/no-base-to-string
                        if (!flag)
                            (0, funcs_1.crash)("Type error in FishPlayer.setFlag(): flag ".concat(String(flag_), " is invalid"));
                        return [4 /*yield*/, this.updateSynced(function () {
                                if (value) {
                                    _this.flags.add(flag);
                                }
                                else {
                                    _this.flags.delete(flag);
                                }
                                _this.updateMemberExclusiveState();
                                _this.updateName();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FishPlayer.prototype.mute = function (by, duration, message) {
        var _this = this;
        if (this.muted())
            return;
        if (duration > 60000)
            this.setPunishedIP(config_1.stopAntiEvadeTime);
        this.showRankPrefix = true;
        var unmuteTime = Date.now() + duration;
        if (unmuteTime > globals.maxTime)
            unmuteTime = globals.maxTime;
        return this.updateSynced(function () {
            _this.unmuteTime = unmuteTime;
            _this.updateName();
        }, function () {
            _this.setUnmuteTimer(duration);
            if (_this.connected()) {
                _this.sendMessage(message
                    ? "[yellow]Hey! You have been muted. You cannot send messages to other players. You can still send messages to staff members. Reason: [white]".concat(message)
                    : "[yellow]Hey! You have been muted. You cannot send messages to other players. You can still send messages to staff members.");
                if (duration < funcs_1.Duration.hours(1)) {
                    //less than one hour
                    _this.sendMessage("[yellow]Your mute will expire in ".concat((0, utils_1.formatTime)(duration), "."));
                }
            }
        }, function () { return _this.addHistoryEntry({
            action: 'muted',
            by: by instanceof FishPlayer ? by.name : by,
            time: Date.now(),
        }); });
    };
    FishPlayer.prototype.unmute = function (by) {
        var _this = this;
        if (!this.muted())
            return;
        FishPlayer.removePunishedIP(this.ip());
        FishPlayer.removePunishedUUID(this.uuid);
        return this.updateSynced(function () {
            _this.unmuteTime = -1;
            _this.updateName();
        }, function () {
            _this.sendMessage("[green]You have been unmuted.");
        }, function () { return _this.addHistoryEntry({
            action: 'unmuted',
            by: by instanceof FishPlayer ? by.name : by,
            time: Date.now(),
        }); });
    };
    //#endregion
    //#region eventhandling
    //Contains methods that handle an event and must be called by other code (usually through Events.on).
    /** Must be run on PlayerConnectEvent. */
    FishPlayer.onPlayerConnect = function (player) {
        var _a;
        var _b, _c;
        var fishPlayer = (_a = (_b = this.cachedPlayers)[_c = player.uuid()]) !== null && _a !== void 0 ? _a : (_b[_c] = this.createFromPlayer(player));
        var previousJoin = fishPlayer.lastJoined;
        fishPlayer.updateSavedInfoFromPlayer(player);
        if (fishPlayer.validate()) {
            if (!fishPlayer.hasPerm("bypassNameCheck")) {
                var message = (0, utils_1.isImpersonator)(fishPlayer.name, fishPlayer.ranksAtLeast("admin"));
                if (message !== false) {
                    fishPlayer.sendMessage("[scarlet]\u26A0[] [gold]Oh no! Our systems think you are a [scarlet]SUSSY IMPERSONATOR[]!\n[gold]Reason: ".concat(message, "\n[gold]Change your name to remove the tag."));
                }
                else if ((0, utils_1.cleanText)(player.name, true).includes("hacker")) {
                    fishPlayer.sendMessage("[scarlet]\u26A0 Don't be a script kiddie!");
                    globals_1.FishEvents.fire("scriptKiddie", [fishPlayer]);
                }
            }
            fishPlayer.updateName();
            fishPlayer.updateAdminStatus();
            fishPlayer.checkVPNAndJoins();
            //I think this is a better spot for this
            if (fishPlayer.firstJoin())
                void fishPlayer.showRules();
        }
    };
    /** Must be run on PlayerJoinEvent. */
    FishPlayer.onPlayerJoin = function (player) {
        var _this = this;
        var _a;
        var _b, _c;
        var fishPlayer = (_a = (_b = this.cachedPlayers)[_c = player.uuid()]) !== null && _a !== void 0 ? _a : (_b[_c] = (function () {
            Log.err("onPlayerJoin: no fish player was created? ".concat(player.uuid()));
            return _this.createFromPlayer(player);
        })());
        //Don't activate heuristics until they've joined
        //a lot of time can pass between connect and join
        //also the player might connect but fail to join for a lot of reasons,
        //or connect, fail to join, then connect again and join successfully
        //which would cause heuristics to activate twice
        fishPlayer.activateHeuristics();
    };
    FishPlayer.updateAFKCheck = function () {
        //TODO better AFK check
        this.forEachPlayer(function (fishP, mp) {
            if (fishP.lastMousePosition[0] != mp.mouseX || fishP.lastMousePosition[1] != mp.mouseY) {
                fishP.lastActive = Date.now();
            }
            fishP.lastMousePosition = [mp.mouseX, mp.mouseY];
            if (fishP.lastUnitPosition[0] != mp.x || fishP.lastUnitPosition[1] != mp.y) {
                fishP.lastActive = Date.now();
            }
            fishP.lastUnitPosition = [mp.x, mp.y];
            fishP.updateName();
        });
    };
    /** Must be run on PlayerLeaveEvent. */
    FishPlayer.onPlayerLeave = function (player) {
        var _a;
        var fishP = this.cachedPlayers[player.uuid()];
        //at PlayerLeaveEvent, the player is still added
        if (!fishP)
            return;
        if (Vars.netServer.currentlyKicking &&
            Reflect.get(Vars.netServer.currentlyKicking, "target") == player) {
            //Anti votekick evasion
            var votes_1 = Reflect.get(Vars.netServer.currentlyKicking, "votes");
            if ((function () {
                if (fishP.hasPerm("bypassVotekick"))
                    return false;
                if (fishP.hasPerm("bypassVoteFreeze"))
                    return votes_1 >= Vars.netServer.votesRequired();
                if (fishP.info().timesJoined > 50)
                    return votes_1 >= 2;
                return votes_1 >= 1;
            })()) {
                var kickDuration = NetServer.kickDuration;
                //Pass the votekick
                Call.sendMessage("[orange]Vote passed.[scarlet] ".concat(player.name, "[orange] will be banned from the server for ").concat(kickDuration / 60, " minutes."));
                player.kick(Packets.KickReason.vote, kickDuration * 1000); //it is stored in seconds but needs to be converted to millis
                Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
                Vars.netServer.currentlyKicking = null;
            }
        }
        //Clear temporary states such as menu and taphandler
        fishP.activeMenus = [];
        fishP.tapInfo.commandName = null;
        fishP.tapInfo.resolve = null;
        if (fishP.lastJoined > 1000)
            fishP.updateStats(function (stats) { return stats.timeInGame += (Date.now() - fishP.lastJoined); }); //Time between joining and leaving
        fishP.lastJoined = Date.now();
        this.recentLeaves.unshift(fishP);
        if (this.recentLeaves.length > 10)
            this.recentLeaves.pop();
        void api.setFishPlayerData(fishP.getData(), 1, true);
        var currentRun = (_a = maps_1.PartialMapRun.current) === null || _a === void 0 ? void 0 : _a.startTime;
        if (currentRun)
            Core.app.post(function () {
                //Wait for the /spectate command's handler to fix their team before saving it
                fishP.restoreTeam = [fishP.player.team(), Date.now(), currentRun];
            });
    };
    FishPlayer.validateVotekickSession = function () {
        var _a;
        if (!Vars.netServer.currentlyKicking)
            return;
        var target = this.get(Reflect.get(Vars.netServer.currentlyKicking, "target"));
        var voted = Reflect.get(Vars.netServer.currentlyKicking, "voted");
        if (voted.size == 2) {
            //Try to find the UUID of the initiator
            var uuid_1 = null;
            voted.entries().toArray().each(function (e) {
                if (globals_1.uuidPattern.test(e.key))
                    uuid_1 = e.key;
            });
            if (uuid_1) {
                var initiator = this.getById(uuid_1);
                if (initiator === null || initiator === void 0 ? void 0 : initiator.stelled()) {
                    if (initiator.hasPerm("bypassVotekick")) {
                        if (target !== this.easterEggVotekickTarget) {
                            this.easterEggVotekickTarget = target;
                            var msg = (_a = (new Error()).stack) === null || _a === void 0 ? void 0 : _a.split("\n").slice(0, 4).join("\n");
                            Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(initiator.prefixedName, "[lightgray].[accent] (\u221E/").concat(Vars.netServer.votesRequired(), ")\n\t[scarlet]Error: failed to kick player ").concat(initiator.prefixedName, "[scarlet]\n\t").concat(msg, "\n\t[scarlet]Error: failed to cancel votekick\n\t").concat(msg));
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
    };
    FishPlayer.onPlayerChat = function (player, message) {
        var fishP = this.get(player);
        if (message.trim().toLowerCase().startsWith("/vote y") || message.startsWith("/votekick ")) {
            this.checkVotekickAction(fishP, message);
        }
        if (!message.startsWith("/") || message.startsWith("/t")) {
            fishP.lastActive = Date.now();
            fishP.updateStats(function (stats) { return stats.chatMessagesSent++; });
            var susLevel = fishP.suspicionLevel();
            if (!fishP.chatSpam.allow(14300, susLevel == 3 ? 3 : susLevel == 2 ? 5 : 30)) {
                if (susLevel == 3 || Date.now() > fishP.kickForSpamAt) {
                    fishP.kick("You have been kicked for spamming.", 30000);
                    if (this.antiBotMode())
                        Vars.netServer.admins.blacklistDos(fishP.ip());
                }
                else {
                    fishP.sendMessage("[scarlet]You are sending chat messages too quickly.");
                    fishP.kickForSpamAt = Date.now() + 3000;
                }
            }
            if (susLevel >= 2 && !this.globalSusChat.allow(30000, 20)) {
                this.triggerAntibot(funcs_1.Duration.minutes(2), "too many chat messages", "automatic", true);
            }
        }
    };
    FishPlayer.checkVotekickAction = function (fishP, message) {
        var e_3, _a, e_4, _b, e_5, _c;
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
        var targetSusLevel = FishPlayer.get(target).suspicionLevel();
        //Evaluate if this action should be blocked
        if (sus <= 1)
            return;
        var reason = undefined;
        if (!this.votekickActionRate.allow(108000, 8))
            reason = "Exceeded 8 votekick actions in the last 2 minutes";
        else if (sus == 3 && this.lastVKActions.find(function (a) { return Date.now() - a.time < 10000 && a.playerSusLevel == 3; }) && timeSinceJoin < 6000)
            reason = "Performed votekick within 6 seconds of joining and there was a recent suspicious vote";
        else if (sus == 3 && timeSinceJoin < 80000 && this.lastVKActions.find(function (a) { return a.player == fishP; }) && targetSusLevel <= 1)
            reason = "Two votekick actions within 80 seconds of joining and the target is not suspicious";
        else if (sus >= 2 && this.lastVKActions.filter(function (a) { return a.playerSusLevel == 3 && Date.now() - a.time < 33000; }).length >= 3)
            reason = "More than 3 recent votekick actions by suspicious players";
        else if (sus >= 2 && this.lastVKActions.filter(function (a) { return a.playerSusLevel >= 2; }).length >= 6 && this.lastVKActions.filter(function (a) { return a.player == fishP; }).length >= 3)
            reason = "More than 6 slightly suspicious votekick actions within the past 20 minutes and this player has already performed 3 of them";
        if (reason != undefined) {
            //Should we ban everyone?
            var suspiciousActions = this.lastVKActions.filter(function (action) {
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
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (playersToBan_1_1 && !playersToBan_1_1.done && (_a = playersToBan_1.return)) _a.call(playersToBan_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                (0, utils_1.updateBans)(function (player) { return "[scarlet]Player [yellow]".concat(player.name, "[scarlet] has been whacked automatically for suspected votekick abuse."); });
                //Pardon most of the votekick targets (the ones that weren't voted on by a non-sus player)
                var candidatePardons = new Set(FishPlayer.lastVKActions.map(function (a) { return a.target; }));
                try {
                    for (var _g = __values(FishPlayer.lastVKActions), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var action = _h.value;
                        if (action.playerSusLevel <= 1)
                            candidatePardons.delete(action.target);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                var playersToPardon = __spreadArray([], __read(candidatePardons), false).map(FishPlayer.get);
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
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (playersToPardon_1_1 && !playersToPardon_1_1.done && (_c = playersToPardon_1.return)) _c.call(playersToPardon_1);
                    }
                    finally { if (e_5) throw e_5.error; }
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
                        Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.name, "[lightgray].[accent] (-\u221E/").concat(Vars.netServer.votesRequired(), ")\n\t\t[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff."));
                        if (Vars.netServer.currentlyKicking)
                            Reflect.get(Vars.netServer.currentlyKicking, "task").cancel();
                        Vars.netServer.currentlyKicking = null;
                    });
                //If there is an ongoing votekick and the initiator is suspicious, cancel that
                else if (((_e = FishPlayer.lastVKActions.slice().reverse().find(function (a) { return a.type == "start"; })) === null || _e === void 0 ? void 0 : _e.playerSusLevel) == 3) {
                    Call.sendMessage("[scarlet]Server[lightgray] has voted on kicking[orange] ".concat(target.name, "[lightgray].[accent] (-\u221E/").concat(Vars.netServer.votesRequired(), ")\n\t\t[scarlet]Vote cancelled due to suspected abuse. [accent]If this is in error, please report it to staff."));
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
        this.lastVKActions.push({
            player: fishP,
            playerSusLevel: sus,
            target: target,
            targetSusLevel: targetSusLevel,
            time: Date.now(),
            type: message.startsWith("/votekick") ? "start" : "vote y",
            reason: message.startsWith("/votekick") ? message.split(" ").slice(2).join(" ") : undefined
        });
        this.lastVKActions = this.lastVKActions.filter(function (a) { return Date.now() - a.time < funcs_1.Duration.minutes(10); });
    };
    FishPlayer.onPlayerCommand = function (player, command, unjoinedRawArgs) {
        if (command == "msg" && unjoinedRawArgs[1] == "Please do not use that logic, as it is attem83 logic and is bad to use. For more information please read www.mindustry.dev/attem")
            return; //Attemwarfare message, not sent by the player
        player.lastActive = Date.now();
    };
    FishPlayer.onGameOver = function (winningTeam) {
        var _this = this;
        globals_1.FishEvents.fire("gameOver", [winningTeam]);
        this.forEachPlayer(function (fishPlayer) {
            //Clear temporary states such as menu and taphandler
            fishPlayer.activeMenus = [];
            fishPlayer.tapInfo.commandName = null;
            fishPlayer.tapInfo.resolve = null;
            //Update stats
            if (!_this.ignoreGameOver && fishPlayer.team() != Team.derelict && winningTeam != Team.derelict) {
                fishPlayer.updateStats(function (stats) { return stats.gamesFinished++; });
                if (fishPlayer.changedTeam) {
                    fishPlayer.sendMessage("Refusing to update stats due to a team change.");
                }
                else {
                    if (fishPlayer.team() == winningTeam)
                        fishPlayer.updateStats(function (stats) { return stats.gamesWon++; });
                }
            }
            fishPlayer.changedTeam = false;
            fishPlayer.tstats.wavesSurvived = 0;
            fishPlayer.tstats.blockInteractionsThisMap = 0;
        });
    };
    FishPlayer.ignoreGameover = function (callback) {
        this.ignoreGameOver = true;
        callback();
        this.ignoreGameOver = false;
    };
    FishPlayer.onGameBegin = function () {
        var startTime = Date.now();
        FishPlayer.lastMapStartTime = startTime;
        //wait 7 seconds for players to join
        Timer.schedule(function () { return FishPlayer.forEachPlayer(function (p) { return p.tstats.lastMapStartTime = startTime; }); }, 7);
    };
    /** Must be run on UnitChangeEvent. */
    FishPlayer.onUnitChange = function (player, unit) {
        if (unit === null || unit === void 0 ? void 0 : unit.spawnedByCore)
            this.onRespawn(player);
    };
    FishPlayer.onRespawn = function (player) {
        var fishP = this.get(player);
        if (fishP.stelled())
            fishP.stopUnit();
    };
    FishPlayer.forEachPlayer = function (func) {
        var _this = this;
        Groups.player.each(function (player) {
            if (player == null) {
                Log.err(".FINDTAG. Groups.player.each() returned a null player???");
                return;
            }
            var fishP = _this.get(player);
            func(fishP, player);
        });
    };
    FishPlayer.mapPlayers = function (func) {
        var _this = this;
        var out = [];
        Groups.player.each(function (player) {
            if (player == null) {
                Log.err(".FINDTAG. Groups.player.each() returned a null player???");
                return;
            }
            out.push(func(_this.get(player)));
        });
        return out;
    };
    FishPlayer.prototype.updateMemberExclusiveState = function () {
        if (!this.hasPerm("member")) {
            this.highlight = null;
            this.rainbow = null;
        }
    };
    /** Updates the mindustry player's name, using the prefixes of the current rank and role flags. */
    FishPlayer.prototype.updateName = function () {
        var e_6, _a;
        var _b;
        if (!this.connected())
            return; //No player, no need to update
        var name = (_b = this.jokeName) !== null && _b !== void 0 ? _b : this.name;
        if (this.marked())
            this.showRankPrefix = true;
        var prefix = '';
        if (!this.hasPerm("bypassNameCheck") && (0, utils_1.isImpersonator)(name, this.ranksAtLeast("admin")))
            prefix += "[scarlet]SUSSY IMPOSTOR[]";
        if (this.marked())
            prefix += config_1.prefixes.marked;
        else if (this.autoflagged)
            prefix += config_1.prefixes.flagged;
        if (this.muted())
            prefix += config_1.prefixes.muted;
        if (this.afk())
            prefix += "[orange]\uE876 AFK \uE876 | [white]";
        if (this.showRankPrefix) {
            try {
                for (var _c = __values(this.flags), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var flag = _d.value;
                    prefix += flag.prefix;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_6) throw e_6.error; }
            }
            prefix += this.rank.prefix;
        }
        if (prefix.length > 0 && !prefix.endsWith(" "))
            prefix += " ";
        var replacedName;
        if ((0, utils_1.cleanText)(name, true).includes("hacker")) {
            //"Don't be a script kiddie"
            //-LiveOverflow, 2015
            if (/h.*a.*c.*k.*[3e].*r/i.test(name)) { //try to only replace the part that contains "hacker" if it can be found with a simple regex
                replacedName = name.replace(/h.*a.*c.*k.*[3e].*r/gi, "[brown]script kiddie[]");
            }
            else {
                replacedName = "[brown]script kiddie";
            }
        }
        else
            replacedName = name;
        this.player.name = this.prefixedName = prefix + replacedName;
    };
    FishPlayer.prototype.randomName = function () {
        return (config_1.automaticNames.adjectives[Math.floor(Math.random() * config_1.automaticNames.adjectives.length)] +
            config_1.automaticNames.nouns[Math.floor(Math.random() * config_1.automaticNames.nouns.length)] +
            Math.floor(Math.random() * 200).toString().replace("69", "123").replace("67", "321"));
    };
    FishPlayer.prototype.updateAdminStatus = function () {
        if (!this.connected())
            return;
        if (this.hasPerm("admin")) {
            Vars.netServer.admins.adminPlayer(this.uuid, this.player.usid());
            this.player.admin = true;
        }
        else {
            Vars.netServer.admins.unAdminPlayer(this.uuid);
            this.player.admin = false;
        }
    };
    FishPlayer.prototype.updateAutoflaggedStatus = function () {
        if (this.ranksAtLeast("active")) {
            this.autoflagged = false;
        }
    };
    FishPlayer.prototype.checkAntiEvasion = function () {
        var e_7, _a;
        var _b, _c;
        FishPlayer.updatePunishedIPs();
        try {
            for (var _d = __values(FishPlayer.punishedIPs), _e = _d.next(); !_e.done; _e = _d.next()) {
                var _f = __read(_e.value, 2), ip = _f[0], uuid = _f[1];
                if (ip == this.ip() && uuid != this.uuid && !this.ranksAtLeast("mod")) {
                    api.sendModerationMessage("Automatically banned player `".concat(this.cleanedName, "` (`").concat(this.uuid, "`/`").concat(this.ip(), "`) for suspected punishment evasion.\nPreviously used UUID `").concat(uuid, "`(").concat((_b = Vars.netServer.admins.getInfoOptional(uuid)) === null || _b === void 0 ? void 0 : _b.plainLastName(), "), currently using UUID `").concat(this.uuid, "` from the same IP address."));
                    Log.warn("&yAutomatically banned player &b".concat(this.cleanedName, "&y (&b").concat(this.uuid, "&y/&b").concat(this.ip(), "&y) for suspected punishment evasion.\n&yPreviously used UUID &b").concat(uuid, "&y(&b").concat((_c = Vars.netServer.admins.getInfoOptional(uuid)) === null || _c === void 0 ? void 0 : _c.plainLastName(), "&y), currently using UUID &b").concat(this.uuid, "&y from the same IP address."));
                    FishPlayer.messageStaff("[yellow]Automatically banned player [cyan]".concat(this.prefixedName, "[] for suspected punishment evasion."));
                    Vars.netServer.admins.bannedIPs.add(ip);
                    api.ban({ ip: ip, uuid: uuid });
                    this.kick(Packets.KickReason.banned);
                    return false;
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return true;
    };
    FishPlayer.updatePunishedIPs = function () {
        for (var i = 0; i < this.punishedIPs.length; i++) {
            if (this.punishedIPs[i][2] < Date.now()) {
                this.punishedIPs.splice(i, 1);
            }
        }
    };
    FishPlayer.prototype.checkVPNAndJoins = function () {
        var _this = this;
        var ip = this.ip();
        var info = this.info();
        api.isVpn(ip, function (isVpn) {
            if (isVpn) {
                Log.warn("IP ".concat(ip, " was flagged as VPN. Flag rate: ").concat(FishPlayer.stats.numIpsFlagged, "/").concat(FishPlayer.stats.numIpsChecked, " (").concat(100 * FishPlayer.stats.numIpsFlagged / FishPlayer.stats.numIpsChecked, "%)"));
                _this.ipDetectedVpn = true;
                if (!FishPlayer.autoflagRate.allow(30000, 5)) {
                    FishPlayer.triggerAntibot(funcs_1.Duration.minutes(3), "rate of flagged IPs exceeded 5 / 30s", "automatic", false);
                    return;
                }
                if ((info.timesJoined <= 1 || (FishPlayer.autoflagRate.occurences > 3 && info.timesJoined <= 10)) //is this smart?
                    && !_this.ranksAtLeast("active")
                    && FishPlayer.punishedIPs.length > 0) {
                    _this.autoflagged = true;
                    if (_this.connected())
                        _this.stopUnit();
                    _this.updateName();
                    if (FishPlayer.shouldWhackFlaggedPlayers()) {
                        FishPlayer.whackFlaggedPlayers(); //calls whack all flagged players
                    }
                    else {
                        (0, utils_1.logAction)("autoflagged", "AntiVPN", _this);
                        void api.sendStaffMessage("Autoflagged player ".concat(_this.cleanedName, "[cyan] for suspected vpn!"), "AntiVPN", true);
                        if (!FishPlayer.antiBotMode())
                            FishPlayer.messageStaff("[yellow]WARNING:[scarlet] player [cyan]\"".concat(_this.prefixedName, "[cyan]\"[yellow] is new (").concat(info.timesJoined - 1, " joins) and using a vpn. Unless there is an ongoing griefer raid, they are most likely innocent. Free them with /free."));
                        Log.warn("Player ".concat(_this.cleanedName, " (").concat(_this.uuid, ") was autoflagged."));
                        if (_this.connected())
                            void menus_1.Menu.buttons(_this, "[gold]Welcome to Fish Community!", "[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ".concat(config_1.FColor.discord(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Join our Discord"], ["Join our Discord"]))), " to request a staff member come online if none are on."), [[
                                    { data: "Close", text: "Close" },
                                    { data: "Discord", text: config_1.FColor.discord("Discord") },
                                ]]).then(function (option) {
                                if (option == "Discord") {
                                    Call.openURI(_this.con(), config_1.text.discordURL);
                                }
                            });
                        _this.sendMessage("[gold]Welcome to Fish Community!\n[gold]Hi there! You have been automatically [scarlet]stopped and muted[] because we've found something to be [pink]a bit sus[]. You can still talk to staff and request to be freed. ".concat(config_1.FColor.discord(templateObject_2 || (templateObject_2 = __makeTemplateObject(["Join our Discord"], ["Join our Discord"]))), " to request a staff member come online if none are on."));
                    }
                }
                else if (info.timesJoined < 5) {
                    FishPlayer.messageStaff("[yellow]WARNING:[scarlet] player [cyan]\"".concat(_this.prefixedName, "[cyan]\"[yellow] is new (").concat(info.timesJoined - 1, " joins) and using a vpn."));
                }
            }
            else {
                if (info.timesJoined == 1) {
                    FishPlayer.messageTrusted("[yellow]Player \"".concat(_this.prefixedName, "[yellow]\" is on first join."));
                }
            }
            if (info.timesJoined == 1) {
                var message = "&lrNew player joined: &c".concat(_this.cleanedName, "&lr (&c").concat(_this.uuid, "&lr/&c").concat(ip, "&lr)");
                //Add BEL, this causes an audible noise
                if (globals.fishState.joinBell)
                    message += '\x07';
                Log.info(message);
            }
        }, function (err) {
            Log.err("Error while checking for VPN status of ip ".concat(ip, "!"));
            Log.err(err);
        });
    };
    FishPlayer.prototype.validate = function () {
        return this.checkName() && this.checkUsid() && this.checkAntiEvasion();
    };
    /** Checks if this player's name is allowed. */
    FishPlayer.prototype.checkName = function () {
        if ((0, utils_1.matchFilter)(this.name, "name")) {
            this.kick("[scarlet]\"".concat(this.name, "[scarlet]\" is not an allowed name because it contains a banned word.\n\nIf you are unable to change it, please download Mindustry from Steam or itch.io."), 1);
        }
        else {
            //Non-critical invalid names
            //If one of these cases trigger, we will rename the player by editing FishPlayer.name
            if (FishPlayer.oddBrackets.matcher(this.name).find()) {
                this.setName(this.name + "[");
            }
            var cleanedName = Strings.stripColors(this.name.replace(/[\u3164]/g, "")).trim();
            if (cleanedName.length == 0 || cleanedName == ".") {
                this.setName(this.randomName());
                this.sendMessage("[orange]Your name was determined to be empty, so it has been replaced with a randomly generated one. To change it, please disconnect and set your name to something that is not empty.");
            }
            if (this.cleanedName.startsWith("@")) {
                this.setName(this.name.replace(/^@/, "(@)"));
                this.sendMessage("[orange]Names may not begin with the @ sign, because it is used for commands. Your name has been edited slightly.");
            }
            if (this.cleanedName.includes("\"")) {
                this.setName(this.name.replace(/"/g, "'"));
                this.sendMessage("[orange]Your name may not contain double quotes, because they are used for commands. Your name has been edited slightly.");
            }
            return true;
        }
        return false;
    };
    /** Checks if this player's USID is correct. */
    FishPlayer.prototype.checkUsid = function () {
        var storedUSID = this.usid;
        var usidMissing = storedUSID == null || !storedUSID;
        var receivedUSID = this.player.usid();
        if (this.hasPerm("usidCheck")) {
            if (usidMissing) {
                if (this.hasPerm("mod")) {
                    //Staff missing USID, don't let them in
                    Log.err("&rUSID missing for privileged player &c\"".concat(this.cleanedName, "\"&r: no stored usid, cannot authenticate.\nRun &lgsetusid ").concat(this.uuid, " ").concat(receivedUSID, "&fr if you have verified this connection attempt."));
                    this.kick("Authorization failure! Please ask a staff member with Console Access to approve this connection.", 1);
                    FishPlayer.lastAuthKicked = this;
                    return false;
                }
                else {
                    Log.info("Acquired USID for player &c\"".concat(this.cleanedName, "\"&fr: &c\"").concat(receivedUSID, "\"&fr"));
                }
            }
            else {
                if (receivedUSID != storedUSID) {
                    Log.err("&rUSID mismatch for player &c\"".concat(this.cleanedName, "\"&r: stored usid is &c").concat(storedUSID, "&r, but they tried to connect with usid &c").concat(receivedUSID, "&r\nRun &lgsetusid ").concat(this.uuid, " ").concat(receivedUSID, "&fr if you have verified this connection attempt."));
                    this.kick("Authorization failure!", 1);
                    FishPlayer.lastAuthKicked = this;
                    return false;
                }
            }
        }
        else {
            if (!usidMissing && receivedUSID != storedUSID) {
                Log.err("&rUSID mismatch for player &c\"".concat(this.cleanedName, "\"&r: stored usid is &c").concat(storedUSID, "&r, but they tried to connect with usid &c").concat(receivedUSID, "&r"));
            }
        }
        this.usid = receivedUSID;
        return true;
    };
    FishPlayer.prototype.displayTrail = function () {
        if (this.trail)
            Call.effect(Fx[this.trail.type], this.player.x, this.player.y, 0, this.trail.color);
    };
    FishPlayer.prototype.sendWelcomeMessage = function () {
        var _this = this;
        var appealLine = "To appeal, ".concat(config_1.FColor.discord(templateObject_3 || (templateObject_3 = __makeTemplateObject(["join our discord"], ["join our discord"]))), " with ").concat(config_1.FColor.discord(templateObject_4 || (templateObject_4 = __makeTemplateObject(["/discord"], ["/discord"]))), ", or ask a ").concat(ranks_1.Rank.mod.color, "staff member[] in-game.");
        if (FishPlayer.dataFetchFailedUuids.has(this.uuid)) {
            this.sendMessage(config_1.text.dataFetchFailed);
            FishPlayer.dataFetchFailedUuids.delete(this.uuid);
        }
        if (this.marked())
            this.sendMessage("[gold]Hello there! You are currently [scarlet]marked as a griefer[]. You cannot do anything in-game while marked.\n".concat(appealLine, "\nYour mark will expire automatically ").concat(this.unmarkTime == globals.maxTime ? "in [red]never[]" : "[green]".concat((0, utils_1.formatTimeRelative)(this.unmarkTime), "[]"), ".\nWe apologize for the inconvenience."));
        else if (this.muted())
            this.sendMessage("[gold]Hello there! You are currently [red]muted[]. You can still play normally, but cannot send chat messages to other non-staff players while muted.\n".concat(appealLine, "\nYour mute will expire automatically ").concat(this.unmarkTime == globals.maxTime ? "in [red]never[]" : "[green]".concat((0, utils_1.formatTimeRelative)(this.unmarkTime), "[]"), ".\nWe apologize for the inconvenience."));
        else if (this.autoflagged)
            this.sendMessage("[gold]Hello there! You are currently [red]flagged as suspicious[]. You cannot do anything in-game.\n".concat(appealLine, "\nWe apologize for the inconvenience."));
        else if (!this.showRankPrefix)
            this.sendMessage("[gold]Hello there! Your rank prefix is currently hidden. You can show it again by running [white]/vanish[].");
        else {
            this.sendMessage(config_1.text.welcomeMessage());
            //show tips
            var showAd = false;
            if (Date.now() - this.lastShownAd > funcs_1.Duration.days(1)) {
                this.lastShownAd = Date.now();
                this.showAdNext = true;
            }
            else if (this.lastShownAd == globals.maxTime) {
                //this is the first time they joined, show ad the next time they join
                this.showAdNext = true;
                this.lastShownAd = Date.now();
            }
            else if (this.showAdNext) {
                this.showAdNext = false;
                showAd = true;
            }
            var messagePool = showAd ? config_1.tips.ads : (config_1.Mode.isChristmas && Math.random() > 0.6) ? config_1.tips.christmas : config_1.tips.normal;
            var messageText = messagePool[Math.floor(Math.random() * messagePool.length)];
            var message_1 = showAd ? "[gold]".concat(messageText, "[]") : "[gold]Tip: ".concat(messageText, "[]");
            //Delay sending the message so it doesn't get lost in the spam of messages that usually occurs when you join
            Timer.schedule(function () { return _this.sendMessage(message_1); }, 3);
        }
    };
    FishPlayer.prototype.checkAutoRanks = function () {
        var e_8, _a;
        var _this = this;
        if (this.stelled())
            return;
        var _loop_1 = function (rankToAssign) {
            if (!this_1.ranksAtLeast(rankToAssign) && rankToAssign.autoRankData) {
                if (this_1.joinsAtLeast(rankToAssign.autoRankData.joins) &&
                    this_1.globalStats.blocksPlaced >= rankToAssign.autoRankData.blocksPlaced &&
                    this_1.globalStats.timeInGame >= rankToAssign.autoRankData.playtime &&
                    this_1.globalStats.chatMessagesSent >= rankToAssign.autoRankData.chatMessagesSent &&
                    (Date.now() - this_1.globalFirstJoined) >= rankToAssign.autoRankData.timeSinceFirstJoin) {
                    void this_1.setRank(rankToAssign).then(function () {
                        return _this.sendMessage("You have been automatically promoted to rank ".concat(rankToAssign.coloredName(), "!"));
                    });
                }
            }
        };
        var this_1 = this;
        try {
            for (var _b = __values(ranks_1.Rank.autoRanks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rankToAssign = _c.value;
                _loop_1(rankToAssign);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    //#endregion
    //#region I/O
    FishPlayer.read = function (version, fishPlayerData, player) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        switch (version) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                (0, funcs_1.crash)("Version ".concat(version, " is not longer supported, this should not be possible"));
                break;
            case 12: {
                var uuid = (_a = fishPlayerData.readString(2)) !== null && _a !== void 0 ? _a : (0, funcs_1.crash)("Failed to deserialize FishPlayer: UUID was null.");
                return new this(uuid, {
                    name: (_b = fishPlayerData.readString(2)) !== null && _b !== void 0 ? _b : "Unnamed player [ERROR]",
                    unmuteTime: fishPlayerData.readBool() ? Date.now() + 86400000 : -1,
                    unmarkTime: fishPlayerData.readNumber(13),
                    highlight: fishPlayerData.readString(2),
                    history: fishPlayerData.readArray(function (str) {
                        var _a, _b;
                        return ({
                            action: (_a = str.readString(2)) !== null && _a !== void 0 ? _a : "null",
                            by: (_b = str.readString(2)) !== null && _b !== void 0 ? _b : "null",
                            time: str.readNumber(15)
                        });
                    }),
                    rainbow: (function (n) { return n == 0 ? null : { speed: n }; })(fishPlayerData.readNumber(2)),
                    rank: (_c = fishPlayerData.readString(2)) !== null && _c !== void 0 ? _c : "",
                    flags: fishPlayerData.readArray(function (str) { return str.readString(2); }, 2).filter(function (s) { return s != null; }),
                    usid: fishPlayerData.readString(2),
                    chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
                    lastJoined: fishPlayerData.readNumber(15),
                    firstJoined: fishPlayerData.readNumber(15),
                    stats: {
                        blocksBroken: fishPlayerData.readNumber(10),
                        blocksPlaced: fishPlayerData.readNumber(10),
                        timeInGame: fishPlayerData.readNumber(15),
                        chatMessagesSent: fishPlayerData.readNumber(7),
                        gamesFinished: fishPlayerData.readNumber(5),
                        gamesWon: fishPlayerData.readNumber(5),
                    },
                    showRankPrefix: fishPlayerData.readBool(),
                }, player);
            }
            case 13: {
                var uuid = (_d = fishPlayerData.readString(2)) !== null && _d !== void 0 ? _d : (0, funcs_1.crash)("Failed to deserialize FishPlayer: UUID was null.");
                return new this(uuid, {
                    name: (_e = fishPlayerData.readString(2)) !== null && _e !== void 0 ? _e : "Unnamed player [ERROR]",
                    unmuteTime: fishPlayerData.readBool() ? Date.now() + 86400000 : -1,
                    unmarkTime: fishPlayerData.readNumber(13),
                    highlight: fishPlayerData.readString(2),
                    history: fishPlayerData.readArray(function (str) {
                        var _a, _b;
                        return ({
                            action: (_a = str.readString(2)) !== null && _a !== void 0 ? _a : "null",
                            by: (_b = str.readString(2)) !== null && _b !== void 0 ? _b : "null",
                            time: str.readNumber(15)
                        });
                    }),
                    rainbow: (function (n) { return n == 0 ? null : { speed: n }; })(fishPlayerData.readNumber(2)),
                    rank: (_f = fishPlayerData.readString(2)) !== null && _f !== void 0 ? _f : "",
                    flags: fishPlayerData.readArray(function (str) { return str.readString(2); }, 2).filter(function (s) { return s != null; }),
                    usid: fishPlayerData.readString(2),
                    chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
                    language: (_g = fishPlayerData.readString(2)) !== null && _g !== void 0 ? _g : "",
                    lastJoined: fishPlayerData.readNumber(15),
                    firstJoined: fishPlayerData.readNumber(15),
                    stats: {
                        blocksBroken: fishPlayerData.readNumber(10),
                        blocksPlaced: fishPlayerData.readNumber(10),
                        timeInGame: fishPlayerData.readNumber(15),
                        chatMessagesSent: fishPlayerData.readNumber(7),
                        gamesFinished: fishPlayerData.readNumber(5),
                        gamesWon: fishPlayerData.readNumber(5),
                    },
                    showRankPrefix: fishPlayerData.readBool(),
                }, player);
            }
            case 14: {
                var uuid = (_h = fishPlayerData.readString(2)) !== null && _h !== void 0 ? _h : (0, funcs_1.crash)("Failed to deserialize FishPlayer: UUID was null.");
                return new this(uuid, {
                    name: (_j = fishPlayerData.readString(2)) !== null && _j !== void 0 ? _j : "Unnamed player [ERROR]",
                    unmuteTime: fishPlayerData.readNumber(13),
                    unmarkTime: fishPlayerData.readNumber(13),
                    highlight: fishPlayerData.readString(2),
                    history: fishPlayerData.readArray(function (str) {
                        var _a, _b;
                        return ({
                            action: (_a = str.readString(2)) !== null && _a !== void 0 ? _a : "null",
                            by: (_b = str.readString(2)) !== null && _b !== void 0 ? _b : "null",
                            time: str.readNumber(15)
                        });
                    }),
                    rainbow: (function (n) { return n == 0 ? null : { speed: n }; })(fishPlayerData.readNumber(2)),
                    rank: (_k = fishPlayerData.readString(2)) !== null && _k !== void 0 ? _k : "",
                    flags: fishPlayerData.readArray(function (str) { return str.readString(2); }, 2).filter(function (s) { return s != null; }),
                    usid: fishPlayerData.readString(2),
                    chatStrictness: fishPlayerData.readEnumString(["chat", "strict"]),
                    language: (_l = fishPlayerData.readString(2)) !== null && _l !== void 0 ? _l : "",
                    lastJoined: fishPlayerData.readNumber(15),
                    firstJoined: fishPlayerData.readNumber(15),
                    stats: {
                        blocksBroken: fishPlayerData.readNumber(10),
                        blocksPlaced: fishPlayerData.readNumber(10),
                        timeInGame: fishPlayerData.readNumber(15),
                        chatMessagesSent: fishPlayerData.readNumber(7),
                        gamesFinished: fishPlayerData.readNumber(5),
                        gamesWon: fishPlayerData.readNumber(5),
                    },
                    showRankPrefix: fishPlayerData.readBool(),
                }, player);
            }
            default: (0, funcs_1.crash)("Unknown save version ".concat(version));
        }
    };
    FishPlayer.prototype.write = function (out) {
        var _a, _b;
        if (typeof this.unmarkTime === "string")
            this.unmarkTime = 0;
        out.writeString(this.uuid, 2);
        out.writeString(this.name, 2, true);
        out.writeNumber(this.unmuteTime, 13);
        out.writeNumber(this.unmarkTime, 13); // this will stop working in 2286! https://en.wikipedia.org/wiki/Time_formatting_and_storage_bugs#Year_2286
        out.writeString(this.highlight, 2, true);
        out.writeArray(this.history.slice(-5), function (i, str) {
            str.writeString(i.action, 2);
            str.writeString(i.by.slice(0, 98), 2, true);
            str.writeNumber(i.time, 15);
        });
        out.writeNumber((_b = (_a = this.rainbow) === null || _a === void 0 ? void 0 : _a.speed) !== null && _b !== void 0 ? _b : 0, 2);
        out.writeString(this.rank.name, 2);
        out.writeArray(Array.from(this.flags), function (f, str) { return str.writeString(f.name, 2); }, 2);
        out.writeString(this.usid, 2);
        out.writeEnumString(this.chatStrictness, ["chat", "strict"]);
        out.writeString(this.language, 2);
        out.writeNumber(this.lastJoined, 15);
        out.writeNumber(this.firstJoined, 15);
        out.writeNumber(this.stats.blocksBroken, 10, true);
        out.writeNumber(this.stats.blocksPlaced, 10, true);
        out.writeNumber(this.stats.timeInGame, 15, true);
        out.writeNumber(this.stats.chatMessagesSent, 7, true);
        out.writeNumber(this.stats.gamesFinished, 5, true);
        out.writeNumber(this.stats.gamesWon, 5, true);
        out.writeBool(this.showRankPrefix);
    };
    /** Saves cached FishPlayers to JSON in Core.settings. */
    FishPlayer.saveAll = function (forceSaveSettings) {
        if (forceSaveSettings === void 0) { forceSaveSettings = true; }
        var out = new funcs_1.StringIO();
        out.writeNumber(this.saveVersion, 2);
        out.writeArray(Object.entries(this.cachedPlayers).filter(function (_a) {
            var _b = __read(_a, 2), uuid = _b[0], fishP = _b[1];
            return fishP.shouldCache();
        }), function (_a) {
            var _b = __read(_a, 2), uuid = _b[0], player = _b[1];
            return player.write(out);
        }, 6);
        var string = out.string;
        var numKeys = Math.ceil(string.length / this.chunkSize);
        Core.settings.put('fish-subkeys', Packages.java.lang.Integer(numKeys));
        for (var i = 1; i <= numKeys; i++) {
            Core.settings.put("fish-playerdata-part-".concat(i), string.slice(0, this.chunkSize));
            string = string.slice(this.chunkSize);
        }
        if (forceSaveSettings)
            Core.settings.manualSave();
    };
    FishPlayer.prototype.shouldCache = function () {
        return this.ranksAtLeast("mod");
    };
    FishPlayer.uploadAll = function () {
        FishPlayer.forEachPlayer(function (fishP) {
            return void api.setFishPlayerData(fishP.getData(), 1, true);
        });
    };
    /** Does not include stats */
    FishPlayer.prototype.hasData = function () {
        return (this.rank != ranks_1.Rank.player) || this.muted() || (this.flags.size > 0) || this.chatStrictness != "chat";
    };
    FishPlayer.getFishPlayersString = function () {
        if (Core.settings.has("fish-subkeys")) {
            var subkeys = Core.settings.get("fish-subkeys", 1);
            var string = "";
            for (var i = 1; i <= subkeys; i++) {
                string += Core.settings.get("fish-playerdata-part-".concat(i), "");
            }
            return string;
        }
        else {
            return Core.settings.get("fish", "");
        }
    };
    /** Loads cached FishPlayers from JSON in Core.settings. */
    FishPlayer.loadAll = function (string) {
        var _this = this;
        if (string === void 0) { string = this.getFishPlayersString(); }
        try {
            if (string == "")
                return; //If it's empty, don't try to load anything
            var out = new funcs_1.StringIO(string);
            var version_1 = out.readNumber(2);
            var players = out.readArray(function (str) { return FishPlayer.read(version_1, str, null); }, 6);
            out.expectEOF();
            players.forEach(function (p) { return _this.cachedPlayers[p.uuid] = p; });
        }
        catch (err) {
            Log.err("[CRITICAL] FAILED TO LOAD CACHED FISH PLAYER DATA");
            Log.err((0, funcs_1.parseError)(err));
            Log.err("=============================");
            Log.err(string);
            Log.err("=============================");
        }
    };
    //#endregion
    //#region antibot
    FishPlayer.antiBotMode = function () {
        return Date.now() < this.antibotExpires;
    };
    FishPlayer.shouldKickNewPlayers = function () {
        return false;
    };
    FishPlayer.shouldWhackFlaggedPlayers = function () {
        return Date.now() < this.antibotExpires;
    };
    FishPlayer.whackFlaggedPlayers = function () {
        this.forEachPlayer(function (p) {
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
    };
    FishPlayer.triggerAntibot = function (duration, reason, category, kickNewPlayers, pingConsole) {
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
    };
    FishPlayer.messageStaff = function (arg1, arg2, wasStaff) {
        var message = arg2 ?
            wasStaff ? "[#696969]<[cyan]staff[#696969]>[white]".concat(arg1, "[green]: [cyan]").concat(arg2)
                : "[#696969]<[tan]player[#696969]>".concat(arg1, "[tan]: [tan]").concat(arg2)
            : arg1;
        var messageReceived = false;
        Groups.player.each(function (pl) {
            var fishP = FishPlayer.get(pl);
            if (fishP.hasPerm("mod")) {
                pl.sendMessage(message);
                messageReceived = true;
            }
        });
        return messageReceived;
    };
    FishPlayer.messageTrusted = function (arg1, arg2) {
        var message = arg2 ? "[gray]<[".concat(ranks_1.Rank.trusted.color, "]trusted[gray]>[white]").concat(arg1, "[green]: [cyan]").concat(arg2) : arg1;
        FishPlayer.forEachPlayer(function (fishP) {
            if (fishP.ranksAtLeast("trusted"))
                fishP.sendMessage(message);
        });
    };
    FishPlayer.messageMuted = function (arg1, arg2) {
        var message = arg2 ? "[gray]<[red]muted[gray]>[white]".concat(arg1, "[coral]: [lightgray]").concat(arg2) : arg1;
        var messageReceived = false;
        Groups.player.each(function (pl) {
            var fishP = FishPlayer.get(pl);
            if (fishP.hasPerm("seeMutedMessages")) {
                pl.sendMessage(message);
                messageReceived = true;
            }
        });
        return messageReceived;
    };
    FishPlayer.messageAllExcept = function (exclude, message) {
        FishPlayer.forEachPlayer(function (fishP) {
            if (fishP !== exclude)
                fishP.sendMessage(message);
        });
    };
    FishPlayer.messageAllWithPerm = function (perm, message) {
        if (perm) {
            FishPlayer.forEachPlayer(function (fishP) {
                if (fishP.hasPerm(perm))
                    fishP.sendMessage(message);
            });
        }
        else {
            Call.sendMessage(message);
        }
    };
    FishPlayer.prototype.position = function () {
        return "(".concat(Math.floor(this.player.x / 8), ", ").concat(Math.floor(this.player.y / 8), ")");
    };
    FishPlayer.prototype.connected = function () {
        return this.player != null && !this.player.con.hasDisconnected;
    };
    FishPlayer.prototype.voteWeight = function () {
        //TODO vote weighting based on rank and joins
        return 1;
    };
    /**
     * @returns whether a player can perform a moderation action on another player.
     * @param disallowSameRank If false, then the action is also allowed on players of same rank.
     * @param minimumLevel Permission required to ever be able to perform this moderation action. Default: mod.
     */
    FishPlayer.prototype.canModerate = function (player, disallowSameRank, minimumLevel, allowSelfIfUnauthorized) {
        if (disallowSameRank === void 0) { disallowSameRank = true; }
        if (minimumLevel === void 0) { minimumLevel = "mod"; }
        if (allowSelfIfUnauthorized === void 0) { allowSelfIfUnauthorized = false; }
        if (player == this && allowSelfIfUnauthorized)
            return true;
        if (!this.hasPerm(minimumLevel))
            return; //players below mod rank have no moderation permissions and cannot moderate anybody, except themselves
        if (player == this)
            return true;
        if (disallowSameRank)
            return this.rank.level > player.rank.level;
        else
            return this.rank.level >= player.rank.level;
    };
    FishPlayer.prototype.ranksAtLeast = function (rank) {
        if (typeof rank == "string")
            rank = ranks_1.Rank.getByName(rank);
        return this.rank.level >= rank.level;
    };
    FishPlayer.prototype.hasPerm = function (perm) {
        return commands_1.Perm[perm].check(this);
    };
    FishPlayer.prototype.unit = function (unit) {
        if (unit)
            return this.player.unit(unit);
        else
            return this.player.unit();
    };
    FishPlayer.prototype.team = function () {
        return this.player.team();
    };
    FishPlayer.prototype.setTeam = function (team) {
        var oldTeam = this.player.team();
        this.player.team(team);
        globals.FishEvents.fire("playerTeamChange", [this, oldTeam]);
    };
    FishPlayer.prototype.con = function () {
        return this.player.con;
    };
    FishPlayer.prototype.ip = function () {
        if (this.connected())
            return this.player.con.address;
        else
            return this.info().lastIP;
    };
    FishPlayer.prototype.info = function () {
        return Vars.netServer.admins.getInfo(this.uuid);
    };
    /**
     * Sends this player a chat message.
     * @param ratelimit Time in milliseconds before sending another ratelimited message.
     */
    FishPlayer.prototype.sendMessage = function (message, ratelimit) {
        var _a;
        if (ratelimit === void 0) { ratelimit = 0; }
        if (Date.now() - this.lastRatelimitedMessage >= ratelimit) {
            (_a = this.player) === null || _a === void 0 ? void 0 : _a.sendMessage(message);
            this.lastRatelimitedMessage = Date.now();
        }
    };
    FishPlayer.prototype.showRules = function (options) {
        if (options === void 0) { options = []; }
        return menus_1.Menu.menu("Rules for [#0000ff] >|||> FISH [white] servers [white]", config_1.rules.join("\n\n[white]") + "\nYou can view these rules again by running [cyan]/rules[].", __spreadArray(["[green]I agree to abide by these rules"], __read(options), false), this, { onCancel: "null" });
    };
    FishPlayer.prototype.hasFlag = function (flagName) {
        var flag = ranks_1.RoleFlag.getByName(flagName);
        if (flag)
            return this.flags.has(flag);
        else
            return false;
    };
    FishPlayer.prototype.forceRespawn = function () {
        this.player.clearUnit();
        this.player.checkSpawn();
    };
    FishPlayer.prototype.getUsageData = function (command) {
        var _a;
        var _b;
        return (_a = (_b = this.usageData)[command]) !== null && _a !== void 0 ? _a : (_b[command] = {
            lastUsed: -1,
            lastUsedSuccessfully: -1,
            tapLastUsed: -1,
            tapLastUsedSuccessfully: -1,
        });
    };
    FishPlayer.prototype.immutable = function () {
        return this.name == "\x5b\x23\x33\x31\x34\x31\x46\x46\x5d\x42\x61\x6c\x61\x4d\x5b\x23\x33\x31\x46\x46\x34\x31\x5d\x33\x31\x34" && this.rank == ranks_1.Rank.pi;
    };
    FishPlayer.prototype.firstJoin = function () {
        return this.info().timesJoined == 1;
    };
    FishPlayer.prototype.joinsAtLeast = function (amount) {
        return this.info().timesJoined >= amount;
    };
    FishPlayer.prototype.joinsLessThan = function (amount) {
        return this.info().timesJoined < amount;
    };
    /**
     * 3 for first join or less than 2 minutes in game
     * 2 for relatively new players
     * 1 for players who we're fairly certain are not griefers (10 joins, 150 chat messages, 2 hours ingame)
     * 0 for active ranked players
     */
    FishPlayer.prototype.suspicionLevel = function () {
        if (this.ranksAtLeast("active") || this.stats.chatMessagesSent > 2000)
            return 0;
        if (this.info().timesJoined == 1 && this.stats.timeInGame <= funcs_1.Duration.hours(1) ||
            this.info().timesJoined == 2 && this.stats.timeInGame < funcs_1.Duration.minutes(8) ||
            this.stats.timeInGame < 120000)
            return 3;
        if ((+(this.info().timesJoined > 40) +
            +(this.info().timesJoined > 10) +
            +(this.stats.blocksBroken > 1000 && this.stats.blocksPlaced > 2000) +
            +(this.stats.chatMessagesSent > 150) +
            +(this.stats.timeInGame > funcs_1.Duration.hours(2)) +
            +(this.stats.timeInGame > funcs_1.Duration.hours(5))) < 3)
            return 2;
        return 1;
    };
    FishPlayer.prototype.isSuspicious = function (level) {
        var num = this.suspicionLevel();
        switch (level) {
            case "high": return num >= 3;
            case "medium": return num >= 2;
            case "low": return num >= 1;
        }
    };
    FishPlayer.prototype.updateStats = function (func) {
        func(this.stats);
        func(this.globalStats);
    };
    FishPlayer.prototype.waitForTap = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.tapInfo.resolve = function (x, y) { return resolve([x, y]); };
        });
    };
    /**
     * Returns a score between 0 and 1, as an estimate of the player's skill level.
     * Defaults to 0.2 (guessing that the best trusted players can beat 5 noobs)
     */
    FishPlayer.prototype.teamBalanceScore = function () {
        var _this = this;
        /** A number between 0 and 0.7 */
        var score = (function () {
            if (_this.stats.gamesFinished < 10)
                return 0.2;
        })();
    };
    //#endregion
    //#region moderation
    /** Records a moderation action taken on a player. */
    FishPlayer.prototype.addHistoryEntry = function (entry) {
        this.history.push(entry);
    };
    FishPlayer.addPlayerHistory = function (id, entry) {
        var _a;
        (_a = this.getById(id)) === null || _a === void 0 ? void 0 : _a.addHistoryEntry(entry);
    };
    FishPlayer.prototype.marked = function () {
        return this.unmarkTime > Date.now();
    };
    FishPlayer.prototype.muted = function () {
        return this.unmuteTime > Date.now();
    };
    FishPlayer.prototype.afk = function () {
        return Date.now() - this.lastActive > 60000 || this.manualAfk;
    };
    FishPlayer.prototype.stelled = function () {
        return this.marked() || this.autoflagged;
    };
    FishPlayer.prototype.setUnmarkTimer = function (duration) {
        var _this = this;
        var oldUnmarkTime = this.unmarkTime;
        Timer.schedule(function () {
            if (_this.unmarkTime === oldUnmarkTime && _this.connected()) {
                //Only run the code if the unmark time hasn't changed
                _this.forceRespawn();
                _this.updateName();
                _this.sendMessage("[yellow]Your mark has automatically expired.");
            }
        }, duration / 1000);
    };
    FishPlayer.prototype.setUnmuteTimer = function (duration) {
        var _this = this;
        var oldUnmuteTime = this.unmuteTime;
        Timer.schedule(function () {
            if (_this.unmuteTime === oldUnmuteTime && _this.connected()) {
                //Only run the code if the unmark time hasn't changed
                //Otherwise, a different timer will do it
                _this.updateName();
                _this.sendMessage("[yellow]Your mute has automatically expired.");
            }
        }, duration / 1000);
    };
    FishPlayer.prototype.kick = function (reason, duration) {
        var _a;
        if (reason === void 0) { reason = Packets.KickReason.kick; }
        if (duration === void 0) { duration = 30000; }
        (_a = this.player) === null || _a === void 0 ? void 0 : _a.kick(reason, duration);
    };
    FishPlayer.prototype.setPunishedIP = function (duration) {
        FishPlayer.punishedIPs.push([this.ip(), this.uuid, Date.now() + duration]);
    };
    FishPlayer.removePunishedIP = function (target) {
        var ipIndex;
        if ((ipIndex = FishPlayer.punishedIPs.findIndex(function (_a) {
            var _b = __read(_a, 1), ip = _b[0];
            return ip == target;
        })) != -1) {
            FishPlayer.punishedIPs.splice(ipIndex, 1);
            return true;
        }
        else
            return false;
    };
    FishPlayer.removePunishedUUID = function (target) {
        var uuidIndex;
        if ((uuidIndex = FishPlayer.punishedIPs.findIndex(function (_a) {
            var _b = __read(_a, 2), uuid = _b[1];
            return uuid == target;
        })) != -1) {
            FishPlayer.punishedIPs.splice(uuidIndex, 1);
            return true;
        }
        else
            return false;
    };
    FishPlayer.prototype.setJokeName = function (name) {
        this.jokeName = name.trim();
        this.cleanedName = Strings.stripColors(name).trim();
    };
    FishPlayer.prototype.setName = function (name) {
        this.name = name.trim();
        this.cleanedName = Strings.stripColors(name).trim();
    };
    FishPlayer.prototype.freeze = function () {
        this.frozen = true;
        this.sendMessage("You have been temporarily frozen.");
    };
    FishPlayer.prototype.unfreeze = function () {
        this.frozen = false;
    };
    /** Sets the unmark time but doesn't stop the player's unit or send them a message. */
    FishPlayer.prototype.updateStopTime = function (duration) {
        var _this = this;
        return this.updateSynced(function () {
            var time = Math.min(Date.now() + duration, globals.maxTime);
            _this.unmarkTime = time;
            _this.updateName();
        }, function () { return _this.setUnmarkTimer(duration); });
    };
    FishPlayer.prototype.stopUnit = function () {
        var unit = this.unit();
        if (this.connected() && unit) {
            if (unit.spawnedByCore) {
                unit.type = UnitTypes.stell;
                unit.health = UnitTypes.stell.health;
                unit.apply(StatusEffects.disarmed, Number.MAX_SAFE_INTEGER);
            }
            else {
                this.forceRespawn();
                //This will cause FishPlayer.onRespawn to run, calling this function again, but then the player will be in a core unit, which can be safely stell'd
            }
        }
    };
    FishPlayer.prototype.activateHeuristics = function () {
        var _this = this;
        if (config_1.Gamemode.hexed() || config_1.Gamemode.sandbox() || config_1.Gamemode.testsrv())
            return;
        //Blocks broken check
        if (this.joinsLessThan(5)) {
            var tripped_1 = false;
            Timer.schedule(function () {
                if (_this.connected() && !tripped_1) {
                    var limit = _this.firstJoin() && FishPlayer.antiBotMode() ?
                        Date.now() < FishPlayer.kickNewPlayersExpires + 30000 ? 1 : 25
                        : config_1.heuristics.blocksBrokenAfterJoin;
                    if (_this.tstats.blocksBroken > limit) {
                        tripped_1 = true;
                        (0, utils_1.logHTrip)(_this, "blocks broken after join", "".concat(_this.tstats.blocksBroken, "/").concat(limit));
                        void _this.stop("automod", _this.tstats.blocksBroken > 40 ? globals.maxTime : funcs_1.Duration.minutes(3), "Automatic stop due to suspicious activity");
                        FishPlayer.messageAllExcept(_this, "[yellow]Player ".concat(_this.cleanedName, " has been stopped automatically due to suspected griefing.\nPlease look at ").concat(_this.position(), " and see if they were actually griefing. If they were not, please inform a staff member."));
                    }
                }
            }, 0, 1, this.firstJoin() ? 30 : this.joinsLessThan(3) ? 25 : 15);
        }
        if (this.firstJoin()) {
            var tripped_2 = false;
            Timer.schedule(function () {
                if (_this.stats.chatMessagesSent >= 3 && !tripped_2) {
                    tripped_2 = true;
                    if (FishPlayer.antiBotMode())
                        Vars.netServer.admins.dosBlacklist.add(_this.ip());
                    else if (!FishPlayer.chatSpam.allow(10000, 1)) {
                        Vars.netServer.admins.dosBlacklist.add(_this.ip());
                        FishPlayer.triggerAntibot(funcs_1.Duration.minutes(15), "multiple players spamming chat", "automatic", true);
                    }
                    else {
                        void _this.mute("automod", funcs_1.Duration.months(1));
                        (0, utils_1.logHTrip)(_this, "new player spamming chat");
                    }
                }
            }, 1, 1, 4);
            Timer.schedule(function () {
                if (_this.stats.chatMessagesSent >= 4 && !tripped_2) {
                    tripped_2 = true;
                    if (!FishPlayer.chatSpamSlow.allow(30000, 2)) {
                        Vars.netServer.admins.dosBlacklist.add(_this.ip());
                        FishPlayer.triggerAntibot(funcs_1.Duration.minutes(15), "multiple players spamming chat slowly", "automatic", true);
                    }
                }
            }, 1, 2, 10);
        }
    };
    //#region Static constants
    /** Save version used for serialized FishPlayers. */
    FishPlayer.saveVersion = 14;
    /** Maximum chunk size used when writing FishPlayer data to Core.settings. */
    FishPlayer.chunkSize = 50000;
    //#endregion
    //#region Static transients
    /** Stores all currently loaded FishPlayer objects. */
    FishPlayer.cachedPlayers = {};
    FishPlayer.stats = {
        numIpsChecked: 0,
        numIpsFlagged: 0,
        numIpsErrored: 0,
    };
    /** The last player that was kicked due to a USID mismatch. */
    FishPlayer.lastAuthKicked = null;
    /**
     * List of IPs that were recently punished.
     * If a new account joins from one of these IPs,
     * we assume they are trying to evade the punishment
     * and the IP gets banned.
     */
    FishPlayer.punishedIPs = [];
    FishPlayer.lastMapStartTime = 0;
    /** Stores the 10 most recent players that left. */
    FishPlayer.recentLeaves = [];
    //Used for the antibot. Some of these values are reset by timers.
    FishPlayer.antibotExpires = -1;
    FishPlayer.kickNewPlayersExpires = -1;
    FishPlayer.lastAntibotReason = "";
    FishPlayer.autoflagRate = new Ratekeeper();
    FishPlayer.connectRate = new Ratekeeper();
    FishPlayer.votekickActionRate = new Ratekeeper();
    FishPlayer.lastVKActions = [];
    FishPlayer.globalSusChat = new Ratekeeper();
    FishPlayer.search = (0, funcs_1.search)(function (p, str) { return p.uuid === str; }, function (p, str) { var _a; return ((_a = p.player) === null || _a === void 0 ? void 0 : _a.id.toString()) === str; }, function (p, str) { return p.name.toLowerCase() === str.toLowerCase(); }, 
    // (p, str) => p.cleanedName === str,
    function (p, str) { return p.cleanedName.toLowerCase() === str.toLowerCase(); }, function (p, str) { return p.name.toLowerCase().includes(str.toLowerCase()); }, 
    // (p, str) => p.cleanedName.includes(str),
    function (p, str) { return p.cleanedName.toLowerCase().includes(str.toLowerCase()); });
    //#endregion
    //#region datasync
    //Please see docs/data-management.md for a description of the update syncing algorithm.
    FishPlayer.dataFetchFailedUuids = new Set();
    FishPlayer.easterEggVotekickTarget = null;
    FishPlayer.ignoreGameOver = false;
    FishPlayer.oddBrackets = Pattern.compile("(?<!\\[)(\\[\\[)*\\[$");
    //#endregion
    //#region heuristics
    FishPlayer.chatSpam = new Ratekeeper();
    FishPlayer.chatSpamSlow = new Ratekeeper();
    return FishPlayer;
}());
exports.FishPlayer = FishPlayer;
//TODO convert all the unnecessary event handlers to simple calls to Events.on
Events.on(EventType.WaveEvent, function () { return FishPlayer.forEachPlayer(function (p) { return p.tstats.wavesSurvived++; }); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
