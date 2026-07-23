"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the code for each achievement.
*/
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
exports.Achievements = void 0;
var framework_1 = require("/achievements/framework");
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var players_1 = require("/players");
var ranks_1 = require("/ranks");
var utils_1 = require("/utils");
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
    welcome: new framework_1.Achievement(["gold", Iconc.infoCircle], "Welcome", "Join the server.", {
        checkPlayerJoin: function () { return true; },
        notify: "nobody"
    }),
    migratory_fish: new framework_1.Achievement(Iconc.exit, "Migratory Fish", "Join all of our servers.", {
        disabled: true
    }), //TODO
    frequent_visitor: new framework_1.Achievement(Iconc.planeOutline, "Frequent Visitor", ["Join the server 100 times.", "Note: Do not reconnect frequently, that will not work. This achievement requires that you have been playing for 1 month."], {
        checkPlayerJoin: function (p) { return p.info().timesJoined >= 100 && (Date.now() - p.globalFirstJoined > funcs_1.Duration.months(1)); }
    }),
    //Gamemode based
    attack: new framework_1.Achievement(Iconc.modeAttack, "Attack", ["Defeat an attack map.", "You must be present for the beginning and end of the game."], {
        modes: ["only", "attack"],
        checkPlayerGameover: function (player, winTeam) {
            return Vars.state.rules.defaultTeam == winTeam && player.tstats.lastMapStartTime == globals_1.fishState.lastMapStartTime;
        },
    }),
    survival: new framework_1.Achievement(Iconc.modeSurvival, "Survival", ["Survive 50 waves in a survival map.", "Must be during the same game."], {
        modes: ["only", "survival"],
        checkPlayerInfrequent: function (player) {
            return player.tstats.wavesSurvived >= 50;
        },
    }),
    pvp: new framework_1.Achievement(Iconc.modePvp, "PVP", ["Win a match of PVP.", "You must be present for the beginning and end of the game."], {
        modes: ["only", "pvp"],
        checkPlayerGameover: function (player, winTeam) {
            return player.team() == winTeam && player.tstats.lastMapStartTime == globals_1.fishState.lastMapStartTime;
        },
    }),
    sandbox: new framework_1.Achievement(Iconc.image, "Sandbox", "Spend 1 hour in Sandbox.", {
        modes: ["only", "sandbox"],
        checkPlayerInfrequent: function (p) { return p.stats.timeInGame > funcs_1.Duration.hours(1); },
    }),
    hexed: new framework_1.Achievement(Iconc.layers, "Hexed", ["Play a match of Hexed.", "You must be present for the beginning and end of the game."], {
        modes: ["only", "hexed"],
        checkPlayerGameover: function (player) {
            return player.tstats.lastMapStartTime == globals_1.fishState.lastMapStartTime;
        },
    }),
    minigame: new framework_1.Achievement(Iconc.play, "Minigame", ["Win a Minigame.", "You must be present for the beginning and end of the game."], {
        modes: ["only", "minigame"],
        checkPlayerGameover: function (player, winTeam) {
            return player.team() == winTeam && player.tstats.lastMapStartTime == globals_1.fishState.lastMapStartTime;
        },
    }),
    //playtime based
    playtime_1: new framework_1.Achievement(["white", Iconc.googleplay], "Playtime 1", "Spend 1 hour in-game.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.timeInGame >= funcs_1.Duration.hours(1); }
    }),
    playtime_2: new framework_1.Achievement(["red", Iconc.googleplay], "Playtime 2", "Spend 12 hours in-game.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.timeInGame >= funcs_1.Duration.hours(12); }
    }),
    playtime_3: new framework_1.Achievement(["orange", Iconc.googleplay], "Playtime 3", "Spend 2 days in-game.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.timeInGame >= funcs_1.Duration.days(2); }
    }),
    playtime_4: new framework_1.Achievement(["yellow", Iconc.googleplay], "Playtime 4", "Spend 10 days in-game.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.timeInGame >= funcs_1.Duration.days(10); }
    }),
    //victories based
    victory_1: new framework_1.Achievement(["white", Iconc.star], "First Victory", "Win a map run.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesWon >= 1; }
    }),
    victory_2: new framework_1.Achievement(["red", Iconc.star], "Victories 2", "Win 5 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesWon >= 5; }
    }),
    victory_3: new framework_1.Achievement(["orange", Iconc.star], "Victories 3", "Win 30 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesWon >= 30; }
    }),
    victory_4: new framework_1.Achievement(["yellow", Iconc.star], "Victories 4", "Win 100 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesWon >= 100; },
        notify: "everyone"
    }),
    //games based
    games_1: new framework_1.Achievement(["white", Iconc.itchio], "Games 1", "Play 10 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesFinished >= 10; }
    }),
    games_2: new framework_1.Achievement(["red", Iconc.itchio], "Games 2", "Play 40 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesFinished >= 40; }
    }),
    games_3: new framework_1.Achievement(["orange", Iconc.itchio], "Games 3", "Play 100 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesFinished >= 100; }
    }),
    games_4: new framework_1.Achievement(["yellow", Iconc.itchio], "Games 4", "Play 200 map runs.", {
        checkPlayerGameover: function (p) { return p.globalStats.gamesFinished >= 200; },
        notify: "everyone"
    }),
    //messages based
    messages_1: new framework_1.Achievement(["white", Iconc.chat], "Hello", "Send your first chat message.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.chatMessagesSent >= 1; },
        notify: "nobody"
    }),
    messages_2: new framework_1.Achievement(["red", Iconc.chat], "Chat 2", ["Send 100 chat messages.", "Warning: you will be kicked if you spam the chat."], {
        checkPlayerInfrequent: function (p) { return p.globalStats.chatMessagesSent >= 100; }
    }),
    messages_3: new framework_1.Achievement(["orange", Iconc.chat], "Chat 3", ["Send 500 chat messages.", "Warning: you will be kicked if you spam the chat."], {
        checkPlayerInfrequent: function (p) { return p.globalStats.chatMessagesSent >= 500; }
    }),
    messages_4: new framework_1.Achievement(["yellow", Iconc.chat], "Chat 4", ["Send 2000 chat messages.", "Warning: you will be kicked if you spam the chat."], {
        checkPlayerInfrequent: function (p) { return p.globalStats.chatMessagesSent >= 2000; }
    }),
    messages_5: new framework_1.Achievement(["lime", Iconc.chat], "Chat 4", ["Send 5000 chat messages.", "Warning: you will be kicked if you spam the chat."], {
        checkPlayerInfrequent: function (p) { return p.globalStats.chatMessagesSent >= 5000; },
        notify: "everyone"
    }),
    //blocks built based
    builds_1: new framework_1.Achievement(["white", Iconc.fileText], "The Factory Must Prepare", "Construct 1 buildings.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.blocksPlaced >= 1; },
        notify: "nobody"
    }),
    builds_2: new framework_1.Achievement(["red", Iconc.fileText], "The Factory Must Begin", "Construct 200 buildings.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.blocksPlaced > 200; }
    }),
    builds_3: new framework_1.Achievement(["orange", Iconc.fileText], "The Factory Must Produce", "Construct 1000 buildings.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.blocksPlaced > 1000; }
    }),
    builds_4: new framework_1.Achievement(["yellow", Iconc.fileText], "The Factory Must Grow", "Construct 5000 buildings.", {
        checkPlayerInfrequent: function (p) { return p.globalStats.blocksPlaced > 5000; },
    }),
    //units
    t5: new framework_1.Achievement(Blocks.tetrativeReconstructor.emoji(), "T5", "Control a T5 unit.", {
        modes: ["not", "sandbox"],
        checkPlayerFrequent: function (player) {
            var _a;
            return globals_1.unitsT5.includes((_a = player.unit()) === null || _a === void 0 ? void 0 : _a.type);
        },
    }),
    dibs: new framework_1.Achievement(["green", Blocks.tetrativeReconstructor.emoji()], "Dibs", "Be the first player to control the first T5 unit made by a reconstructor that you placed.", {
        modes: ["not", "sandbox"],
        disabled: true
    }), //TODO
    worm: new framework_1.Achievement(UnitTypes.latum.emoji(), "Worm", "Control a Latum.", {
        checkPlayerFrequent: function (player) {
            var _a;
            return ((_a = player.unit()) === null || _a === void 0 ? void 0 : _a.type) == UnitTypes.latum;
        }
    }),
    //pvp
    above_average: new framework_1.Achievement(Iconc.chartBar, "Above Average", ["Reach a win rate above 50%.", "Must be over at least 20 games of PVP."], {
        modes: ["only", "pvp"],
        checkPlayerInfrequent: function (p) { return p.stats.gamesWon / p.stats.gamesFinished > 0.5 && p.stats.gamesFinished >= 20; }
    }),
    head_start: new framework_1.Achievement(Iconc.commandAttack, "Head Start", ["Win a match of PVP where your opponents have a 5 minute head start.", "Your team must wait for the first 5 minutes without building or descontructing any buildings."], {
        modes: ["only", "pvp"],
        disabled: true
    }), //TODO
    one_v_two: new framework_1.Achievement(["red", Iconc.modePvp], "1v2", "Defeat two (or more) opponents in PVP without help from other players.", {
        modes: ["only", "pvp"],
        disabled: true
    }), //TODO
    //sandbox
    underpowered: new framework_1.Achievement(["red", Blocks.powerSource.emoji()], "Underpowered", "Overload a power source.", {
        modes: ["only", "sandbox"],
        checkFrequent: function () {
            var found = false;
            //deliberate ordering for performance reasons
            Groups.powerGraph.each(function (_a) {
                var graph = _a.graph;
                //we don't need to actually check for power sources, just assume that ~1mil power is a source
                if (graph.lastPowerNeeded > graph.lastPowerProduced && graph.lastPowerNeeded < 1e10 && (graph.lastPowerProduced / Time.delta * 60) >= 999900)
                    found = true;
            });
            return found;
        }
    }),
    //easter eggs
    memory_corruption: new framework_1.Achievement(["red", Iconc.host], "Is the server OK?", "Witness a memory corruption.", {
        notify: "nobody"
    }),
    run_js_without_perms: new framework_1.Achievement(["yellow", Iconc.warning], "XKCD 838", ["Receive a warning from the server that an incident will be reported.", "One of the admin commands has a custom error message."], {
        notify: "everyone"
    }),
    script_kiddie: new framework_1.Achievement(["red", Iconc.warning], "Script Kiddie", ["Pretend to be a hacker. The server will disagree.", "Change your name to something including \"hacker\"."], {
        notify: "nobody"
    }),
    hacker: new framework_1.Achievement(["lightgray", Iconc.host], "Hacker", "Find a bug in the server and report it responsibly.", {
        hidden: true
    }),
    //items based
    items_10k: new framework_1.Achievement(["green", Iconc.distribution], "Cornucopia", "Obtain 10k of every useful resource.", {
        modes: ["not", "sandbox"],
        checkPlayerFrequent: function (player) {
            var _a;
            if (!Vars.state.planet)
                return false;
            return ((_a = player.team().items()) === null || _a === void 0 ? void 0 : _a.has(usefulItems10k[Vars.state.planet.name])) || false;
        },
    }),
    fullVault: new framework_1.Achievement(["green", Blocks.vault.emoji()], "Well Stocked", ["Fill a vault with every obtainable item.", "Requires mixtech."], {
        modes: ["not", "sandbox"],
        checkInfrequent: function (team) {
            return Vars.indexer.getFlagged(team, BlockFlag.storage).contains(boolf(function (b) { return b.block == Blocks.vault && b.items.has(allItems1k) && b.linkedCore == null; }));
        },
    }),
    full_core: new framework_1.Achievement(["green", Blocks.coreAcropolis.emoji()], "Multiblock Incinerator", "Completely fill the core with all obtainable items on a map with core incineration enabled.", {
        modes: ["not", "sandbox"],
        checkFrequent: function (team) {
            var _a;
            if (!Vars.state.planet)
                return false;
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
    siligone: new framework_1.Achievement(["red", Items.silicon.emoji()], "Siligone", ["Run out of silicon.", "You must have reached 2000 silicon before running out."], {
        modes: ["not", "sandbox"]
    }),
    silicon_100k: new framework_1.Achievement(["green", Items.silicon.emoji()], "Silicon for days", "Obtain 100k silicon.", {
        modes: ["not", "sandbox"],
        checkFrequent: function (team) { return team.items().has(Items.silicon, 100000); }
    }),
    //other players based
    alone: new framework_1.Achievement(["red", Iconc.players], "Alone", "Be the only player online for more than two minutes", {
        notify: "nobody"
    }),
    join_playercount_20: new framework_1.Achievement(["lime", Iconc.players], "Is there enough room?", "Join a server with 20 players online", {
        checkPlayerJoin: function () { return Groups.player.size() > 20; },
    }),
    meet_staff: new framework_1.Achievement(["lime", Iconc.hammer], "Griefer Beware", "Meet a staff member in-game", {
        checkPlayerJoin: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).ranksAtLeast("mod"); }); },
    }),
    meet_fish: new framework_1.Achievement(["blue", Iconc.admin], "The Big Fish", "Meet >|||>Fish himself in-game", {
        checkPlayerJoin: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).ranksAtLeast("fish"); }); },
        hidden: true,
    }),
    server_speak: new framework_1.Achievement(["pink", Iconc.host], "It Speaks!", "Hear the server talk in chat."),
    see_marked_griefer: new framework_1.Achievement(["red", Iconc.hammer], "Flying Tonk", "See a marked griefer in-game.", {
        checkInfrequent: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).marked(); }); },
    }),
    //maps based
    beat_map_not_in_rotation: new framework_1.Achievement(["pink", Iconc.map], "How?", "Beat a map that isn't in the list of maps.", {
        notify: "everyone",
        modes: ["not", "pvp"],
        checkGameover: function (team) { return team == Vars.state.rules.defaultTeam && !Vars.state.map.custom; }
    }),
    //misc
    power_1mil: new framework_1.Achievement(["green", Blocks.powerSource.emoji()], "Who needs sources?", "Reach a power production of 1 million without using power sources.", {
        modes: ["not", "sandbox"],
        checkFrequent: function (team) {
            var found = false;
            //deliberate ordering for performance reasons
            Groups.powerGraph.each(function (_a) {
                var _b;
                var graph = _a.graph;
                //we need to actually check for power sources
                if ((graph.lastPowerProduced / Time.delta * 60) > 1e6 &&
                    !graph.producers.contains(boolf(function (b) { return b.block == Blocks.powerSource; })) &&
                    ((_b = graph.producers.firstOpt()) === null || _b === void 0 ? void 0 : _b.team) == team)
                    found = true;
            });
            return found;
        }
    }),
    pacifist_crawler: new framework_1.Achievement(UnitTypes.crawler.emoji(), "Pacifist Crawler", "Control a crawler for 15 minutes without exploding.", {
        modes: ["not", "sandbox"],
        disabled: true
    }), //TODO
    core_low_hp: new framework_1.Achievement(["yellow", Blocks.coreNucleus.emoji()], "Close Call", "Have your core reach less than 50 health, but survive.", {
        modes: ["not", "sandbox"],
    }),
    enemy_core_low_hp: new framework_1.Achievement(["red", Blocks.coreNucleus.emoji()], "So Close", "Cause the enemy core to reach less than 50 health, but survive.", {
        modes: ["not", "sandbox"],
    }),
    verified: new framework_1.Achievement([ranks_1.Rank.active.color, Iconc.ok], "Verified", "Be promoted automatically to ".concat(ranks_1.Rank.active.coloredName(), " rank."), {
        checkPlayerJoin: function (p) { return p.ranksAtLeast("active"); }, notify: "nobody"
    }),
    click_me: new framework_1.Achievement(Iconc.bookOpen, "Clicked", "Run /achievementgrid and click this achievement."),
    afk: new framework_1.Achievement(["yellow", Iconc.lock], "AFK?", "Win a game without interacting with any blocks.", {
        modes: ["not", "sandbox"],
        checkPlayerGameover: function (player, winTeam) {
            return player.team() == winTeam && player.tstats.blockInteractionsThisMap == 0;
        },
    }),
    status_effects_5: new framework_1.Achievement(StatusEffects.electrified.emoji(), "A Furious Cocktail", "Have at least 5 status effects at once.", {
        checkPlayerFrequent: function (p) {
            var unit = p.unit();
            if (!unit)
                return false;
            var statuses = (0, utils_1.getStatuses)(unit);
            return statuses.size >= 5;
        },
        modes: ["not", "sandbox"]
    }),
    drown_big_tank: new framework_1.Achievement(["blue", UnitTypes.conquer.emoji()], "Not Waterproof", "Drown an enemy Conquer or Vanquish.", {
        notify: "everyone",
        modes: ["not", "sandbox"]
    }),
    drown_mace_in_cryo: new framework_1.Achievement(["cyan", UnitTypes.mace.emoji()], "Cooldown", "Drown a Mace in ".concat(Blocks.cryofluid.emoji(), " Cryofluid."), {
        notify: "everyone",
        modes: ["not", "sandbox"]
    }),
    max_boost_duo: new framework_1.Achievement(["yellow", Blocks.duo.emoji()], "In Duo We Trust", "Control a Duo with maximum boosts.", {
        checkPlayerFrequent: function (player) {
            var _a, _b;
            var tile = (_b = (_a = player.unit()) === null || _a === void 0 ? void 0 : _a.tile) === null || _b === void 0 ? void 0 : _b.call(_a);
            if (!tile)
                return false;
            return tile.block == Blocks.duo && !tile.ammo.isEmpty() && tile.ammo.peek().item == Items.silicon && tile.liquids.current() == Liquids.cryofluid && tile.timeScale() >= 2.5;
        },
        notify: "everyone",
        modes: ["not", "sandbox"]
    }),
    foreshadow_overkill: new framework_1.Achievement(["yellow", Blocks.foreshadow.emoji()], "Overkill", ["Kill a Dagger with a maximally boosted Foreshadow.", "Hint: the maximum overdrive is not +150%..."], {
        notify: "everyone",
        modes: ["not", "sandbox"]
    }),
    impacts_15: new framework_1.Achievement(["green", Blocks.impactReactor.emoji()], "Darthscion's Nightmare", "Run 15 impact reactors at full efficiency.", {
        modes: ["not", "sandbox"],
        notify: "everyone",
        checkInfrequent: function (team) {
            var found = false;
            //deliberate ordering for performance reasons
            Groups.powerGraph.each(function (_a) {
                var graph = _a.graph;
                if (graph.producers.size >= 15 && graph.producers.count(function (b) { return b.block == Blocks.impactReactor && b.warmup > 0.99999; }) > 15 && graph.producers.first().team == team)
                    found = true;
            });
            return found;
        },
    }),
    help_help: new framework_1.Achievement(["brown", Iconc.info], "Help with help", "Run /help help", {
        notify: "everyone"
    }),
    ohno: new framework_1.Achievement(["scarlet", UnitTypes.alpha.emoji()], "Oh no", "Control an ohno unit."),
    sniper_duel: new framework_1.Achievement(["yellow", UnitTypes.omura.emoji()], "Sniper duel", "Kill a Foreshadow with an Omura from outside its range."),
    around_the_world: new framework_1.Achievement(Iconc.planet, "Around the World", "Fly your unit around the entire map without entering it, starting from the lower left.", {
        notify: "everyone",
    }),
    human_routerchain: new framework_1.Achievement(["accent", Blocks.router.emoji()], "Human Routerchain", ["Form a human routerchain with 3 other players.", "Does not work with Distributors. Routers must be in a horizontal or vertical line."], {
        notify: "everyone"
    }),
    no_enemy_blocks: new framework_1.Achievement(["scarlet", Iconc.commandAttack], "Eradication", ["Complete an attack map with no enemy blocks remaining.", "The map must have started with at least 500 enemy blocks"], {
        modes: ["only", "attack"],
        notify: "everyone",
        checkGameover: function () {
            return eligibleForClearAllBuildings && !Groups.build.contains(function (b) { return b.team != Vars.state.rules.defaultTeam && b.team != Team.derelict && !b.block.privileged; });
        }
    }),
    see_sussy_impersonator: new framework_1.Achievement(["red", Iconc.lock], "There is one impostor among us", "See a ".concat(config_1.prefixes.impersonator, " in-game."), {
        checkInfrequent: function () { return Groups.player.contains(function (p) { return players_1.FishPlayer.get(p).isImpersonator; }); },
    }),
    see_sussy_impersonator_2: new framework_1.Achievement(["scarlet", Iconc.lock], "There are two impostors among us", "See two ".concat(config_1.prefixes.impersonator, "s in-game at once."), {
        checkInfrequent: function () { return Groups.player.count(function (p) { return players_1.FishPlayer.get(p).isImpersonator; }) == 2; },
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
    if (!config_1.Gamemode.sandbox()) {
        if (unit.type == UnitTypes.mace && ((_b = unit.tileOn()) === null || _b === void 0 ? void 0 : _b.floor()) == Blocks.cryofluid)
            exports.Achievements.drown_mace_in_cryo.grantToAllOnline();
        else if (unit.type == UnitTypes.conquer || unit.type == UnitTypes.vanquish) {
            if (config_1.Gamemode.pvp()) {
                Vars.state.teams.active.map(function (t) { return t.team; }).select(function (t) { return t !== unit.team; }).each(function (t) { return exports.Achievements.drown_big_tank.grantToAllOnline(t); });
            }
            else {
                if (unit.team !== Vars.state.rules.defaultTeam)
                    exports.Achievements.drown_big_tank.grantToAllOnline();
            }
        }
    }
});
Events.on(EventType.UnitBulletDestroyEvent, function (_a) {
    var _b;
    var unit = _a.unit, bullet = _a.bullet;
    if (!config_1.Gamemode.sandbox() && unit.type == UnitTypes.dagger && ((_b = bullet.owner) === null || _b === void 0 ? void 0 : _b.block) == Blocks.foreshadow) {
        var build = bullet.owner;
        if (build.liquids.current() == Liquids.cryofluid && build.timeScale() >= 3)
            exports.Achievements.foreshadow_overkill.grantToAllOnline(build.team);
    }
});
function getPlayerRouter(x, y) {
    var _a;
    var build = Vars.world.build(x, y);
    if ((build === null || build === void 0 ? void 0 : build.block) == Blocks.router)
        return (_a = build.unit) === null || _a === void 0 ? void 0 : _a.getPlayer();
    else
        return null;
}
Events.on(EventType.UnitControlEvent, function (_a) {
    var _b;
    var player = _a.player, unit = _a.unit;
    var tile = (_b = unit === null || unit === void 0 ? void 0 : unit.tile) === null || _b === void 0 ? void 0 : _b.call(unit);
    if (!tile)
        return;
    if (tile.block == Blocks.router) {
        var x = tile.tileX();
        var y = tile.tileY();
        var players = [player];
        var temp = void 0;
        for (var i = 1; i <= 3; i++) {
            if ((temp = getPlayerRouter(x + i, y)))
                players.push(temp);
            else
                break;
        }
        for (var i = 1; i <= 3; i++) {
            if ((temp = getPlayerRouter(x - i, y)))
                players.push(temp);
            else
                break;
        }
        if (players.length >= 4) {
            players.forEach(function (p) { return exports.Achievements.human_routerchain.grantTo(players_1.FishPlayer.get(p)); });
        }
        players = [player];
        for (var i = 1; i <= 3; i++) {
            if ((temp = getPlayerRouter(x, y + i)))
                players.push(temp);
            else
                break;
        }
        for (var i = 1; i <= 3; i++) {
            if ((temp = getPlayerRouter(x, y - i)))
                players.push(temp);
            else
                break;
        }
        if (players.length >= 4) {
            players.forEach(function (p) { return exports.Achievements.human_routerchain.grantTo(players_1.FishPlayer.get(p)); });
        }
    }
});
Events.on(EventType.BuildingBulletDestroyEvent, function (_a) {
    var _b;
    var build = _a.build, bullet = _a.bullet;
    if (!config_1.Gamemode.sandbox() && build.block == Blocks.foreshadow && ((_b = bullet.owner) === null || _b === void 0 ? void 0 : _b.type) == UnitTypes.omura) {
        var unit = bullet.owner;
        var player = unit.getPlayer();
        if (player && !unit.within(build, build.range() + unit.hitSize / 2))
            exports.Achievements.sniper_duel.grantTo(players_1.FishPlayer.get(player));
    }
});
var siliconReached = Team.all.map(function (_) { return false; });
Events.on(EventType.GameOverEvent, function () { return siliconReached = Team.all.map(function (_) { return false; }); });
var isAlone = 0;
Timer.schedule(function () {
    if (!Vars.state.gameOver && !config_1.Gamemode.sandbox()) {
        Vars.state.teams.active.each(function (_a) {
            var team = _a.team;
            if (team.items().has(Items.silicon, 2000))
                siliconReached[team.id] = true;
            else if (siliconReached[team.id] && team.items().get(Items.silicon) == 0)
                exports.Achievements.siligone.grantToAllOnline(team);
        });
    }
    if (Groups.player.size() == 1) {
        if (isAlone == 0)
            isAlone = Date.now();
        else if (Date.now() > isAlone + funcs_1.Duration.minutes(2))
            exports.Achievements.alone.grantToAllOnline();
    }
    else
        isAlone = 0;
}, 2, 2);
var coreHealthTime = new Map();
if (!config_1.Gamemode.sandbox())
    Timer.schedule(function () {
        coreHealthTime.forEach(function (value, core) {
            if (Date.now() > value) {
                if (core.dead) {
                    coreHealthTime.delete(core);
                }
                else if (core.health > 50) {
                    //grant achievement
                    exports.Achievements.core_low_hp.grantToAllOnline(core.team);
                    players_1.FishPlayer.forEachPlayer(function (p) {
                        if (core.team != p.team())
                            exports.Achievements.enemy_core_low_hp.grantTo(p);
                    });
                    coreHealthTime.delete(core);
                }
            }
        });
        Vars.state.teams.active.flatMap(function (t) { return t.cores; }).each(function (core) {
            if (core.health < 50 && !coreHealthTime.get(core))
                coreHealthTime.set(core, Date.now() + 12000);
        });
    }, 1, 1);
