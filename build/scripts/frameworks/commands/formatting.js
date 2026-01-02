"use strict";
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
exports.f_server = exports.f_client = exports.processedFFunctions = exports.fFunctions = exports.outputFormatter_client = exports.outputFormatter_server = void 0;
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var players_1 = require("/players");
var ranks_1 = require("/ranks");
exports.outputFormatter_server = (0, funcs_1.tagProcessorPartial)(function (chunk) {
    if (chunk instanceof players_1.FishPlayer) {
        return "&c(".concat((0, funcs_1.escapeStringColorsServer)(chunk.cleanedName), ")&fr");
    }
    else if (chunk instanceof ranks_1.Rank) {
        return "&p".concat(chunk.name, "&fr");
    }
    else if (chunk instanceof ranks_1.RoleFlag) {
        return "&p".concat(chunk.name, "&fr");
    }
    else if (chunk instanceof Error) {
        return "&r".concat((0, funcs_1.escapeStringColorsServer)(chunk.toString()), "&fr");
    }
    else if (chunk instanceof Player) {
        var player = chunk; //not sure why this is necessary, typescript randomly converts any to unknown
        return "&cPlayer#".concat(player.id, " (").concat((0, funcs_1.escapeStringColorsServer)(Strings.stripColors(player.name)), ")&fr");
    }
    else if (typeof chunk == "string") {
        if (globals_1.uuidPattern.test(chunk)) {
            return "&b".concat(chunk, "&fr");
        }
        else if (globals_1.ipPattern.test(chunk)) {
            return "&b".concat(chunk, "&fr");
        }
        else {
            return "".concat(chunk);
        }
    }
    else if (typeof chunk == "boolean") {
        return "&b".concat(chunk.toString(), "&fr");
    }
    else if (typeof chunk == "number") {
        return "&b".concat(chunk.toString(), "&fr");
    }
    else if (chunk instanceof Administration.PlayerInfo) {
        return "&c".concat((0, funcs_1.escapeStringColorsServer)(chunk.plainLastName()), "&fr");
    }
    else if (chunk instanceof UnitType) {
        return "&c".concat(chunk.localizedName, "&fr");
    }
    else if (chunk instanceof Block) {
        return "&c".concat(chunk.localizedName, "&fr");
    }
    else if (chunk instanceof Team) {
        return "&c".concat(chunk.name, "&fr");
    }
    else if (chunk instanceof Item) {
        return "&c".concat(chunk.name, "&fr");
    }
    else {
        chunk;
        Log.err("Invalid format object!");
        Log.info(chunk);
        return chunk; //let it get stringified by the JS engine
    }
});
exports.outputFormatter_client = (0, funcs_1.tagProcessorPartial)(function (chunk, i, data, stringChunks) {
    var _a, _b;
    var reset = (_b = data !== null && data !== void 0 ? data : (_a = stringChunks[0].match(/^\[.+?\]/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "";
    if (chunk instanceof players_1.FishPlayer) {
        return "[cyan](".concat(chunk.name, "[cyan])") + reset;
    }
    else if (chunk instanceof ranks_1.Rank) {
        return "".concat(chunk.color).concat(chunk.name, "[]") + reset;
    }
    else if (chunk instanceof ranks_1.RoleFlag) {
        return "".concat(chunk.color).concat(chunk.name, "[]") + reset;
    }
    else if (chunk instanceof Error) {
        return "[red]".concat(chunk.toString()) + reset;
    }
    else if (chunk instanceof Player) {
        var fishP = players_1.FishPlayer.get(chunk);
        return "[cyan](".concat(fishP.name, "[cyan])") + reset;
    }
    else if (typeof chunk == "string") {
        if (globals_1.uuidPattern.test(chunk)) {
            return "[blue]".concat(chunk, "[]");
        }
        else if (globals_1.ipPattern.test(chunk)) {
            return "[blue]".concat(chunk, "[]");
        }
        else {
            //TODO reset color?
            return chunk;
        }
    }
    else if (typeof chunk == "boolean") {
        return "[blue]".concat(chunk.toString(), "[]");
    }
    else if (typeof chunk == "number") {
        return "[blue]".concat(chunk.toString(), "[]");
    }
    else if (chunk instanceof Administration.PlayerInfo) {
        return chunk.lastName + reset;
    }
    else if (chunk instanceof UnitType) {
        return "[cyan]".concat(chunk.localizedName, "[]");
    }
    else if (chunk instanceof Block) {
        return "[cyan]".concat(chunk.localizedName, "[]");
    }
    else if (chunk instanceof Team) {
        return "[white]".concat(chunk.coloredName(), "[][]");
    }
    else if (chunk instanceof Item) {
        return "[cyan]".concat(chunk.name, "[]");
    }
    else {
        chunk;
        Log.err("Invalid format object!");
        Log.info(chunk);
        return chunk; //allow it to get stringified by the engine
    }
});
exports.fFunctions = {
    boolGood: function (value) {
        return [
            value ? "[green]true[]" : "[red]false[]",
            value ? "&lgtrue&fr" : "&lrfalse&fr",
        ];
    },
    boolBad: function (value) {
        return [
            value ? "[red]true[]" : "[green]false[]",
            value ? "&lrtrue&fr" : "&lgfalse&fr",
        ];
    },
    percent: function (value, decimals) {
        if (decimals === void 0) { decimals = 0; }
        if (isNaN(value) || !isFinite(value))
            return ["[gray]N/A[]", "N/A"];
        var percent = (value * 100).toFixed(decimals) + "%";
        return ["".concat(percent), "".concat(percent)];
    },
    number: function (value, decimals) {
        if (decimals === void 0) { decimals = null; }
        if (isNaN(value) || !isFinite(value))
            return ["[gray]N/A[]", "N/A"];
        if (decimals !== null)
            return [value.toFixed(decimals), value.toFixed(decimals)];
        return [value.toString(), value.toString()];
    }
};
exports.processedFFunctions = [0, 1].map(function (i) {
    return Object.fromEntries(Object.entries(exports.fFunctions).map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return [k,
            function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return v.apply(exports.processedFFunctions[i], args)[i];
            }
        ];
    }));
});
exports.f_client = Object.assign(exports.outputFormatter_client, exports.processedFFunctions[0]);
exports.f_server = Object.assign(exports.outputFormatter_server, exports.processedFFunctions[1]);
