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
var preferredMaxPacketSize = 1452; //bytes. It's fine if it goes over this, the packet will just be fragmented
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
    return deserializeData(historyData).map(function (h) { return (__assign(__assign({}, h), { type: (h.type >= unitTypeOffset ? Vars.content.unit(h.type - unitTypeOffset) : Vars.content.block(h.type)).localizedName, info: globals_1.uuidPattern.test(h.uuid) ? Vars.netServer.admins.getInfoOptional(h.uuid) : null })); });
}
function deserializeData(historyData) {
    return funcs_1.StringIO.read(historyData, function (str) { return str.readArray(function (d) { return ({
        action: d.readEnumString(tilelogActions),
        uuid: d.readString(3),
        time: d.readNumber(16),
        type: d.readNumber(4),
        rotation: d.readNumber(1),
        isRootTile: d.readBool(),
        rotationDirection: d.readBool(),
    }); }, 1); });
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
function writeHistory(tilelogEntries) {
    var bits = new Bits(Vars.world.tiles.size());
    var fooTileLogData = [];
    var mainDataStream = new ByteArrayOutputStream(50000); //start at 50kb
    var mainWriter = new Writes(new DataOutputStream(mainDataStream));
    var tileDataStream = new ByteArrayOutputStream(); //leave it as the default
    var tileWriter = new Writes(new DataOutputStream(tileDataStream));
    var tilesInPacket = 0;
    mainWriter.b(0); //add one byte for the tile count
    tilelogEntries.forEach(function (_a) {
        var key = _a.key, value = _a.value;
        bits.set(key);
        var entries = deserializeData(value);
        tileWriter.b(entries.length);
        for (var i = 0; i < Math.min(entries.length, 256); i++) {
            writeEntry(entries[i], tileWriter);
        }
        tilesInPacket++;
        var tileData = tileDataStream.toByteArray(); //unnecessary copy, unavoidable
        tileDataStream.reset();
        if (mainDataStream.size() + tileDataStream.size() > preferredMaxPacketSize || tilesInPacket == 0xFF) {
            var bytes_1 = mainDataStream.toByteArray();
            bytes_1[0] = tilesInPacket > 127 ? tilesInPacket - 256 : tilesInPacket;
            fooTileLogData.push(bytes_1);
            mainDataStream.reset();
            mainWriter.b(0);
        }
        mainWriter.b(tileData);
    });
    var longs = Reflect.get(bits, "bits");
    var bytes = ByteBuffer.allocate(longs.length * 8);
    bytes.asLongBuffer().put(longs);
    var fooTileLogs = bytes.array();
    return { fooTileLogs: fooTileLogs, fooTileLogData: fooTileLogData };
}
function sendHistory(_a) {
    var packet, i, fooTileLogData_1, fooTileLogData_1_1, data, e_1_1;
    var e_1, _b;
    var fooTileLogs = _a.fooTileLogs, fooTileLogData = _a.fooTileLogData;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                packet = new ClientBinaryPacketReliableCallPacket();
                packet.type = "fooTileLogs";
                i = 0;
                _c.label = 1;
            case 1:
                if (!(i < fooTileLogs.length)) return [3 /*break*/, 4];
                packet.contents = Packages.java.util.Arrays.copyOfRange(fooTileLogs, i, Math.min(i + preferredMaxPacketSize, fooTileLogs.length));
                return [4 /*yield*/, packet];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                i += preferredMaxPacketSize;
                return [3 /*break*/, 1];
            case 4:
                packet.type = "fooTileLog";
                _c.label = 5;
            case 5:
                _c.trys.push([5, 10, 11, 12]);
                fooTileLogData_1 = __values(fooTileLogData), fooTileLogData_1_1 = fooTileLogData_1.next();
                _c.label = 6;
            case 6:
                if (!!fooTileLogData_1_1.done) return [3 /*break*/, 9];
                data = fooTileLogData_1_1.value;
                packet.contents = data;
                return [4 /*yield*/, packet];
            case 7:
                _c.sent();
                _c.label = 8;
            case 8:
                fooTileLogData_1_1 = fooTileLogData_1.next();
                return [3 /*break*/, 6];
            case 9: return [3 /*break*/, 12];
            case 10:
                e_1_1 = _c.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 12];
            case 11:
                try {
                    if (fooTileLogData_1_1 && !fooTileLogData_1_1.done && (_b = fooTileLogData_1.return)) _b.call(fooTileLogData_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 12: return [2 /*return*/];
        }
    });
}
function sendPacketGenerator(con, reliable, delay, generator) {
    if (!con.hasDisconnected) {
        for (var i = 0; i < 5; i++) {
            var _a = generator.next(), done = _a.done, value = _a.value;
            if (done)
                return;
            else
                con.send(value, reliable);
        }
        Timer.schedule(function () { return sendPacketGenerator(con, reliable, delay, generator); }, delay);
    }
}
Vars.netServer.addPacketHandler("fooTileLogs", function (player, version) {
    if (version != "2")
        player.sendMessage("Unsupported tilelog version: expected 2, got ".concat(version));
    var fishP = players_1.FishPlayer.get(player);
    var requestCooldown = fishP.ranksAtLeast("trusted") ? funcs_1.Duration.seconds(15) : funcs_1.Duration.minutes(2);
    if (Date.now() - fishP.lastRequestedData < requestCooldown) {
        fishP.lastRequestedData = Date.now();
        sendPacketGenerator(player.con, true, 10, sendHistory(writeHistory(exports.tileHistory)));
    }
});
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
