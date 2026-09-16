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
exports.readFile = readFile;
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var maps_1 = require("/maps");
var players_1 = require("/players");
var utils_1 = require("/utils");
exports.tileHistory = new IntMap();
var unitTypeOffset = 5000;
var tilelogActions = [
    "built", "broke", "configured", "rotated", "dropped", "picked up", "setblocked",
    "destroyed", "killed", "controlled"
];
exports.addToTileHistory = (0, utils_1.logErrors)("Error while saving a tilelog entry", function (e) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    // eslint-disable-next-line prefer-const
    var tile, uuid, action, type, time = Date.now(), rotation = 0, rotationDirection = false;
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
            rotation = (_g = (_f = tile.build) === null || _f === void 0 ? void 0 : _f.rotation) !== null && _g !== void 0 ? _g : 0;
        }
    }
    else if (e instanceof EventType.ConfigEvent) {
        tile = e.tile.tile;
        uuid = (_j = (_h = e.player) === null || _h === void 0 ? void 0 : _h.uuid()) !== null && _j !== void 0 ? _j : "unknown";
        if (uuid != "unknown") {
            var fishP = players_1.FishPlayer.getById(uuid);
            if (fishP)
                fishP.tstats.blockInteractionsThisMap++;
        }
        action = "configured";
        type = tile.blockID();
        rotation = e.tile.rotation;
    }
    else if (e instanceof EventType.BuildRotateEvent) {
        tile = e.build.tile;
        uuid = (_p = (_m = (_l = (_k = e.unit) === null || _k === void 0 ? void 0 : _k.player) === null || _l === void 0 ? void 0 : _l.uuid()) !== null && _m !== void 0 ? _m : (_o = e.unit) === null || _o === void 0 ? void 0 : _o.type.name) !== null && _p !== void 0 ? _p : "unknown";
        if (uuid != "unknown") {
            var fishP = players_1.FishPlayer.getById(uuid);
            if (fishP)
                fishP.tstats.blockInteractionsThisMap++;
        }
        action = "rotated";
        type = tile.blockID();
        rotation = e.previous;
        rotationDirection = getRotationDirection(rotation, e.build.rotation);
    }
    else if (e instanceof EventType.UnitDestroyEvent) {
        tile = e.unit.tileOn();
        if (!tile)
            return;
        if (!e.unit.type.playerControllable)
            return;
        uuid = e.unit.isPlayer() ? e.unit.getPlayer().uuid() : (_q = e.unit.lastCommanded) !== null && _q !== void 0 ? _q : "unknown";
        action = "killed";
        type = e.unit.type.id + unitTypeOffset;
    }
    else if (e instanceof EventType.BlockDestroyEvent) {
        if (config_1.Gamemode.attack() && ((_r = e.tile.build) === null || _r === void 0 ? void 0 : _r.team) != Vars.state.rules.defaultTeam)
            return; //Don't log destruction of enemy blocks
        tile = e.tile;
        uuid = "[[something]";
        action = "killed";
        type = tile.blockID();
    }
    else if (e instanceof EventType.PayloadDropEvent) {
        action = "dropped";
        var controller = e.carrier.controller();
        uuid = (_u = (_t = (_s = e.carrier.player) === null || _s === void 0 ? void 0 : _s.uuid()) !== null && _t !== void 0 ? _t : (controller instanceof LogicAI && controller.controller ?
            "".concat(e.carrier.type.name, " controlled by ").concat(controller.controller.block.name, " at ").concat(controller.controller.tileX(), ",").concat(controller.controller.tileY(), " last accessed by ").concat(e.carrier.getControllerName())
            : null)) !== null && _u !== void 0 ? _u : e.carrier.type.name;
        if (e.build) {
            tile = e.build.tile;
            rotation = e.build.rotation;
            type = tile.blockID();
        }
        else if (e.unit) {
            tile = e.unit.tileOn();
            if (!tile)
                return;
            type = e.unit.type.id + unitTypeOffset;
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
            type = e.unit.type.id + unitTypeOffset;
        }
        else
            return;
    }
    else if (e instanceof EventType.UnitControlEvent) {
        if (e.unit instanceof Packages.mindustry.gen.BlockUnitUnit) {
            action = "controlled";
            tile = (_v = e.unit) === null || _v === void 0 ? void 0 : _v.tile().tile;
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
        (pos = e.pos, uuid = e.uuid, action = e.action, type = e.type, rotation = e.rotation);
        tile = (_w = Vars.world.tile(pos.split(",")[0], pos.split(",")[1])) !== null && _w !== void 0 ? _w : (0, funcs_1.crash)("Cannot log ".concat(action, " at ").concat(pos, ": Nonexistent tile"));
    }
    else
        return;
    if (tile == null)
        return;
    [tile, uuid, action, type, time, rotation, rotationDirection];
    tile.getLinkedTiles(function (t) {
        var pos = t.pos();
        var serializedData = exports.tileHistory.get(pos);
        var existingData = serializedData ? funcs_1.StringIO.read(serializedData, function (str) { return str.readArray(function (d) { return ({
            action: d.readEnumString(tilelogActions),
            uuid: d.readString(3),
            time: d.readNumber(16),
            type: d.readNumber(4),
            rotation: d.readNumber(1),
            isRootTile: d.readBool(),
            rotationDirection: d.readBool(),
        }); }, 1); }) : [];
        existingData.push({
            action: action,
            uuid: uuid,
            time: time,
            type: type,
            rotation: rotation,
            rotationDirection: rotationDirection,
            isRootTile: t == tile,
        });
        existingData = existingData.slice(-9);
        //Write
        exports.tileHistory.put(pos, funcs_1.StringIO.write(existingData, function (str, data) { return str.writeArray(data, function (el) {
            str.writeEnumString(el.action, tilelogActions);
            str.writeString(el.uuid, 3);
            str.writeNumber(el.time, 16);
            str.writeNumber(el.type, 4);
            str.writeNumber(el.rotation, 1);
            str.writeBool(el.isRootTile);
            str.writeBool(el.rotationDirection);
        }, 1); }));
    });
});
function getTileHistory(x, y, history) {
    if (history === void 0) { history = exports.tileHistory; }
    var historyData = history.get(Point2.pack(x, y));
    if (!historyData)
        return null;
    return funcs_1.StringIO.read(historyData, function (str) { return str.readArray(function (d) { return ({
        action: d.readEnumString(tilelogActions),
        uuid: d.readString(3),
        time: d.readNumber(16),
        type: d.readNumber(4),
        rotation: d.readNumber(1),
        isRootTile: d.readBool(),
        rotationDirection: d.readBool(),
    }); }, 1); }).map(function (h) { return (__assign(__assign({}, h), { type: (h.type >= unitTypeOffset ? Vars.content.unit(h.type - unitTypeOffset) : Vars.content.block(h.type)).localizedName, info: globals_1.uuidPattern.test(h.uuid) ? Vars.netServer.admins.getInfoOptional(h.uuid) : null })); });
}
/** Writes tileHistory to the specified file. */
function writeToFile(file) {
    var stream = new DataOutputStream(file.write());
    try {
        stream.writeInt(exports.tileHistory.size);
        exports.tileHistory.forEach(function (_a) {
            var key = _a.key, value = _a.value;
            stream.writeInt(key);
            stream.writeUTF(value);
        });
    }
    finally {
        stream.close();
    }
}
/** Reads tilelog data from the specified file. */
function readFile(file) {
    var stream = new DataInputStream(file.read(1024));
    try {
        var size = stream.readInt();
        var map = new IntMap(size);
        Log.info("Reading ".concat(size, " values"));
        for (var i = 0; i < size; i++) {
            map.put(stream.readInt(), stream.readUTF());
        }
        return map;
    }
    finally {
        stream.close();
    }
}
function getFile(runID) {
    return Vars.dataDirectory.child('tilelog-data').child("".concat(runID, ".bin"));
}
/** Writes tileHistory to the file for the current map run. */
var writeToCurrentRunFile = (0, utils_1.logErrors)("Error writing tilelog entries", function () {
    var _a;
    var currentRun = (_a = maps_1.PartialMapRun.current) === null || _a === void 0 ? void 0 : _a.startTime;
    if (currentRun && exports.tileHistory.size > 0) {
        Log.info("Writing to run ".concat(currentRun));
        writeToFile(getFile(currentRun));
    }
});
/** Copy pasted from foos */
function getRotationDirection(old, n) {
    return old < n && (old != 0 || n != 3) || old == 3 && n == 0;
}
function writeEntry(entry, writes) {
    var wasPlayer = false;
    if (globals_1.uuidPattern.test(entry.uuid)) {
        wasPlayer = true;
        var data = players_1.FishPlayer.getById(entry.uuid);
        if (data === null || data === void 0 ? void 0 : data.player) {
            writes.bool(true);
            writes.str(data.name);
            writes.str(data.cleanedName);
            writes.i(data.player.id);
        }
        else {
            var info = Vars.netServer.admins.getInfoOptional(entry.uuid);
            if (info) {
                writes.bool(true);
                writes.str(info.lastName);
                writes.str(info.plainLastName());
                writes.i(-1);
            }
            else {
                writes.bool(false);
            }
        }
    }
    else if (entry.uuid) {
        writes.bool(true);
        writes.str(entry.uuid);
        writes.str(entry.uuid); //write it twice
        writes.i(-1);
    }
    else {
        writes.bool(false);
    }
    var diff = Date.now() - entry.time;
    writes.l(Math.floor(diff / 1000)); //subtracted from current time to make unsynced clocks work
    writes.i(diff % 1000); //we don't care
    writes.b({
        built: 0,
        broke: 1,
        configured: 2,
        rotated: 3,
        destroyed: 4,
        killed: 5,
        "picked up": 7,
        dropped: 8,
        //these two get mapped to the closest thing that foo knows about
        setblocked: 0, //we tell foos that the server (player id 2147483647) placed it
        controlled: 2, //we tell foos that it was configured with null
    }[entry.action]);
    switch (entry.action) {
        case "built":
        case "dropped":
            writes.s(entry.type);
            writes.b(entry.rotation);
            TypeIO.writeObject(writes, null); //TODO: config
            writes.bool(entry.isRootTile);
            break;
        case "broke":
        case "picked up":
        case "destroyed":
            writes.s(entry.type);
            break;
        case "configured":
            writes.s(entry.type);
            writes.b(entry.rotation);
            TypeIO.writeObject(writes, null); //TODO: config
            break;
        case "controlled":
            writes.s(entry.type);
            writes.b(entry.rotation);
            TypeIO.writeObject(writes, null);
            break;
        case "rotated":
            writes.s(entry.type);
            writes.b(entry.rotation);
            writes.bool(entry.rotationDirection);
            break;
        case "killed":
            writes.s(entry.type - unitTypeOffset);
            writes.bool(wasPlayer);
            break;
    }
}
globals_1.FishEvents.on("saveData", writeToCurrentRunFile);
Events.on(EventType.SaveLoadEvent, (0, utils_1.logErrors)("Error loading tilelog entries", function () {
    var _a;
    var currentRun = (_a = maps_1.PartialMapRun.current) === null || _a === void 0 ? void 0 : _a.startTime;
    if (currentRun != undefined && exports.tileHistory.size == 0) {
        Log.info("Reading run ".concat(currentRun));
        var file = Vars.dataDirectory.child('tilelog-data').child("".concat(currentRun, ".bin"));
        if (file.exists()) {
            Log.info("DEBUG: file exists, reading");
            exports.tileHistory.putAll(readFile(file));
        }
        else
            Log.info("DEBUG: b ".concat(currentRun));
    }
    else
        Log.info("DEBUG: ".concat(exports.tileHistory.size));
}));
Events.on(EventType.BlockBuildBeginEvent, exports.addToTileHistory);
Events.on(EventType.BuildRotateEvent, exports.addToTileHistory);
Events.on(EventType.ConfigEvent, exports.addToTileHistory);
Events.on(EventType.PickupEvent, exports.addToTileHistory);
Events.on(EventType.PayloadDropEvent, exports.addToTileHistory);
Events.on(EventType.UnitDestroyEvent, exports.addToTileHistory);
Events.on(EventType.BlockDestroyEvent, exports.addToTileHistory);
Events.on(EventType.UnitControlEvent, exports.addToTileHistory);
Events.on(EventType.GameOverEvent, function () {
    writeToCurrentRunFile();
    exports.tileHistory.clear();
});
