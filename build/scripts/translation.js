"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains a translation client implementation for https://github.com/TheRadioactiveBanana/translate-api-wrapper
*/
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.translationCache = exports.playerLanguageCache = exports.languageCache = void 0;
exports.initializeTranslation = initializeTranslation;
exports.handleMessage = handleMessage;
exports.setPlayerLanguageEntry = setPlayerLanguageEntry;
exports.getLanguageFromCache = getLanguageFromCache;
exports.isLanguageAvailable = isLanguageAvailable;
var config_1 = require("/config");
var players_1 = require("/players");
var utils_1 = require("/utils");
exports.languageCache = new ObjectMap();
var lastFailure = 0;
exports.playerLanguageCache = new ObjectMap();
exports.translationCache = new ObjectMap();
function initializeTranslation() {
    var _this = this;
    void fetchLanguageCache();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Events.on(EventType.PlayerJoin, function (e) { return __awaiter(_this, void 0, void 0, function () {
        var fishPlayer, language, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fishPlayer = players_1.FishPlayer.get(e.player);
                    language = getLanguageFromCache(fishPlayer.language || e.player.locale);
                    if (fishPlayer.language != language.code) {
                        fishPlayer.language = language.code;
                    }
                    if (!exports.languageCache.isEmpty()) return [3 /*break*/, 4];
                    if (Date.now() - lastFailure < 60000)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchLanguageCache()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    Log.err("Network error while fetching language cache");
                    lastFailure = Date.now();
                    return [2 /*return*/];
                case 4:
                    setPlayerLanguageEntry(e.player, language);
                    return [2 /*return*/];
            }
        });
    }); });
    Events.on(EventType.PlayerLeave, function (e) {
        removePlayerLanguageEntry(e.player);
    });
}
function handleMessage(sender, message) {
    return __awaiter(this, void 0, void 0, function () {
        var err_2, cleanedMessage, delivered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(exports.languageCache.isEmpty() && Date.now() - lastFailure > 60000)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchLanguageCache()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    Log.err("Network error while fetching language cache");
                    return [3 /*break*/, 4];
                case 4:
                    sender.sendMessage(Vars.netServer.chatFormatter.format(sender, message)); //return to sender immediately, they don't need to see their own translation
                    cleanedMessage = Strings.stripGlyphs(Strings.stripColors((0, utils_1.removeFoosChars)(message)));
                    delivered = new ObjectSet();
                    exports.playerLanguageCache.each(function (lang, players) {
                        var e_1, _a;
                        var formatted = Vars.netServer.chatFormatter.format(sender, message);
                        var recipients = uniqueRecipients(players, sender, delivered);
                        if (recipients.isEmpty())
                            return;
                        if (lang == null || lang.code === "off" || lang.code === "auto" || lang.code === "none" || config_1.translationApiToken.string() == "unset") {
                            try {
                                for (var _b = __values(recipients.toArray()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var player = _c.value;
                                    player.sendMessage(formatted);
                                } //ignore, send it as if nothing changed
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            return;
                        }
                        var cacheKey = "".concat((lang.code), "\n").concat(cleanedMessage);
                        var cachedTranslation = exports.translationCache.get(cacheKey);
                        if (cachedTranslation != null) {
                            sendTranslatedMessage(sender, message, cachedTranslation, recipients);
                            return;
                        }
                        var req = Http.post(config_1.translationApiUrl + "/api/translate", cleanedMessage);
                        req.header("from", "auto");
                        req.header("to", lang.code);
                        req.header("token", config_1.translationApiToken.string());
                        req.timeout = 2000; //low timeout to not lag chat too much
                        req.error(function (e) {
                            var e_2, _a;
                            try {
                                for (var _b = __values(recipients.toArray()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var player = _c.value;
                                    player.sendMessage(formatted);
                                } //failed, send it as if nothing changed
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            Log.err(e.getMessage());
                            if (e.response)
                                Log.err(e.response.getResultAsString());
                        });
                        req.submit(function (t) {
                            var e_3, _a;
                            var result = t.getResultAsString();
                            if (t.getStatus().code != 200 || result == message) {
                                try {
                                    for (var _b = __values(recipients.toArray()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var player = _c.value;
                                        player.sendMessage(formatted);
                                    } //bad, send it as if nothing changed
                                }
                                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_3) throw e_3.error; }
                                }
                                return;
                            }
                            exports.translationCache.put(cacheKey, result);
                            sendTranslatedMessage(sender, message, result, recipients);
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function setPlayerLanguageEntry(player, language) {
    removePlayerLanguageEntry(player);
    var bucket = exports.playerLanguageCache.get(language, function () { return new Seq(); });
    bucket.add(player);
}
function removePlayerLanguageEntry(player) {
    exports.playerLanguageCache.each(function (_, players) {
        players.remove(function (p) { return p.uuid() === player.uuid(); });
    });
}
function uniqueRecipients(players, sender, delivered) {
    var e_4, _a;
    var recipients = new Seq();
    try {
        for (var _b = __values(players.toArray()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var player = _c.value;
            var uuid = player.uuid();
            if (uuid === sender.uuid())
                continue;
            if (delivered.contains(uuid))
                continue;
            delivered.add(uuid);
            recipients.add(player);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return recipients;
}
function sendTranslatedMessage(sender, originalMessage, translatedMessage, recipients) {
    var e_5, _a;
    var formatted = Vars.netServer.chatFormatter.format(sender, originalMessage)
        + "\n[lightgray]Translated: " + translatedMessage + "[]";
    try {
        for (var _b = __values(recipients.toArray()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var player = _c.value;
            Call.sendMessage(player.con, formatted, originalMessage, sender);
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_5) throw e_5.error; }
    }
}
function getLanguageFromCache(code) {
    var normalizedCode = code.toLowerCase();
    if (normalizedCode == "none" || normalizedCode == "off") {
        return { code: "none", name: "Off" };
    }
    var language = exports.languageCache.get(normalizedCode);
    if (language != null)
        return language;
    return { code: "none", name: "Off" }; //unsupported
}
function isLanguageAvailable(code) {
    return getLanguageFromCache(code).code != "none";
}
function fetchLanguageCache() {
    return new Promise(function (resolve, reject) {
        var req = Http.get(config_1.translationApiUrl + "/api/languages");
        req.error(reject);
        req.submit(function (t) {
            var e_6, _a;
            try {
                var parsed = JSON.parse(t.getResultAsString());
                exports.languageCache.clear();
                try {
                    for (var parsed_1 = __values(parsed), parsed_1_1 = parsed_1.next(); !parsed_1_1.done; parsed_1_1 = parsed_1.next()) {
                        var language = parsed_1_1.value;
                        exports.languageCache.put(language.code.toLowerCase(), language);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (parsed_1_1 && !parsed_1_1.done && (_a = parsed_1.return)) _a.call(parsed_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
