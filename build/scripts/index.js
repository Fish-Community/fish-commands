"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the main code, which calls other functions and initializes the plugin.
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
var api = require("/api");
var aggregate_1 = require("/commands/aggregate");
var config_1 = require("/config");
var commands_1 = require("/frameworks/commands");
var menus = require("/frameworks/menus");
var globals_1 = require("/globals");
var packetHandlers_1 = require("/packetHandlers");
var players_1 = require("/players");
var timers = require("/timers");
var utils_1 = require("/utils");
var translation = require("/translation");
Events.on(EventType.ConnectionEvent, function (e) {
    if (Vars.netServer.admins.bannedIPs.contains(e.connection.address)) {
        api.getBanned({
            ip: e.connection.address,
        }, function (banned) {
            if (!banned) {
                //If they were previously banned locally, but the API says they aren't banned, then unban them and clear the kick that the outer function already did
                Vars.netServer.admins.unbanPlayerIP(e.connection.address);
                Vars.netServer.admins.kickedIPs.remove(e.connection.address);
            }
        });
    }
    else if (api.isVpnCached(e.connection.address) && players_1.FishPlayer.shouldWhackFlaggedPlayers()) {
        Vars.netServer.admins.blacklistDos(e.connection.address);
        e.connection.kick("You have been DOSblacklisted. Please join our discord for help: " + config_1.text.discordURL + "\nYou won't see this message again.");
        Log.info("&yAntibot killed connection ".concat(e.connection.address, " due to flagged while under attack"));
    }
});
Events.on(EventType.PlayerConnect, function (e) {
    if (players_1.FishPlayer.shouldKickNewPlayers() && e.player.info.timesJoined == 1) {
        //do not use the helper function, for maximum performance
        e.player.kick(Packets.KickReason.kick, 3600000);
    }
    players_1.FishPlayer.onPlayerConnect(e.player);
});
Events.on(EventType.PlayerJoin, function (e) {
    players_1.FishPlayer.onPlayerJoin(e.player);
});
Events.on(EventType.PlayerLeave, function (e) {
    players_1.FishPlayer.onPlayerLeave(e.player);
});
Events.on(EventType.ConnectPacketEvent, function (e) {
    if (!players_1.FishPlayer.connectRate.allow(5000, 35)) {
        players_1.FishPlayer.triggerAntibot(300000, "Rate of player connections exceeded 35 / 5s", "automatic");
    }
    globals_1.ipJoins.increment(e.connection.address);
    var info = Vars.netServer.admins.getInfoOptional(e.packet.uuid);
    var underAttack = players_1.FishPlayer.antiBotMode();
    var newPlayer = !info || info.timesJoined < 10;
    var longModName = e.packet.mods.contains(function (str) { return str.length > 50; });
    var veryLongModName = e.packet.mods.contains(function (str) { return str.length > 100; });
    if ((underAttack && e.packet.mods.size > 2) ||
        (underAttack && longModName) ||
        (veryLongModName && (underAttack || newPlayer))) {
        Vars.netServer.admins.blacklistDos(e.connection.address);
        e.connection.kicked = true;
        players_1.FishPlayer.triggerAntibot(60000, (veryLongModName ? "very long mod name" : longModName ? "long mod name" : "it had mods while under attack"), "automatic");
        return;
    }
    var suspiciousModName = e.packet.mods.contains(function (str) { return str.includes('\x1B'); });
    if (suspiciousModName || e.packet.name.includes('\x1B')) {
        Vars.netServer.admins.blacklistDos(e.connection.address);
        e.connection.kicked = true;
        players_1.FishPlayer.triggerAntibot(5000, "illegal characters in name or mods", "automatic");
        return;
    }
    if (globals_1.ipJoins.get(e.connection.address) >= ((underAttack || veryLongModName) ? 3 : (newPlayer || longModName) ? 7 : 15)) {
        Vars.netServer.admins.blacklistDos(e.connection.address);
        e.connection.kicked = true;
        players_1.FishPlayer.triggerAntibot(5000, "too many connections", "automatic");
        return;
    }
    /*if(e.packet.name.includes("discord.gg/GnEdS9TdV6")){
        Vars.netServer.admins.blacklistDos(e.connection.address);
        e.connection.kicked = true;
        FishPlayer.onBotWhack();
        Log.info(`&yAntibot killed connection ${e.connection.address} due to omni discord link`);
        return;
    }*/
    if (e.packet.name.includes("1`1@everyone")) {
        Vars.netServer.admins.blacklistDos(e.connection.address);
        e.connection.kicked = true;
        players_1.FishPlayer.triggerAntibot(-1, "known bad name", "automatic");
        return;
    }
    if (Vars.netServer.admins.isDosBlacklisted(e.connection.address)) {
        //threading moment, i think
        e.connection.kicked = true;
        return;
    }
    api.getBanned({
        ip: e.connection.address,
        uuid: e.packet.uuid
    }, function (banned) {
        if (banned) {
            Log.info("&lrSynced ban of ".concat(e.packet.uuid, "/").concat(e.connection.address, "."));
            e.connection.kick(Packets.KickReason.banned, 1);
            Vars.netServer.admins.banPlayerIP(e.connection.address);
            Vars.netServer.admins.banPlayerID(e.packet.uuid);
        }
        else {
            Vars.netServer.admins.unbanPlayerIP(e.connection.address);
            Vars.netServer.admins.unbanPlayerID(e.packet.uuid);
        }
    });
    players_1.FishPlayer.onConnectPacket(e.packet);
});
Events.on(EventType.UnitChangeEvent, function (e) {
    players_1.FishPlayer.onUnitChange(e.player, e.unit);
});
Events.on(EventType.ContentInitEvent, function () {
    //Unhide latum and renale
    UnitTypes.latum.hidden = false;
    UnitTypes.renale.hidden = false;
});
Vars.net.handleServer(SendChatMessageCallPacket, function (connection, packet) {
    var player = connection.player;
    var message = packet.message;
    if (player == null || !player.isAdded() || message == null)
        return;
    if (message.length > Vars.maxTextLength) {
        player.sendMessage("[scarlet]Message too long. Maximum length is ".concat(Vars.maxTextLength, " characters."));
        return;
    }
    message = message.replace("\n", "");
    Events.fire(new EventType.PlayerChatEvent(player, message));
    var response = Vars.netServer.clientCommands.handleMessage(message, player);
    Log.info("[CHAT] &fi&lc:" + player.plainName() + ": &lw" + Strings.stripColors(message) + "&fr");
    if (response.type == CommandHandler.ResponseType.noCommand) {
        var filtered = Vars.netServer.admins.filterMessage(player, message);
        if (filtered == null)
            return;
        translation.handleMessage(player, message);
    }
    else if (response.type != CommandHandler.ResponseType.valid) {
        var text_1 = Vars.netServer.invalidHandler.handle(player, response);
        if (text_1 != null)
            player.sendMessage(text_1);
    }
});
Events.on(EventType.PlayerChatEvent, function (e) { return (0, utils_1.processChat)(e.player, e.message, true); });
Events.on(EventType.ServerLoadEvent, function (_) {
    var clientHandler = Vars.netServer.clientCommands;
    var serverHandler = ServerControl.instance.handler;
    players_1.FishPlayer.loadAll();
    globals_1.FishEvents.fire("loadData", []);
    timers.initializeTimers();
    menus.registerListeners();
    translation.initializeTranslation();
    //Cap delta
    Time.setDeltaProvider(function () { return Math.min(Core.graphics.getDeltaTime() * 60, 10); });
    // Mute muted players
    Vars.netServer.admins.addChatFilter(function (player, message) { return (0, utils_1.processChat)(player, message); });
    // Action filters
    Vars.netServer.admins.addActionFilter(function (action) {
        var _a, _b, _c;
        var player = action.player;
        var fishP = players_1.FishPlayer.get(player);
        //prevent stopped players from doing anything other than deposit items.
        if (!fishP.hasPerm("play")) {
            action.player.sendMessage('[scarlet]\u26A0 [yellow]You are stopped, you cant perfom this action.');
            return false;
        }
        else {
            if (action.type === Administration.ActionType.pickupBlock) {
                (0, utils_1.addToTileHistory)({
                    pos: "".concat(action.tile.x, ",").concat(action.tile.y),
                    uuid: action.player.uuid(),
                    action: "picked up",
                    type: (_b = (_a = action.tile.block()) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "nothing",
                });
            }
            else if (action.type === Administration.ActionType.control && !((_c = action.unit) === null || _c === void 0 ? void 0 : _c.spawnedByCore) && Date.now() < fishP.blockedFromUnitsUntil) {
                action.player.sendMessage("[scarlet]\u26A0 [yellow]You are blocked from controlling units for ".concat((0, utils_1.formatTimeRelative)(fishP.blockedFromUnitsUntil, true)));
                return false;
            }
            else if (action.type === Administration.ActionType.pingLocation && action.pingText && action.pingText.length < Vars.maxPingTextLength) {
                var fishP_1 = players_1.FishPlayer.get(action.player);
                if (fishP_1.muted) {
                    action.player.sendMessage("[scarlet]\u26A0 [yellow]You are muted, you cannot send text through location pings.");
                    return false;
                }
                else if ((0, utils_1.matchFilter)(action.pingText, "chat", false)) {
                    //Allow it, but replace
                    player.pingX = action.pingX;
                    player.pingY = action.pingY;
                    player.pingTime = 1;
                    player.pingText = config_1.text.chatFilterReplacement.messageShort();
                    return false;
                }
            }
            return true;
        }
    });
    (0, aggregate_1.registerAll)(clientHandler, serverHandler);
    (0, packetHandlers_1.loadPacketHandlers)();
    //Load plugin data
    try {
        var path = (0, utils_1.fishCommandsRootDirPath)();
        globals_1.fishPlugin.directory = path.toString();
        Threads.daemon(function () {
            try {
                globals_1.fishPlugin.version = OS.exec("git", "-C", globals_1.fishPlugin.directory, "rev-parse", "HEAD");
            }
            catch (_a) { }
        });
    }
    catch (err) {
        Log.err("Failed to get fish plugin information.");
        Log.err(err);
    }
    globals_1.FishEvents.fire("dataLoaded", []);
    Runtime.getRuntime().addShutdownHook(new Thread(function () {
        try {
            players_1.FishPlayer.uploadAll();
        }
        catch (_a) {
            Log.err("failed to upload");
        }
        try {
            globals_1.FishEvents.fire("saveData", []);
        }
        catch (_b) {
            Log.err("failed to save misc data");
        }
        try {
            players_1.FishPlayer.saveAll(false);
        }
        catch (_c) {
            Log.err("failed to save player data");
        }
        Log.info("Saved on exit.");
    }));
});
// Keeps track of any action performed on a tile for use in tilelog.
Events.on(EventType.BlockBuildBeginEvent, utils_1.addToTileHistory);
Events.on(EventType.BuildRotateEvent, utils_1.addToTileHistory);
Events.on(EventType.ConfigEvent, utils_1.addToTileHistory);
Events.on(EventType.PickupEvent, utils_1.addToTileHistory);
Events.on(EventType.PayloadDropEvent, utils_1.addToTileHistory);
Events.on(EventType.UnitDestroyEvent, utils_1.addToTileHistory);
Events.on(EventType.BlockDestroyEvent, utils_1.addToTileHistory);
Events.on(EventType.UnitControlEvent, utils_1.addToTileHistory);
Events.on(EventType.TapEvent, commands_1.handleTapEvent);
Events.on(EventType.GameOverEvent, function (e) {
    var e_1, _a;
    try {
        for (var _b = __values(Object.keys(globals_1.tileHistory)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            //clear tilelog
            globals_1.tileHistory[key] = null;
            delete globals_1.tileHistory[key];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (globals_1.fishState.restartQueued) {
        //restart
        Call.sendMessage("[accent]---[[[coral]+++[]]---\n[accent]Server restart imminent. [green]We'll be back after 15 seconds.[]\n[accent]---[[[coral]+++[]]---");
        (0, utils_1.serverRestartLoop)(12, true);
        Events.on(EventType.WorldLoadBeginEvent, function () {
            //Remove save
            (0, utils_1.restartNow)(true);
        });
    }
    players_1.FishPlayer.onGameOver(e.winner);
});
Events.on(EventType.WorldLoadEvent, function () { return players_1.FishPlayer.onGameBegin(); });
Events.on(EventType.PlayerChatEvent, function (e) {
    players_1.FishPlayer.onPlayerChat(e.player, e.message);
});
