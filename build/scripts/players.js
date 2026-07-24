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
var automod_1 = require("/automod");
var config_1 = require("/config");
var commands_1 = require("/frameworks/commands");
var menus_1 = require("/frameworks/menus");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var maps_1 = require("/maps");
var ranks_1 = require("/ranks");
var utils_1 = require("/utils");
var FishPlayer = /** @class */ (function () {
    //#endregion
    function FishPlayer(uuid, data, player) {
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
        /** Used to freeze players temporarily. */
        this.frozen = false;
        /** Used to avoid spamming players with ads by the tip message system */
        this.lastShownAd = globals_1.maxTime;
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
        this.isImpersonator = false;
        this.joinedAlready = false;
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
        this.isImpersonator = false;
        this.tstats.blocksBroken = 0;
        if (this.tstats.lastMapPlayedTime != globals_1.fishState.lastMapStartTime) {
            this.tstats.blockInteractionsThisMap = 0;
            this.tstats.lastMapPlayedTime = globals_1.fishState.lastMapStartTime;
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
        if (unmarkTime > globals_1.maxTime)
            unmarkTime = globals_1.maxTime;
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
        automod_1.Automod.removePunishedIP(this.ip());
        automod_1.Automod.removePunishedUUID(this.uuid);
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
        if (unmuteTime > globals_1.maxTime)
            unmuteTime = globals_1.maxTime;
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
        automod_1.Automod.removePunishedIP(this.ip());
        automod_1.Automod.removePunishedUUID(this.uuid);
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
                    fishPlayer.isImpersonator = true;
                }
                else if ((0, utils_1.cleanText)(player.name, true).includes("hacker")) {
                    fishPlayer.sendMessage("[scarlet]\u26A0 Don't be a script kiddie!");
                    globals_1.FishEvents.fire("scriptKiddie", [fishPlayer]);
                }
            }
            fishPlayer.updateName();
            fishPlayer.updateAdminStatus();
            (0, automod_1.checkVPNAndJoins)(fishPlayer);
            //I think this is a better spot for this
            if (fishPlayer.firstJoin())
                void fishPlayer.showRules();
        }
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
        fishP.dataSynced = false;
        var currentRun = (_a = maps_1.PartialMapRun.current) === null || _a === void 0 ? void 0 : _a.startTime;
        if (currentRun)
            Core.app.post(function () {
                //Wait for the /spectate command's handler to fix their team before saving it
                fishP.restoreTeam = [fishP.player.team(), Date.now(), currentRun];
            });
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
        var e_3, _a;
        var _b;
        if (!this.connected())
            return; //No player, no need to update
        var name = (_b = this.jokeName) !== null && _b !== void 0 ? _b : this.name;
        if (this.marked())
            this.showRankPrefix = true;
        var prefix = '';
        if (!this.hasPerm("bypassNameCheck") && (0, utils_1.isImpersonator)(name, this.ranksAtLeast("admin")))
            prefix += config_1.prefixes.impersonator;
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
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
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
    FishPlayer.prototype.validate = function () {
        return this.checkName() && this.checkUsid() && automod_1.Automod.checkAntiEvasion(this);
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
        var appealLine = "To appeal, ".concat(config_1.FColor.discord(templateObject_1 || (templateObject_1 = __makeTemplateObject(["join our discord"], ["join our discord"]))), " with ").concat(config_1.FColor.discord(templateObject_2 || (templateObject_2 = __makeTemplateObject(["/discord"], ["/discord"]))), ", or ask a ").concat(ranks_1.Rank.mod.color, "staff member[] in-game.");
        if (FishPlayer.dataFetchFailedUuids.has(this.uuid)) {
            this.sendMessage(config_1.text.dataFetchFailed);
            FishPlayer.dataFetchFailedUuids.delete(this.uuid);
        }
        if (this.marked())
            this.sendMessage("[gold]Hello there! You are currently [scarlet]marked as a griefer[]. You cannot do anything in-game while marked.\n".concat(appealLine, "\nYour mark will expire automatically ").concat(globals_1.maxTime - this.unmarkTime < 60000 ? "in [red]never[]" : "[green]".concat((0, utils_1.formatTimeRelative)(this.unmarkTime), "[]"), ".\nWe apologize for the inconvenience."));
        else if (this.muted())
            this.sendMessage("[gold]Hello there! You are currently [red]muted[]. You can still play normally, but cannot send chat messages to other non-staff players while muted.\n".concat(appealLine, "\nYour mute will expire automatically ").concat(globals_1.maxTime - this.unmarkTime < 60000 ? "in [red]never[]" : "[green]".concat((0, utils_1.formatTimeRelative)(this.unmuteTime), "[]"), ".\nWe apologize for the inconvenience."));
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
            else if (this.lastShownAd == globals_1.maxTime) {
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
        var e_4, _a;
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
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
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
        globals_1.FishEvents.fire("playerTeamChange", [this, oldTeam]);
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
        return this.marked() || this.autoflagged || this.frozen;
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
        automod_1.Automod.punishedIPs.push([this.ip(), this.uuid, Date.now() + duration]);
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
        var time = Math.min(Date.now() + duration, globals_1.maxTime);
        return this.updateSynced(function () {
            _this.unmarkTime = time;
            _this.updateName();
        }, function () { return _this.setUnmarkTimer(duration); });
    };
    /** Sets the unmute time but doesn't send a message. */
    FishPlayer.prototype.updateMuteTime = function (duration) {
        var _this = this;
        var time = Math.min(Date.now() + duration, globals_1.maxTime);
        return this.updateSynced(function () {
            _this.unmuteTime = time;
            _this.updateName();
        }, function () { return _this.setUnmuteTimer(duration); });
    };
    FishPlayer.prototype.stopUnit = function () {
        var unit = this.unit();
        if (unit) {
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
    /** Stores the 10 most recent players that left. */
    FishPlayer.recentLeaves = [];
    FishPlayer.search = (0, funcs_1.search)(function (p, str) { return p.uuid === str; }, function (p, str) { var _a; return ((_a = p.player) === null || _a === void 0 ? void 0 : _a.id.toString()) === str; }, function (p, str) { return p.name.toLowerCase() === str.toLowerCase(); }, 
    // (p, str) => p.cleanedName === str,
    function (p, str) { return p.cleanedName.toLowerCase() === str.toLowerCase(); }, function (p, str) { return p.name.toLowerCase().includes(str.toLowerCase()); }, 
    // (p, str) => p.cleanedName.includes(str),
    function (p, str) { return p.cleanedName.toLowerCase().includes(str.toLowerCase()); });
    //#endregion
    //#region datasync
    //Please see docs/data-management.md for a description of the update syncing algorithm.
    FishPlayer.dataFetchFailedUuids = new Set();
    FishPlayer.ignoreGameOver = false;
    FishPlayer.oddBrackets = Pattern.compile("(?<!\\[)(\\[\\[)*\\[$");
    return FishPlayer;
}());
exports.FishPlayer = FishPlayer;
//TODO move these to appropriately located static init blocks
Events.on(EventType.WaveEvent, function () { return FishPlayer.forEachPlayer(function (p) { return p.tstats.wavesSurvived++; }); });
Events.on(EventType.PlayerChatEvent, function (_a) {
    var player = _a.player;
    var fishP = FishPlayer.get(player);
    fishP.lastActive = Date.now();
    fishP.updateStats(function (stats) { return stats.chatMessagesSent++; });
});
Events.on(EventType.PlayerLeave, function (e) {
    FishPlayer.onPlayerLeave(e.player);
});
Events.on(EventType.UnitChangeEvent, function (e) {
    var _a;
    if ((_a = e.unit) === null || _a === void 0 ? void 0 : _a.spawnedByCore) {
        var fishP = FishPlayer.get(e.player); //must be connected
        if (fishP.stelled())
            fishP.stopUnit();
    }
});
Events.on(EventType.WorldLoadEvent, function () {
    var startTime = Date.now();
    globals_1.fishState.lastMapStartTime = startTime;
    //wait 20 seconds for players to join
    Timer.schedule(function () { return FishPlayer.forEachPlayer(function (p) { return p.tstats.lastMapStartTime = startTime; }); }, 20);
});
Events.on(EventType.GameOverEvent, function (e) {
    FishPlayer.onGameOver(e.winner);
});
var templateObject_1, templateObject_2;
