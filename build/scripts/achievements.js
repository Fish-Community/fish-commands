"use strict";
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
exports.Achievements = exports.Achievement = void 0;
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var players_1 = require("/players");
var ranks_1 = require("/ranks");
//scrap doesn't count
var serpuloItems = [Items.copper, Items.lead, Items.graphite, Items.silicon, Items.metaglass, Items.titanium, Items.plastanium, Items.thorium, Items.surgeAlloy, Items.phaseFabric];
var erekirItems = [Items.beryllium, Items.graphite, Items.silicon, Items.tungsten, Items.oxide, Items.surgeAlloy, Items.thorium, Items.carbide, Items.phaseFabric];
var usefulItems10k = {
    serpulo: serpuloItems.map(function (i) { return new ItemStack(i, 10000); }),
    erekir: erekirItems.map(function (i) { return new ItemStack(i, 10000); }),
    sun: __spreadArray(__spreadArray([], __read(serpuloItems), false), __read(erekirItems), false).map(function (i) { return new ItemStack(i, 10000); }),
};
var allItems1k = Vars.content.items().select(function (i) { return !i.hidden; }).toArray().map(function (i) { return new ItemStack(i, 1000); });
var mixtechItems = Items.serpuloItems.copy();
Items.erekirItems.each(function (i) { return mixtechItems.add(i); });
var Achievement = /** @class */ (function () {
    function Achievement(icon, name, description, options) {
        var _a;
        if (options === void 0) { options = {}; }
        this.name = name;
        this.notify = "player";
        this.hidden = false;
        this.disabled = false;
        if (Array.isArray(icon)) {
            this.icon = "[".concat(icon[0], "]") + (typeof icon[1] == "number" ? String.fromCharCode(icon[1]) : icon[1]);
        }
        else if (typeof icon == "number") {
            this.icon = String.fromCharCode(icon);
        }
        else {
            this.icon = icon;
        }
        if (Array.isArray(description)) {
            _a = __read(description, 2), this.description = _a[0], this.extendedDescription = _a[1];
        }
        else
            this.description = description;
        this.nid = Achievement._id++;
        Object.assign(this, options);
        if (options.modes) {
            var _b = __read(options.modes), type = _b[0], modes_1 = _b.slice(1);
            if (type == "only")
                this.allowedModes = modes_1;
            else
                this.allowedModes = config_1.GamemodeNames.filter(function (m) { return !modes_1.includes(m); });
        }
        else {
            this.allowedModes = config_1.GamemodeNames;
        }
        Achievement.all.push(this);
        if (this.checkPlayerFrequent || this.checkFrequent)
            Achievement.checkFrequent.push(this);
        if (this.checkPlayerInfrequent || this.checkInfrequent)
            Achievement.checkInfrequent.push(this);
        if (this.checkPlayerJoin)
            Achievement.checkJoin.push(this);
        if (this.checkPlayerGameover || this.checkGameover)
            Achievement.checkGameover.push(this);
    }
    Achievement.prototype.message = function () {
        return config_1.FColor.achievement(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Achievement granted!\n[accent]", ": [white]", ""], ["Achievement granted!\\n[accent]", ": [white]", ""])), this.name, this.description);
    };
    Achievement.prototype.messageToEveryone = function (player) {
        return config_1.FColor.achievement(templateObject_2 || (templateObject_2 = __makeTemplateObject(["Player ", " has completed the achievement \"", "\"."], ["Player ", " has completed the achievement \"", "\"."])), player.prefixedName, this.name);
    };
    Achievement.prototype.allowedInMode = function () {
        return this.allowedModes.includes(config_1.Gamemode.name());
    };
    Achievement.prototype.grantToAllOnline = function (team) {
        var _this = this;
        players_1.FishPlayer.forEachPlayer(function (p) {
            if (!_this.has(p) && (!team || p.team() == team)) {
                if (_this.notify != "none")
                    p.sendMessage(_this.message());
                _this.setObtained(p);
            }
        });
    };
    Achievement.prototype.grantTo = function (player) {
        if (this.notify == "everyone")
            Call.sendMessage(this.messageToEveryone(player));
        else if (this.notify == "player")
            player.sendMessage(this.message());
        this.setObtained(player);
    };
    Achievement.prototype.setObtained = function (player) {
        return player.achievements.set(this.nid);
    };
    Achievement.prototype.has = function (player) {
        return player.achievements.get(this.nid);
    };
    Achievement.all = [];
    /** Checked every second. */
    Achievement.checkFrequent = [];
    /** Checked every 10 seconds. Use for states that can be gained but not lost, such as "x wins". */
    Achievement.checkInfrequent = [];
    Achievement.checkJoin = [];
    Achievement.checkGameover = [];
    Achievement._id = 0;
    return Achievement;
}());
exports.Achievement = Achievement;
Events.on(EventType.PlayerJoin, function (_a) {
    var e_1, _b;
    var _c;
    var player = _a.player;
    try {
        for (var _d = __values(Achievement.checkJoin), _e = _d.next(); !_e.done; _e = _d.next()) {
            var ach = _e.value;
            if (ach.allowedInMode()) {
                var fishP = players_1.FishPlayer.get(player);
                if (!ach.has(fishP) && ((_c = ach.checkPlayerJoin) === null || _c === void 0 ? void 0 : _c.call(ach, fishP))) {
                    ach.grantTo(fishP);
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
});
Events.on(EventType.GameOverEvent, function (_a) {
    var e_2, _b;
    var _c;
    var winner = _a.winner;
    var _loop_1 = function (ach) {
        if (ach.allowedInMode()) {
            if ((_c = ach.checkGameover) === null || _c === void 0 ? void 0 : _c.call(ach, winner))
                ach.grantToAllOnline();
            else
                players_1.FishPlayer.forEachPlayer(function (fishP) {
                    var _a;
                    if (!ach.has(fishP) && ((_a = ach.checkPlayerGameover) === null || _a === void 0 ? void 0 : _a.call(ach, fishP, winner))) {
                        ach.grantTo(fishP);
                    }
                });
        }
    };
    try {
        for (var _d = __values(Achievement.checkGameover), _e = _d.next(); !_e.done; _e = _d.next()) {
            var ach = _e.value;
            _loop_1(ach);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
        }
        finally { if (e_2) throw e_2.error; }
    }
});
Timer.schedule(function () {
    var e_3, _a;
    var _loop_2 = function (ach) {
        if (ach.allowedInMode()) {
            if (ach.checkFrequent) {
                if (config_1.Gamemode.pvp()) {
                    Vars.state.teams.active.each(function (t) {
                        if (ach.checkFrequent(t))
                            ach.grantToAllOnline(t);
                    });
                }
                else {
                    if (ach.checkFrequent(Vars.state.rules.defaultTeam))
                        ach.grantToAllOnline();
                }
            }
            else {
                players_1.FishPlayer.forEachPlayer(function (fishP) {
                    var _a;
                    if (!ach.has(fishP) && ((_a = ach.checkPlayerFrequent) === null || _a === void 0 ? void 0 : _a.call(ach, fishP)))
                        ach.grantTo(fishP);
                });
            }
        }
    };
    try {
        for (var _b = __values(Achievement.checkFrequent), _c = _b.next(); !_c.done; _c = _b.next()) {
            var ach = _c.value;
            _loop_2(ach);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
}, 1, 1);
Timer.schedule(function () {
    var e_4, _a;
    var _loop_3 = function (ach) {
        if (ach.allowedInMode()) {
            if (ach.checkInfrequent) {
                if (config_1.Gamemode.pvp()) {
                    Vars.state.teams.active.each(function (t) {
                        if (ach.checkInfrequent(t))
                            ach.grantToAllOnline(t);
                    });
                }
                else {
                    if (ach.checkInfrequent(Vars.state.rules.defaultTeam))
                        ach.grantToAllOnline();
                }
            }
            else {
                players_1.FishPlayer.forEachPlayer(function (fishP) {
                    var _a;
                    if (!ach.has(fishP) && ((_a = ach.checkPlayerInfrequent) === null || _a === void 0 ? void 0 : _a.call(ach, fishP)))
                        ach.grantTo(fishP);
                });
            }
        }
    };
    try {
        for (var _b = __values(Achievement.checkInfrequent), _c = _b.next(); !_c.done; _c = _b.next()) {
            var ach = _c.value;
            _loop_3(ach);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
}, 10, 10);
exports.Achievements = {
    // ===========================
    // ╦ ╦ ╔═╗ ╦═╗ ╔╗╔ ╦ ╔╗╔ ╔═╗ ┬
    // ║║║ ╠═╣ ╠╦╝ ║║║ ║ ║║║ ║ ╦ │
    // ╚╩╝ ╩ ╩ ╩╚═ ╝╚╝ ╩ ╝╚╝ ╚═╝ o
    // ===========================
    // Do not change the order of any achievements.
    // Do not remove any achievements: instead, set the "disabled" option to true.
    // Reordering achievements will cause ID shifts.
    //Joining based
    welcome: new Achievement("_", "Welcome", "Join the server.", { checkPlayerJoin: function () { return true; }, notify: "none" }),
    migratory_fish: new Achievement(Iconc.exit, "Migratory Fish", "Join all of our servers.", { hidden: true }), //TODO
    frequent_visitor: new Achievement(Iconc.planeOutline, "Frequent Visitor", "Join the server 100 times.", { checkPlayerJoin: function (p) { return p.info().timesJoined >= 100; } }),
    //Gamemode based
    attack: new Achievement(Iconc.modeAttack, "Attack", ["Defeat an attack map.", "You must be present for the beginning and end of the game."], { modes: ["only", "attack"] }),
    survival: new Achievement(Iconc.modeSurvival, "Survival", ["Survive 50 waves in a survival map.", "Must be during the same game."], { modes: ["only", "survival"] }),
    pvp: new Achievement(Iconc.modePvp, "PVP", ["Win a match of PVP.", "You must be present for the beginning and end of the game."], { modes: ["only", "pvp"] }),
    sandbox: new Achievement(Iconc.image, "Sandbox", "Spend 1 hour in Sandbox.", { modes: ["only", "sandbox"], checkPlayerInfrequent: function (p) { return p.stats.timeInGame > funcs_1.Duration.hours(1); } }),
    hexed: new Achievement(Iconc.layers, "Hexed", ["Play a match of Hexed.", "You must be present for the beginning and end of the game."], { modes: ["only", "hexed"] }),
    minigame: new Achievement(Iconc.play, "Minigame", ["Win a Minigame.", "You must be present for the beginning and end of the game."], { modes: ["only", "minigame"] }),
    //playtime based
    playtime_1: new Achievement(["white", Iconc.googleplay], "Playtime 1", "Spend 1 hour in-game.", { checkPlayerInfrequent: function (p) { return p.stats.timeInGame >= funcs_1.Duration.hours(1); } }),
    playtime_2: new Achievement(["red", Iconc.googleplay], "Playtime 2", "Spend 12 hours in-game.", { checkPlayerInfrequent: function (p) { return p.stats.timeInGame >= funcs_1.Duration.hours(12); } }),
    playtime_3: new Achievement(["orange", Iconc.googleplay], "Playtime 3", "Spend 2 days in-game.", { checkPlayerInfrequent: function (p) { return p.stats.timeInGame >= funcs_1.Duration.days(2); } }),
    playtime_4: new Achievement(["yellow", Iconc.googleplay], "Playtime 4", "Spend 10 days in-game.", { checkPlayerInfrequent: function (p) { return p.stats.timeInGame >= funcs_1.Duration.days(10); } }),
    //victories based
    victory_1: new Achievement(["white", Iconc.star], "First Victory", "Win a map run.", { checkPlayerGameover: function (p) { return p.stats.gamesWon >= 1; } }),
    victory_2: new Achievement(["red", Iconc.star], "Victories 2", "Win 5 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesWon >= 5; } }),
    victory_3: new Achievement(["orange", Iconc.star], "Victories 3", "Win 30 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesWon >= 30; } }),
    victory_4: new Achievement(["yellow", Iconc.star], "Victories 4", "Win 100 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesWon >= 100; }, notify: "everyone" }),
    //games based
    games_1: new Achievement(["white", Iconc.itchio], "Games 1", "Play 10 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesFinished >= 10; } }),
    games_2: new Achievement(["red", Iconc.itchio], "Games 2", "Play 40 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesFinished >= 40; } }),
    games_3: new Achievement(["orange", Iconc.itchio], "Games 3", "Play 100 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesFinished >= 100; } }),
    games_4: new Achievement(["yellow", Iconc.itchio], "Games 4", "Play 200 map runs.", { checkPlayerGameover: function (p) { return p.stats.gamesFinished >= 200; }, notify: "everyone" }),
    //messages based
    messages_1: new Achievement(["white", Iconc.chat], "Hello", "Send your first chat message.", { notify: "none", checkPlayerInfrequent: function (p) { return p.stats.chatMessagesSent >= 1; } }),
    messages_2: new Achievement(["red", Iconc.chat], "Chat 2", "Send 100 chat messages.", { checkPlayerInfrequent: function (p) { return p.stats.chatMessagesSent >= 100; } }),
    messages_3: new Achievement(["orange", Iconc.chat], "Chat 3", "Send 500 chat messages.", { checkPlayerInfrequent: function (p) { return p.stats.chatMessagesSent >= 500; } }),
    messages_4: new Achievement(["yellow", Iconc.chat], "Chat 4", "Send 2000 chat messages.", { checkPlayerInfrequent: function (p) { return p.stats.chatMessagesSent >= 2000; } }),
    messages_5: new Achievement(["lime", Iconc.chat], "Chat 4", "Send 5000 chat messages.", { checkPlayerInfrequent: function (p) { return p.stats.chatMessagesSent >= 5000; }, notify: "everyone" }),
    //blocks built based
    builds_1: new Achievement(["white", Iconc.fileText], "The Factory Must Prepare", "Construct 1 buildings.", { checkPlayerInfrequent: function (p) { return p.stats.blocksPlaced >= 1; }, notify: "none" }),
    builds_2: new Achievement(["red", Iconc.fileText], "The Factory Must Begin", "Construct 200 buildings.", { checkPlayerInfrequent: function (p) { return p.stats.blocksPlaced > 200; } }),
    builds_3: new Achievement(["orange", Iconc.fileText], "The Factory Must Produce", "Construct 1000 buildings.", { checkPlayerInfrequent: function (p) { return p.stats.blocksPlaced > 1000; } }),
    builds_4: new Achievement(["yellow", Iconc.fileText], "The Factory Must Grow", "Construct 5000 buildings.", { checkPlayerInfrequent: function (p) { return p.stats.blocksPlaced > 5000; }, notify: "everyone" }),
    //units
    t5: new Achievement(Blocks.tetrativeReconstructor.emoji(), "T5", "Control a T5 unit.", { modes: ["not", "sandbox"], checkPlayerFrequent: function (player) {
            var _a;
            return globals_1.unitsT5.includes((_a = player.unit()) === null || _a === void 0 ? void 0 : _a.type);
        }, }),
    dibs: new Achievement(["green", Blocks.tetrativeReconstructor.emoji()], "Dibs", "Be the first player to control the first T5 unit made by a reconstructor that you placed.", { modes: ["not", "sandbox"], hidden: false }), //TODO
    worm: new Achievement(UnitTypes.latum.emoji(), "Worm", "Control a Latum.", { checkPlayerFrequent: function (player) {
            var _a;
            return ((_a = player.unit()) === null || _a === void 0 ? void 0 : _a.type) == UnitTypes.latum;
        }, }),
    //pvp
    above_average: new Achievement(Iconc.chartBar, "Above Average", ["Reach a win rate above 50%.", "Must be over at least 20 games of PVP."], { modes: ["only", "pvp"], checkPlayerInfrequent: function (p) { return p.stats.gamesWon / p.stats.gamesFinished > 0.5 && p.stats.gamesFinished >= 20; } }),
    head_start: new Achievement(Iconc.commandAttack, "Head Start", ["Win a match of PVP where your opponents have a 5 minute head start.", "Your team must wait for the first 5 minutes without building or descontructing any buildings."], { modes: ["only", "pvp"], hidden: true }), //TODO
    one_v_two: new Achievement(["red", Iconc.modePvp], "1v2", "Defeat two (or more) opponents in PVP without help from other players.", { modes: ["only", "pvp"], hidden: true }), //TODO
    //sandbox
    underpowered: new Achievement(["red", Blocks.powerSource.emoji()], "Underpowered", "Overload a power source.", { modes: ["only", "sandbox"], checkFrequent: function () {
            var found = false;
            //deliberate ordering for performance reasons
            Groups.powerGraph.each(function (_a) {
                var graph = _a.graph;
                //we don't need to actually check for power sources, just assume that ~1mil power is a source
                if (graph.lastPowerNeeded > graph.lastPowerProduced && graph.lastPowerNeeded < 1e10 && graph.lastPowerProduced >= 999900)
                    found = true;
            });
            return found;
        } }),
    //easter eggs
    memory_corruption: new Achievement(["red", Iconc.host], "Is the server OK?", "Witness a memory corruption.", { notify: "none" }),
    run_js_without_perms: new Achievement(["yellow", Iconc.warning], "838", ["Receive a warning from the server that an incident will be reported.", "One of the admin commands has a custom error message."], { notify: "everyone" }),
    script_kiddie: new Achievement(["red", Iconc.warning], "Script Kiddie", ["Pretend to be a hacker. The server will disagree.", "Change your name to something including \"hacker\"."], { notify: "none" }),
    hacker: new Achievement(["lightgray", Iconc.host], "Hacker", "Find a bug in the server and report it responsibly.", { hidden: true }),
    //items based
    items_10k: new Achievement(["green", Iconc.distribution], "Cornucopia", "Obtain 10k of every useful resource.", {
        modes: ["not", "sandbox"],
        checkPlayerFrequent: function (player) {
            var _a;
            return ((_a = player.team().items()) === null || _a === void 0 ? void 0 : _a.has(usefulItems10k[Vars.state.planet.name])) || false;
        },
    }),
    fullVault: new Achievement(["green", Blocks.vault.emoji()], "Well Stocked", ["Fill a vault with every obtainable item.", "Requires mixtech."], {
        modes: ["not", "sandbox"],
        checkInfrequent: function (team) {
            return Vars.indexer.getFlagged(team, BlockFlag.storage).contains(boolf(function (b) { return b.block == Blocks.vault && b.items.has(allItems1k); }));
        },
    }),
    full_core: new Achievement(["green", Blocks.coreAcropolis.emoji()], "Multiblock Incinerator", "Completely fill the core with all obtainable items on a map with core incineration enabled.", {
        modes: ["not", "sandbox"],
        checkFrequent: function (team) {
            var _a;
            var items;
            switch (Vars.state.planet.name) {
                case "serpulo":
                    items = Items.serpuloItems;
                    break;
                case "erekir":
                    items = Items.erekirItems;
                    break;
                case "sun":
                    items = mixtechItems;
                    break;
            }
            var capacity = (_a = team.core()) === null || _a === void 0 ? void 0 : _a.storageCapacity;
            if (!capacity)
                return false;
            var module = team.items();
            return items.allMatch(function (i) { return module.has(i, capacity); });
        },
    }),
    siligone: new Achievement(["red", Items.silicon.emoji()], "Siligone", ["Run out of silicon.", "You must have reached 2000 silicon before running out."], { modes: ["not", "sandbox"] }),
    silicon_100k: new Achievement(["green", Items.silicon.emoji()], "Silicon for days", "Obtain 100k silicon.", {
        modes: ["not", "sandbox"],
        checkFrequent: function (team) { return team.items().has(Items.silicon, 100000); }
    }),
    //other players based
    alone: new Achievement(["red", Iconc.players], "Alone", "Be the only player online for more than two minutes"),
    join_playercount_20: new Achievement(["lime", Iconc.players], "Is there enough room?", "Join a server with 20 players online", {
        checkPlayerJoin: function () { return Groups.player.size() > 20; },
    }),
    meet_staff: new Achievement(["lime", Iconc.hammer], "Griefer Beware", "Meet a staff member in-game", {
        checkPlayerJoin: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).ranksAtLeast("mod"); }); },
    }),
    meet_fish: new Achievement(["blue", Iconc.admin], "The Big Fish", "Meet >|||>Fish himself in-game", {
        checkPlayerJoin: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).ranksAtLeast("fish"); }); },
        hidden: true,
    }),
    server_speak: new Achievement(["pink", Iconc.host], "It Speaks!", "Hear the server talk in chat."),
    see_marked_griefer: new Achievement(["red", Iconc.hammer], "Flying Tonk", "See a marked griefer in-game.", {
        checkInfrequent: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).marked(); }); },
    }),
    //maps based
    beat_map_not_in_rotation: new Achievement(["pink", Iconc.map], "How?", "Beat a map that isn't in the list of maps.", { notify: "everyone", modes: ["not", "pvp"], checkGameover: function (team) { return team == Vars.state.rules.defaultTeam && !Vars.state.map.custom; } }),
    //misc
    power_1mil: new Achievement(["green", Blocks.powerSource.emoji()], "Who needs sources?", "Reach a power production of 1 million without using power sources.", { modes: ["not", "sandbox"], checkFrequent: function () {
            var found = false;
            //deliberate ordering for performance reasons
            Groups.powerGraph.each(function (_a) {
                var graph = _a.graph;
                //we don't need to actually check for power sources, just assume that ~1mil power is a source
                if (graph.lastPowerProduced > 1e6 && !graph.producers.contains(boolf(function (b) { return b.block == Blocks.powerSource; })))
                    found = true;
            });
            return found;
        }, }),
    pacifist_crawler: new Achievement(UnitTypes.crawler.emoji(), "Pacifist Crawler", "Control a crawler for 15 minutes without exploding.", { modes: ["not", "sandbox"], hidden: true }), //TODO
    core_low_hp: new Achievement(["yellow", Blocks.coreNucleus.emoji()], "Close Call", "Have your core reach less than 1% health, but survive.", { modes: ["not", "sandbox"], hidden: true }), //TODO
    enemy_core_low_hp: new Achievement(["red", Blocks.coreNucleus.emoji()], "So Close", "Cause the enemy core to reach less than 1% health, but survive.", { modes: ["not", "sandbox"], hidden: true }), //TODO
    verified: new Achievement([ranks_1.Rank.active.color, Iconc.ok], "Verified", "Be promoted automatically to ".concat(ranks_1.Rank.active.coloredName(), " rank."), { checkPlayerJoin: function (p) { return p.ranksAtLeast("active"); }, notify: "none" }),
    afk: new Achievement(["yellow", Iconc.lock], "AFK?", "Win a game without doing anything.", { modes: ["not", "sandbox"], hidden: true }), //TODO
    status_effects_5: new Achievement(StatusEffects.electrified.emoji(), "A Furious Cocktail", "Have at least 5 status effects at once.", { checkPlayerFrequent: function (p) {
            var unit = p.unit();
            if (!unit)
                return false;
            var statuses = Reflect.get(unit, "statuses");
            return statuses.size >= 5;
        }, modes: ["not", "sandbox"] }),
    drown_big_tank: new Achievement(["blue", UnitTypes.conquer.emoji()], "Not Waterproof", "Drown an enemy Conquer or Vanquish.", { notify: "everyone", modes: ["not", "sandbox"] }),
    drown_mace_in_cryo: new Achievement(["cyan", UnitTypes.mace.emoji()], "Cooldown", "Drown a Mace in ".concat(Blocks.cryofluid.emoji(), " Cryofluid."), { notify: "everyone", modes: ["not", "sandbox"] }),
    max_boost_duo: new Achievement(["yellow", Blocks.duo.emoji()], "In Duo We Trust", "Control a Duo with maximum boosts.", { checkPlayerFrequent: function (player) {
            var _a, _b;
            var tile = (_b = (_a = player.unit()) === null || _a === void 0 ? void 0 : _a.tile) === null || _b === void 0 ? void 0 : _b.call(_a);
            if (!tile)
                return false;
            return tile.block == Blocks.duo && tile.ammo.peek().item == Items.silicon && tile.liquids.current() == Liquids.cryofluid && tile.timeScale() >= 2.5;
        }, notify: "everyone", modes: ["not", "sandbox"] }),
    foreshadow_overkill: new Achievement(["yellow", Blocks.foreshadow.emoji()], "Overkill", ["Kill a Dagger with a maximally boosted Foreshadow.", "Hint: the maximum overdrive is not +150%..."], { notify: "everyone", modes: ["not", "sandbox"] }),
    impacts_15: new Achievement(["green", Blocks.impactReactor.emoji()], "Darthscion's Nightmare", "Run 15 impact reactors at full efficiency.", {
        modes: ["not", "sandbox"],
        notify: "everyone",
        checkInfrequent: function (team) {
            var found = false;
            //deliberate ordering for performance reasons
            Groups.powerGraph.each(function (_a) {
                var graph = _a.graph;
                //assume that any network running 15 impacts has at least 2 other power sources
                if (graph.producers.size >= 17 && graph.producers.count(function (b) { return b.block == Blocks.impactReactor && b.warmup > 0.99999; }) > 15 && graph.producers.first().team == team)
                    found = true;
            });
            return found;
        },
    }),
};
Object.entries(exports.Achievements).forEach(function (_a) {
    var _b = __read(_a, 2), id = _b[0], a = _b[1];
    return a.sid = id;
});
globals_1.FishEvents.on("commandUnauthorized", function (_, player, name) {
    if (name == "js" || name == "fjs")
        exports.Achievements.run_js_without_perms.grantTo(player);
});
Events.on(EventType.UnitDrownEvent, function (_a) {
    var _b;
    var unit = _a.unit;
    if (unit.type == UnitTypes.mace && ((_b = unit.tileOn()) === null || _b === void 0 ? void 0 : _b.floor()) == Blocks.cryofluid)
        exports.Achievements.drown_mace_in_cryo.grantToAllOnline();
    else if (unit.type == UnitTypes.conquer || unit.type == UnitTypes.vanquish)
        exports.Achievements.drown_big_tank.grantToAllOnline();
});
Events.on(EventType.UnitBulletDestroyEvent, function (_a) {
    var unit = _a.unit, bullet = _a.bullet;
    if (unit.type == UnitTypes.dagger && bullet.owner.block == Blocks.foreshadow) {
        var build = bullet.owner;
        if (build.liquids.current() == Liquids.cryofluid && build.timeScale() >= 3)
            exports.Achievements.foreshadow_overkill.grantToAllOnline(build.team);
    }
});
var siliconReached = Team.all.map(function (_) { return false; });
Events.on(EventType.GameOverEvent, function () { return siliconReached = Team.all.map(function (_) { return false; }); });
Timer.schedule(function () {
    if (!Vars.state.gameOver) {
        Vars.state.teams.active.each(function (t) {
            if (t.items().has(Items.silicon, 2000))
                siliconReached[t.id] = true;
            else if (t.items().get(Items.silicon) == 0)
                exports.Achievements.siligone.grantToAllOnline(t);
        });
    }
}, 2, 2);
globals_1.FishEvents.on("scriptKiddie", function (_, p) { return exports.Achievements.script_kiddie.grantTo(p); });
globals_1.FishEvents.on("memoryCorruption", function () { return exports.Achievements.memory_corruption.grantToAllOnline(); });
globals_1.FishEvents.on("serverSays", function () { return exports.Achievements.server_speak.grantToAllOnline(); });
var templateObject_1, templateObject_2;
