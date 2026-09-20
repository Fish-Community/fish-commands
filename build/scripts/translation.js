"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
mostly written by @author TheRadioactiveBanana
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.translationCache = exports.playerLanguageCache = exports.languageCache = void 0;
exports.handleMessage = handleMessage;
exports.setPlayerLanguageEntry = setPlayerLanguageEntry;
exports.getLanguageFromCache = getLanguageFromCache;
exports.isLanguageAvailable = isLanguageAvailable;
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var players_1 = require("/players");
var utils_1 = require("/utils");
exports.languageCache = new ObjectMap();
var lastFailure = 0;
exports.playerLanguageCache = new ObjectMap();
/** Only modify on main thread */
exports.translationCache = new ObjectMap();
Events.on(EventType.ServerLoadEvent, function () {
    void fetchLanguageCache().catch(Log.err);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Events.on(EventType.PlayerJoin, function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var fishPlayer, language, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fishPlayer = players_1.FishPlayer.get(e.player);
                    language = getLanguageFromCache(fishPlayer.language || e.player.locale);
                    fishPlayer.language = language.code;
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
                    setPlayerLanguageEntry(e.player, language.code);
                    return [2 /*return*/];
            }
        });
    }); });
    Events.on(EventType.PlayerLeave, function (e) {
        removePlayerLanguageEntry(e.player);
    });
});
var disabledLanguages = ["off", "none", "auto"];
function handleMessage(sender, message) {
    return __awaiter(this, void 0, void 0, function () {
        var err_2, cleanedMessage, formatted, languagesToFetch, result, _a, _b, _c, lang, msg, _d;
        var e_1, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!(exports.languageCache.isEmpty() && Date.now() - lastFailure > 60000)) return [3 /*break*/, 4];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchLanguageCache()];
                case 2:
                    _f.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _f.sent();
                    Log.err("Network error while fetching language cache");
                    return [3 /*break*/, 4];
                case 4:
                    Call.sendMessage(sender.con, Vars.netServer.chatFormatter.format(sender, message), message, sender);
                    cleanedMessage = Strings.stripGlyphs(Strings.stripColors((0, utils_1.removeFoosChars)(message)));
                    formatted = Vars.netServer.chatFormatter.format(sender, message);
                    languagesToFetch = [];
                    exports.playerLanguageCache.each(function (lang, players) {
                        if (!disabledLanguages.includes(lang) &&
                            players.contains(boolf(function (p) { return p != sender && p.con.isConnected(); })) &&
                            !exports.translationCache.containsKey("".concat(lang, "\n").concat(cleanedMessage))) {
                            languagesToFetch.push(lang);
                        }
                    });
                    sendCachedTranslations(sender, message, cleanedMessage, formatted, languagesToFetch);
                    if (!languagesToFetch.length) return [3 /*break*/, 8];
                    _f.label = 5;
                case 5:
                    _f.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, requestTranslate(cleanedMessage, languagesToFetch)];
                case 6:
                    result = _f.sent();
                    sendTranslatedMessages(sender, cleanedMessage, message, formatted, result);
                    try {
                        for (_a = __values(Object.entries(result)), _b = _a.next(); !_b.done; _b = _a.next()) {
                            _c = __read(_b.value, 2), lang = _c[0], msg = _c[1];
                            exports.translationCache.put("".concat(lang, "\n").concat(cleanedMessage), msg);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return [3 /*break*/, 8];
                case 7:
                    _d = _f.sent();
                    sendNoTranslations(sender, message, cleanedMessage, formatted, languagesToFetch);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function sendCachedTranslations(sender, message, cleanedMessage, formatted, languagesToFetch) {
    players_1.FishPlayer.forEachPlayer(function (p) {
        if (p.player != sender && !languagesToFetch.includes(p.language)) {
            //Not added to the fetch list, this means it must be cached
            var cachedTranslation = exports.translationCache.get("".concat(p.language, "\n").concat(cleanedMessage));
            if (cachedTranslation != null) {
                Call.sendMessage(p.con(), formatted, message, sender);
                sendTranslatedMessage(cleanedMessage, cachedTranslation, p.player);
            }
        }
    });
}
function sendNoTranslations(sender, message, cleanedMessage, formatted, languagesToFetch) {
    players_1.FishPlayer.forEachPlayer(function (p) {
        if (p.player != sender && languagesToFetch.includes(p.language)) {
            //Wanted to fetch the translation but that failed
            //Just send the untranslated message
            Call.sendMessage(p.con(), formatted, message, sender);
        }
    });
}
function sendTranslatedMessages(sender, cleanedMessage, message, formatted, translated) {
    players_1.FishPlayer.forEachPlayer(function (p) {
        var translatedMessage = translated[p.language];
        if (p.player != sender && translated[p.language]) {
            Call.sendMessage(p.con(), formatted, message, sender);
            sendTranslatedMessage(cleanedMessage, translatedMessage, p.player);
        }
    });
}
function setPlayerLanguageEntry(player, language) {
    removePlayerLanguageEntry(player);
    var bucket = exports.playerLanguageCache.get(language, function () { return new Seq(); });
    bucket.add(player);
}
function removePlayerLanguageEntry(player) {
    exports.playerLanguageCache.each(function (_, players) { return players.remove(player); });
}
var NonAlpha = Pattern.compile("[^\\p{IsAlphabetic}0-9_]");
function stripNonWordChars(string) {
    return NonAlpha.matcher(string).replaceAll("");
}
function sendTranslatedMessage(cleanedMessage, translatedMessage, player) {
    if (stripNonWordChars(translatedMessage.toLowerCase()) != stripNonWordChars(cleanedMessage.toLowerCase())) {
        Call.sendMessage(player.con, "[lightgray]Translated: " + translatedMessage + "[]", translatedMessage, null);
    }
}
function getLanguageFromCache(code) {
    var _a;
    var normalizedCode = code.toLowerCase();
    if (normalizedCode == "none" || normalizedCode == "off") {
        return { code: "none", name: "Off" };
    }
    return (_a = exports.languageCache.get(normalizedCode)) !== null && _a !== void 0 ? _a : { code: "none", name: "Off" }; //unsupported
}
function isLanguageAvailable(code) {
    return getLanguageFromCache(code).code != "none";
}
function fetchLanguageCache() {
    return new Promise(function (resolve, reject) {
        var req = Http.get(config_1.translationApiUrl + "/api/languages");
        req.error(reject);
        req.submit(function (t) {
            var parsed = JSON.parse(t.getResultAsString());
            Core.app.post(function () {
                var e_2, _a;
                try {
                    exports.languageCache.clear();
                    try {
                        for (var parsed_1 = __values(parsed), parsed_1_1 = parsed_1.next(); !parsed_1_1.done; parsed_1_1 = parsed_1.next()) {
                            var language = parsed_1_1.value;
                            if (language.code == "auto")
                                continue;
                            exports.languageCache.put(language.code.toLowerCase(), language);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (parsed_1_1 && !parsed_1_1.done && (_a = parsed_1.return)) _a.call(parsed_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    resolve();
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    });
}
function requestTranslate(message, languages) {
    return new Promise(function (resolve, reject) {
        var req = Http.post(config_1.translationApiUrl + "/api/translate/batch", message);
        req.header("languages", languages.join(","));
        req.header("token", config_1.translationApiToken.string());
        req.timeout = 3500; //low timeout to not lag chat too much
        req.error(function (e) {
            Log.err("Network error in translation request: ".concat("response" in e ? e.response.getResultAsString() : e));
            reject();
        });
        req.submit(function (t) {
            var result = t.getResultAsString();
            if (t.getStatus().code != 200) {
                Log.err("Network error in translation request: ".concat(t.getStatus().code, " ").concat(result));
                reject();
            }
            else {
                try {
                    var _a = JSON.parse(result), refusal = _a.refusal, languages_1 = __rest(_a, ["refusal"]);
                    if (refusal)
                        reject();
                    resolve(languages_1);
                }
                catch (_b) {
                    Log.err("Network error in translation request: Invalid json received: ".concat(result));
                    reject();
                }
            }
        });
    });
}
Vars.net.handleServer(SendChatMessageCallPacket, function (_a, _b) {
    var player = _a.player;
    var message = _b.message;
    if (!(player === null || player === void 0 ? void 0 : player.isAdded()) || message == null)
        return;
    if (message.length > Vars.maxTextLength) {
        player.sendMessage("[scarlet]Message too long. Maximum length is ".concat(Vars.maxTextLength, " characters."));
        return;
    }
    message = message.replace("\n", "");
    Events.fire(new EventType.PlayerChatEvent(player, message));
    Log.info("&fi&lc".concat((0, funcs_1.escapeStringColorsServer)(player.plainName()), ": &lw").concat((0, funcs_1.escapeStringColorsServer)((0, utils_1.removeFoosChars)(message)), "&fr"));
    var response = Vars.netServer.clientCommands.handleMessage(message, player);
    if (response.type == CommandHandler.ResponseType.noCommand) {
        var filtered = Vars.netServer.admins.filterMessage(player, message);
        if (filtered != null)
            void handleMessage(player, filtered);
    }
    else if (response.type != CommandHandler.ResponseType.valid) {
        var text = Vars.netServer.invalidHandler.handle(player, response);
        if (text != null)
            player.sendMessage(text);
    }
});
