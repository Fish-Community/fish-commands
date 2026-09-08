"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the tilelog system, which stores information about the history of each tile.
*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.addToTileHistory = exports.tileHistory = void 0;
exports.getTileHistory = getTileHistory;
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var players_1 = require("/players");
var utils_1 = require("/utils");
exports.tileHistory = {};
exports.addToTileHistory = (0, utils_1.logErrors)("Error while saving a tilelog entry", function (e) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
    // eslint-disable-next-line prefer-const
    var tile, uuid, action, type, time = Date.now();
    if (e instanceof EventType.BlockBuildBeginEvent) {
        tile = e.tile;
        uuid = (_e = (_c = (_b = (_a = e.unit) === null || _a === void 0 ? void 0 : _a.player) === null || _b === void 0 ? void 0 : _b.uuid()) !== null && _c !== void 0 ? _c : (_d = e.unit) === null || _d === void 0 ? void 0 : _d.type.name) !== null && _e !== void 0 ? _e : "unknown";
        if (e.breaking) {
            action = "broke";
            type = (e.tile.build instanceof ConstructBlock.ConstructBuild) ? e.tile.build.previous.name : "unknown";
            if (((_g = (_f = e.unit) === null || _f === void 0 ? void 0 : _f.player) === null || _g === void 0 ? void 0 : _g.uuid()) && ((_h = e.tile.build.prevBuild.firstOpt()) === null || _h === void 0 ? void 0 : _h.team) != Team.derelict) {
                var fishP = players_1.FishPlayer.get(e.unit.player);
                //TODO move this code
                fishP.tstats.blocksBroken++;
                fishP.tstats.blockInteractionsThisMap++;
                fishP.updateStats(function (stats) { return stats.blocksBroken++; });
            }
        }
        else {
            action = "built";
            type = (e.tile.build instanceof ConstructBlock.ConstructBuild) ? e.tile.build.current.name : "unknown";
            if ((_k = (_j = e.unit) === null || _j === void 0 ? void 0 : _j.player) === null || _k === void 0 ? void 0 : _k.uuid()) {
                var fishP = players_1.FishPlayer.get(e.unit.player);
                //TODO move this code
                fishP.updateStats(function (stats) { return stats.blocksPlaced++; });
                fishP.tstats.blockInteractionsThisMap++;
            }
        }
    }
    else if (e instanceof EventType.ConfigEvent) {
        tile = e.tile.tile;
        uuid = (_m = (_l = e.player) === null || _l === void 0 ? void 0 : _l.uuid()) !== null && _m !== void 0 ? _m : "unknown";
        if (uuid != "unknown") {
            var fishP = players_1.FishPlayer.getById(uuid);
            if (fishP)
                fishP.tstats.blockInteractionsThisMap++;
        }
        action = "configured";
        type = e.tile.block.name;
    }
    else if (e instanceof EventType.BuildRotateEvent) {
        tile = e.build.tile;
        uuid = (_s = (_q = (_p = (_o = e.unit) === null || _o === void 0 ? void 0 : _o.player) === null || _p === void 0 ? void 0 : _p.uuid()) !== null && _q !== void 0 ? _q : (_r = e.unit) === null || _r === void 0 ? void 0 : _r.type.name) !== null && _s !== void 0 ? _s : "unknown";
        if (uuid != "unknown") {
            var fishP = players_1.FishPlayer.getById(uuid);
            if (fishP)
                fishP.tstats.blockInteractionsThisMap++;
        }
        action = "rotated";
        type = e.build.block.name;
    }
    else if (e instanceof EventType.UnitDestroyEvent) {
        tile = e.unit.tileOn();
        if (!tile)
            return;
        if (!e.unit.type.playerControllable)
            return;
        uuid = e.unit.isPlayer() ? e.unit.getPlayer().uuid() : (_t = e.unit.lastCommanded) !== null && _t !== void 0 ? _t : "unknown";
        action = "killed";
        type = e.unit.type.name;
    }
    else if (e instanceof EventType.BlockDestroyEvent) {
        if (config_1.Gamemode.attack() && ((_u = e.tile.build) === null || _u === void 0 ? void 0 : _u.team) != Vars.state.rules.defaultTeam)
            return; //Don't log destruction of enemy blocks
        tile = e.tile;
        uuid = "[[something]";
        action = "killed";
        type = (_w = (_v = e.tile.block()) === null || _v === void 0 ? void 0 : _v.name) !== null && _w !== void 0 ? _w : "air";
    }
    else if (e instanceof EventType.PayloadDropEvent) {
        action = "pay-dropped";
        var controller = e.carrier.controller();
        uuid = (_z = (_y = (_x = e.carrier.player) === null || _x === void 0 ? void 0 : _x.uuid()) !== null && _y !== void 0 ? _y : (controller instanceof LogicAI && controller.controller ?
            "".concat(e.carrier.type.name, " controlled by ").concat(controller.controller.block.name, " at ").concat(controller.controller.tileX(), ",").concat(controller.controller.tileY(), " last accessed by ").concat(e.carrier.getControllerName())
            : null)) !== null && _z !== void 0 ? _z : e.carrier.type.name;
        if (e.build) {
            tile = e.build.tile;
            type = e.build.block.name;
        }
        else if (e.unit) {
            tile = e.unit.tileOn();
            if (!tile)
                return;
            type = e.unit.type.name;
        }
        else
            return;
    }
    else if (e instanceof EventType.PickupEvent) {
        action = "picked up";
        if (e.carrier.isPlayer())
            return; //This event would have been handled by actionfilter
        var controller = e.carrier.controller();
        if (!(controller instanceof LogicAI && controller.controller != null))
            return;
        uuid = "".concat(e.carrier.type.name, " controlled by ").concat(controller.controller.block.name, " at ").concat(controller.controller.tileX(), ",").concat(controller.controller.tileY(), " last accessed by ").concat(e.carrier.getControllerName());
        if (e.build) {
            tile = e.build.tile;
            type = e.build.block.name;
        }
        else if (e.unit) {
            tile = e.unit.tileOn();
            if (!tile)
                return;
            type = e.unit.type.name;
        }
        else
            return;
    }
    else if (e instanceof EventType.UnitControlEvent) {
        if (e.unit instanceof Packages.mindustry.gen.BlockUnitUnit) {
            action = "controlled";
            tile = (_0 = e.unit) === null || _0 === void 0 ? void 0 : _0.tile().tile;
            if (!tile)
                return;
            type = (_2 = (_1 = tile.block()) === null || _1 === void 0 ? void 0 : _1.name) !== null && _2 !== void 0 ? _2 : "air";
            uuid = e.player.uuid();
        }
        else
            return;
    }
    else if (e instanceof Object && "pos" in e && "uuid" in e && "action" in e && "type" in e) {
        var pos = void 0;
        (pos = e.pos, uuid = e.uuid, action = e.action, type = e.type);
        tile = (_3 = Vars.world.tile(pos.split(",")[0], pos.split(",")[1])) !== null && _3 !== void 0 ? _3 : (0, funcs_1.crash)("Cannot log ".concat(action, " at ").concat(pos, ": Nonexistent tile"));
    }
    else
        return;
    if (tile == null)
        return;
    [tile, uuid, action, type, time];
    tile.getLinkedTiles(function (t) {
        var pos = "".concat(t.x, ",").concat(t.y);
        var existingData = exports.tileHistory[pos] ? funcs_1.StringIO.read(exports.tileHistory[pos], function (str) { return str.readArray(function (d) { return ({
            action: d.readString(2),
            uuid: d.readString(3),
            time: d.readNumber(16),
            type: d.readString(2),
        }); }, 1); }) : [];
        existingData.push({
            action: action,
            uuid: uuid,
            time: time,
            type: type
        });
        existingData = existingData.slice(-9);
        //Write
        exports.tileHistory[t.x + ',' + t.y] = funcs_1.StringIO.write(existingData, function (str, data) { return str.writeArray(data, function (el) {
            str.writeString(el.action, 2);
            str.writeString(el.uuid, 3);
            str.writeNumber(el.time, 16);
            str.writeString(el.type, 2);
        }, 1); });
    });
});
function getTileHistory(x, y, player) {
    var historyData = exports.tileHistory["".concat(x, ",").concat(y)];
    if (!historyData)
        return null;
    return funcs_1.StringIO.read(historyData, function (str) { return str.readArray(function (d) { return ({
        action: d.readString(2),
        uuid: d.readString(3),
        time: d.readNumber(16),
        type: d.readString(2),
    }); }, 1); }).map(function (h) { return (__assign(__assign({}, h), { info: globals_1.uuidPattern.test(h.uuid) ? player(Vars.netServer.admins.getInfoOptional(h.uuid)) : null })); });
}
Events.on(EventType.BlockBuildBeginEvent, exports.addToTileHistory);
Events.on(EventType.BuildRotateEvent, exports.addToTileHistory);
Events.on(EventType.ConfigEvent, exports.addToTileHistory);
Events.on(EventType.PickupEvent, exports.addToTileHistory);
Events.on(EventType.PayloadDropEvent, exports.addToTileHistory);
Events.on(EventType.UnitDestroyEvent, exports.addToTileHistory);
Events.on(EventType.BlockDestroyEvent, exports.addToTileHistory);
Events.on(EventType.UnitControlEvent, exports.addToTileHistory);
Events.on(EventType.GameOverEvent, function (e) {
    var e_1, _a;
    try {
        for (var _b = __values(Object.keys(exports.tileHistory)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            //clear tilelog
            exports.tileHistory[key] = null;
            delete exports.tileHistory[key];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
});
