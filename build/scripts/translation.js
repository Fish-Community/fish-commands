"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains a translation client implementation for https://github.com/TheRadioactiveBanana/translate-api-wrapper
*/
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
exports.messageHandoff = messageHandoff;
exports.setPlayerLanguageEntry = setPlayerLanguageEntry;
exports.getLanguageFromCache = getLanguageFromCache;
exports.isLanguageAvailable = isLanguageAvailable;
var api = require("/api");
var config_1 = require("/config");
var players_1 = require("/players");
var utils_1 = require("/utils");
exports.languageCache = new ObjectMap();
exports.playerLanguageCache = new ObjectMap();
exports.translationCache = new ObjectMap();
function initializeTranslation() {
    setLanguageCacheAsync();
    Events.on(EventType.PlayerJoin, function (t) {
        var fishPlayer = players_1.FishPlayer.get(t.player);
        var language = fishPlayer.language
            ? getLanguageFromCache(fishPlayer.language)
            : getLanguageFromCache(t.player.locale);
        if (fishPlayer.language != language.code) {
            fishPlayer.language = language.code;
            void api.setFishPlayerData(fishPlayer.getData(), 1, true);
        }
        if (exports.languageCache.isEmpty()) {
            setLanguageCacheAsync(function () { return setPlayerLanguageEntry(t.player, getLanguageFromCache(fishPlayer.language || t.player.locale)); });
            return;
        }
        setPlayerLanguageEntry(t.player, language);
    });
    Events.on(EventType.PlayerLeave, function (t) {
        removePlayerLanguageEntry(t.player);
    });
}
function messageHandoff(sender, message) {
    if (exports.languageCache.isEmpty()) {
        setLanguageCacheAsync();
    }
    sender.sendMessage(Vars.netServer.chatFormatter.format(sender, message)); //return to sender immediately, they don't need to see their own translation
    var cleanedMessage = Strings.stripGlyphs(Strings.stripColors((0, utils_1.removeFoosChars)(message)));
    var delivered = new ObjectSet();
    exports.playerLanguageCache.each(function (k, v) {
        var e_1, _a;
        var formatted = Vars.netServer.chatFormatter.format(sender, message);
        var recipients = uniqueRecipients(v, sender, delivered);
        if (recipients.size === 0)
            return;
        if (k == null || k.code === "off" || k.code === "auto" || k.code === "none") {
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
        var cacheKey = "".concat((k.code), "\n").concat(cleanedMessage);
        var cachedTranslation = exports.translationCache.get(cacheKey);
        if (cachedTranslation != null) {
            sendTranslatedMessage(sender, message, cachedTranslation, recipients);
            return;
        }
        var req = Http.post(config_1.translationApiUrl + "/api/translate", cleanedMessage);
        req.header("from", "auto");
        Log.info(k.code);
        req.header("to", k.code);
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
            if (!e.response)
                return;
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
    var formatted = Vars.netServer.chatFormatter.format(sender, originalMessage) + "\n[lightgray]Translated: " + translatedMessage + "[]";
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
    if (exports.languageCache.isEmpty()) {
        setLanguageCacheAsync();
    }
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
function setLanguageCache() {
    var req = Http.get(config_1.translationApiUrl + "/api/languages");
    req.error(function (e) {
        Log.err("Could not reload translation API languages");
        Log.err(e);
    });
    var cons = function (t) {
        var parsed = JSON.parse(t.getResultAsString());
        Core.app.post(function () {
            var e_6, _a;
            exports.languageCache.clear();
            try {
                for (var parsed_1 = __values(parsed), parsed_1_1 = parsed_1.next(); !parsed_1_1.done; parsed_1_1 = parsed_1.next()) {
                    var item = parsed_1_1.value;
                    exports.languageCache.put(item.code.toLowerCase(), { name: item.name, code: item.code });
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (parsed_1_1 && !parsed_1_1.done && (_a = parsed_1.return)) _a.call(parsed_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        });
    };
    req.block(cons);
}
function setLanguageCacheAsync(callback) {
    Threads.daemon(function () {
        setLanguageCache();
        if (callback != null) {
            Core.app.post(callback);
        }
    });
}
