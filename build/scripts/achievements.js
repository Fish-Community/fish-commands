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
exports.Achievement = void 0;
var config_1 = require("/config");
var players_1 = require("/players");
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
var templateObject_1, templateObject_2;