var aroundTheWorld = {};
Timer.schedule(function () {
    var e_1, _a;
    players_1.FishPlayer.forEachPlayer(function (p) {
        var _a;
        var _b;
        var unit = p.unit();
        if (unit && unit.x < 0 && unit.y < 0) {
            (_a = aroundTheWorld[_b = p.uuid]) !== null && _a !== void 0 ? _a : (aroundTheWorld[_b] = { player: p, unit: unit, side: "left" });
        }
    });
    var _loop_1 = function (uuid, entry) {
        if (!(function () {
            if (entry.unit.dead)
                return false;
            var left = entry.unit.x < 0;
            var bottom = entry.unit.y < 0;
            var right = entry.unit.x > (Vars.world.width() - 1) * 8;
            var top = entry.unit.y > (Vars.world.height() - 1) * 8;
            switch (entry.side) {
                case "left":
                    if (!left)
                        return false;
                    if (top)
                        entry.side = "top";
                    break;
                case "top":
                    if (!top)
                        return false;
                    if (right)
                        entry.side = "right";
                    break;
                case "right":
                    if (!right)
                        return false;
                    if (bottom)
                        entry.side = "bottom";
                    break;
                case "bottom":
                    if (!bottom)
                        return false;
                    if (left) {
                        exports.Achievements.around_the_world.grantTo(entry.player, true);
                        return false;
                    }
                    break;
            }
            return true;
        })()) {
            Call.effect(Fx.shieldBreak, entry.unit.x, entry.unit.y, 0, Color.red);
            delete aroundTheWorld[uuid];
        }
        else
            Call.effect(Fx.shieldBreak, entry.unit.x, entry.unit.y, 0, Color.green);
    };
    try {
        for (var _b = __values(Object.entries(aroundTheWorld)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), uuid = _d[0], entry = _d[1];
            _loop_1(uuid, entry);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}, 1, 0.5);
Events.on(EventType.GameOverEvent, function () { return coreHealthTime.clear(); });
var eligibleForClearAllBuildings = false;
Events.on(EventType.WorldLoadEvent, function () {
    coreHealthTime.clear();
    eligibleForClearAllBuildings = Groups.build.count(function (b) { return b.team != Vars.state.rules.defaultTeam && b.team != Team.derelict && !b.block.privileged; }) > 500;
});
globals_1.FishEvents.on("scriptKiddie", function (_, p) { return Timer.schedule(function () { return exports.Achievements.script_kiddie.grantTo(p); }, 2); });
globals_1.FishEvents.on("memoryCorruption", function () { return exports.Achievements.memory_corruption.grantToAllOnline(); });
globals_1.FishEvents.on("serverSays", function () { return exports.Achievements.server_speak.grantToAllOnline(); });
