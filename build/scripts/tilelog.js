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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToTileHistory = exports.tileHistory = void 0;
exports.getTileHistory = getTileHistory;
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var players_1 = require("/players");
var utils_1 = require("/utils");
exports.tileHistory = new IntMap();
var tilelogActions = [
    "built", "broke", "configured", "rotated", "dropped", "picked up", "setblocked",
    "destroyed", "killed", "controlled"
];
exports.addToTileHistory = (0, utils_1.logErrors)("Error while saving a tilelog entry", function (e) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    // eslint-disable-next-line prefer-const
    var tile, uuid, action, type, time = Date.now();
    if (e instanceof EventType.BlockBuildBeginEvent) {
        tile = e.tile;
        uuid = (_e = (_c = (_b = (_a = e.unit) === null || _a === void 0 ? void 0 : _a.player) === null || _b === void 0 ? void 0 : _b.uuid()) !== null && _c !== void 0 ? _c : (_d = e.unit) === null || _d === void 0 ? void 0 : _d.type.name) !== null && _e !== void 0 ? _e : "unknown";
        if (e.breaking) {
            action = "broke";
            type = (tile.build instanceof ConstructBlock.ConstructBuild) ? tile.build.previous.id : "unknown";
        }
        else {
            action = "built";
            type = (tile.build instanceof ConstructBlock.ConstructBuild) ? tile.build.current.id : "unknown";
        }
    }
    else if (e instanceof EventType.ConfigEvent) {
        tile = e.tile.tile;
        uuid = (_g = (_f = e.player) === null || _f === void 0 ? void 0 : _f.uuid()) !== null && _g !== void 0 ? _g : "unknown";
        if (uuid != "unknown") {
            var fishP = players_1.FishPlayer.getById(uuid);
            if (fishP)
                fishP.tstats.blockInteractionsThisMap++;
        }
        action = "configured";
        type = tile.blockID();
    }
    else if (e instanceof EventType.BuildRotateEvent) {
        tile = e.build.tile;
        uuid = (_m = (_k = (_j = (_h = e.unit) === null || _h === void 0 ? void 0 : _h.player) === null || _j === void 0 ? void 0 : _j.uuid()) !== null && _k !== void 0 ? _k : (_l = e.unit) === null || _l === void 0 ? void 0 : _l.type.name) !== null && _m !== void 0 ? _m : "unknown";
        if (uuid != "unknown") {
            var fishP = players_1.FishPlayer.getById(uuid);
            if (fishP)
                fishP.tstats.blockInteractionsThisMap++;
        }
        action = "rotated";
        type = tile.blockID();
    }
    else if (e instanceof EventType.UnitDestroyEvent) {
        tile = e.unit.tileOn();
        if (!tile)
            return;
        if (!e.unit.type.playerControllable)
            return;
        uuid = e.unit.isPlayer() ? e.unit.getPlayer().uuid() : (_o = e.unit.lastCommanded) !== null && _o !== void 0 ? _o : "unknown";
        action = "killed";
        type = e.unit.type.id;
    }
    else if (e instanceof EventType.BlockDestroyEvent) {
        if (config_1.Gamemode.attack() && ((_p = e.tile.build) === null || _p === void 0 ? void 0 : _p.team) != Vars.state.rules.defaultTeam)
            return; //Don't log destruction of enemy blocks
        tile = e.tile;
        uuid = "[[something]";
        action = "killed";
        type = tile.blockID();
    }
    else if (e instanceof EventType.PayloadDropEvent) {
        action = "dropped";
        var controller = e.carrier.controller();
        uuid = (_s = (_r = (_q = e.carrier.player) === null || _q === void 0 ? void 0 : _q.uuid()) !== null && _r !== void 0 ? _r : (controller instanceof LogicAI && controller.controller ?
            "".concat(e.carrier.type.name, " controlled by ").concat(controller.controller.block.name, " at ").concat(controller.controller.tileX(), ",").concat(controller.controller.tileY(), " last accessed by ").concat(e.carrier.getControllerName())
            : null)) !== null && _s !== void 0 ? _s : e.carrier.type.name;
        if (e.build) {
            tile = e.build.tile;
            type = tile.blockID();
        }
        else if (e.unit) {
            tile = e.unit.tileOn();
            if (!tile)
                return;
            type = e.unit.type.id;
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
            type = tile.blockID();
        }
        else if (e.unit) {
            tile = e.unit.tileOn();
            if (!tile)
                return;
            type = e.unit.type.id;
        }
        else
            return;
    }
    else if (e instanceof EventType.UnitControlEvent) {
        if (e.unit instanceof Packages.mindustry.gen.BlockUnitUnit) {
            action = "controlled";
            tile = (_t = e.unit) === null || _t === void 0 ? void 0 : _t.tile().tile;
            if (!tile)
                return;
            type = tile.blockID();
            uuid = e.player.uuid();
        }
        else
            return;
    }
    else if (e instanceof Object && "pos" in e && "uuid" in e && "action" in e && "type" in e) {
        var pos = void 0;
        (pos = e.pos, uuid = e.uuid, action = e.action, type = e.type);
        tile = (_u = Vars.world.tile(pos.split(",")[0], pos.split(",")[1])) !== null && _u !== void 0 ? _u : (0, funcs_1.crash)("Cannot log ".concat(action, " at ").concat(pos, ": Nonexistent tile"));
    }
    else
        return;
    if (tile == null)
        return;
    [tile, uuid, action, type, time];
    tile.getLinkedTiles(function (t) {
        var pos = t.pos();
        var serializedData = exports.tileHistory.get(pos);
        var existingData = serializedData ? funcs_1.StringIO.read(serializedData, function (str) { return str.readArray(function (d) { return ({
            action: d.readEnumString(tilelogActions),
            uuid: d.readString(3),
            time: d.readNumber(16),
            type: d.readNumber(4),
        }); }, 1); }) : [];
        existingData.push({
            action: action,
            uuid: uuid,
            time: time,
            type: type
        });
        existingData = existingData.slice(-9);
        //Write
        exports.tileHistory.put(pos, funcs_1.StringIO.write(existingData, function (str, data) { return str.writeArray(data, function (el) {
            str.writeEnumString(el.action, tilelogActions);
            str.writeString(el.uuid, 3);
            str.writeNumber(el.time, 16);
            str.writeNumber(el.type, 4);
        }, 1); }));
    });
});
function getTileHistory(x, y) {
    var historyData = exports.tileHistory.get(Point2.pack(x, y));
    if (!historyData)
        return null;
    return funcs_1.StringIO.read(historyData, function (str) { return str.readArray(function (d) { return ({
        action: d.readString(2),
        uuid: d.readString(3),
        time: d.readNumber(16),
        type: d.readString(2),
    }); }, 1); }).map(function (h) { return (__assign(__assign({}, h), { info: globals_1.uuidPattern.test(h.uuid) ? Vars.netServer.admins.getInfoOptional(h.uuid) : null })); });
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
    //TODO: save to a file
    exports.tileHistory.clear();
});
