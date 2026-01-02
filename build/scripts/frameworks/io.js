"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SettingsSerializer = exports.Serializer = exports.DataClass = void 0;
exports.dataClass = dataClass;
exports.serialize = serialize;
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the serialization framework.
For usage information, see docs/framework-usage-guide.md
For maintenance information, see docs/frameworks.md
*/
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var DataClass = /** @class */ (function () {
    function DataClass(data) {
        Object.assign(this, data);
    }
    return DataClass;
}());
exports.DataClass = DataClass;
function dataClass() {
    return DataClass;
}
function checkBounds(type, value, min, max) {
    if (value < min) {
        Log.warn("Integer underflow when serializing ".concat(type, ": value ").concat(value, " was less than ").concat(min));
        return min;
    }
    if (value >= max) {
        Log.warn("Integer overflow when serializing ".concat(type, ": value ").concat(value, " was greater than ").concat(max));
        return max;
    }
    return value;
}
var Serializer = /** @class */ (function () {
    function Serializer(schema, oldSchema) {
        this.schema = schema;
        this.oldSchema = oldSchema;
    }
    Serializer.prototype.write = function (object, output) {
        Serializer.writeNode(this.schema, object, output);
    };
    Serializer.prototype.read = function (input) {
        input.mark(0xFFFF); //1MB
        try {
            return Serializer.readNode(this.schema, input);
        }
        catch (err) {
            Log.warn("Using fallback schema: this message should go away after a restart");
            input.reset();
            if (this.oldSchema)
                return Serializer.readNode(this.oldSchema, input);
            else
                throw err;
        }
    };
    Serializer.writeNode = function (schema, value, output) {
        var e_1, _a, e_2, _b;
        var checkNumbers = false;
        switch (schema[0]) {
            case 'string':
                output.writeUTF(value);
                break;
            case 'number':
                if (checkNumbers) {
                    switch (schema[1]) {
                        case 'u8':
                            output.writeByte(checkBounds(schema[1], value, 0, Math.pow(2, 8)));
                            break;
                        case 'u16':
                            output.writeShort(checkBounds(schema[1], value, 0, Math.pow(2, 16)));
                            break;
                        case 'u32':
                            output.writeInt(checkBounds(schema[1], value, 0, Math.pow(2, 32)) & 0xFFFFFFFF);
                            break;
                        case 'i8':
                            output.writeByte(checkBounds(schema[1], value, -(Math.pow(2, 7)), (Math.pow(2, 7))));
                            break;
                        case 'i16':
                            output.writeShort(checkBounds(schema[1], value, -(Math.pow(2, 15)), (Math.pow(2, 15))));
                            break;
                        case 'i32':
                            output.writeInt(checkBounds(schema[1], value, -(Math.pow(2, 31)), (Math.pow(2, 31))));
                            break;
                        case 'i64':
                            output.writeLong(checkBounds(schema[1], value, -(Math.pow(2, 63)), (Math.pow(2, 63))));
                            break;
                        case 'f32':
                            output.writeFloat(isNaN(value) || !isFinite(value) ? (Log.warn('Attempted to write a NaN floating-point value, defaulting to 0'), 0) : value);
                            break;
                        case 'f64':
                            output.writeDouble(isNaN(value) || !isFinite(value) ? (Log.warn('Attempted to write a NaN floating-point value, defaulting to 0'), 0) : value);
                            break;
                    }
                }
                else {
                    switch (schema[1]) {
                        case 'u8':
                            output.writeByte(value);
                            break;
                        case 'u16':
                            output.writeShort(value);
                            break;
                        case 'u32':
                            output.writeInt(value & 0xFFFFFFFF);
                            break; //If the value is greater than 0x7FFFFFFF, make it negative so Java writes it correctly
                        case 'i8':
                            output.writeByte(value);
                            break;
                        case 'i16':
                            output.writeShort(value);
                            break;
                        case 'i32':
                            output.writeInt(value);
                            break;
                        case 'i64':
                            output.writeLong(value);
                            break;
                        case 'f32':
                            output.writeFloat(value);
                            break;
                        case 'f64':
                            output.writeDouble(value);
                            break;
                    }
                }
                break;
            case 'boolean':
                output.writeBoolean(value);
                break;
            case 'team':
                if (!value)
                    Log.err("attempting to serialize a Team, but it was null"); //temporary debug message
                output.writeByte(value.id);
                break;
            case 'object':
                try {
                    for (var _c = __values(schema[1]), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), key = _e[0], childSchema = _e[1];
                        //correspondence
                        this.writeNode(childSchema, value[key], output);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                break;
            case 'class':
                try {
                    for (var _f = __values(schema[2]), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var _h = __read(_g.value, 2), key = _h[0], childSchema = _h[1];
                        //correspondence
                        this.writeNode(childSchema, value[key], output);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                break;
            case 'array':
                if (typeof schema[1] == "string") {
                    this.writeNode(["number", schema[1]], value.length, output);
                }
                else {
                    if (schema[1] !== value.length) {
                        Log.err('SERIALIZATION WARNING: received invalid data: array with greater length than specified by schema');
                        value.length = schema[1];
                    }
                }
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (var i = 0; i < value.length; i++) {
                    this.writeNode(schema[2], value[i], output);
                }
                break;
            case 'version':
                output.writeByte(schema[1]);
                this.writeNode(schema[2], value, output);
                break;
        }
    };
    Serializer.readNode = function (schema, input) {
        var e_3, _a, e_4, _b;
        switch (schema[0]) {
            case 'string':
                return input.readUTF();
            case 'number':
                switch (schema[1]) {
                    case 'u8': return input.readUnsignedByte();
                    case 'u16': return input.readUnsignedShort();
                    case 'u32': {
                        var value = input.readInt(); //Java does not support unsigned ints
                        return value < 0 ? value + Math.pow(2, 32) : value;
                    }
                    case 'i8': return input.readByte();
                    case 'i16': return input.readShort();
                    case 'i32': return input.readInt();
                    case 'i64': return input.readLong();
                    case 'f32': return input.readFloat();
                    case 'f64': return input.readDouble();
                }
                schema[1];
                break;
            case 'boolean':
                return input.readBoolean();
            case 'team':
                return Team.all[input.readByte()];
            case 'object': {
                var output = {};
                try {
                    for (var _c = __values(schema[1]), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), key = _e[0], childSchema = _e[1];
                        output[key] = this.readNode(childSchema, input);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return output;
            }
            case 'class': {
                var classData = {};
                try {
                    for (var _f = __values(schema[2]), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var _h = __read(_g.value, 2), key = _h[0], childSchema = _h[1];
                        classData[key] = this.readNode(childSchema, input);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                return new schema[1](classData);
            }
            case 'array': {
                var length = typeof schema[1] === "number" ?
                    schema[1]
                    : this.readNode(["number", schema[1]], input);
                var array = new Array(length);
                for (var i = 0; i < length; i++) {
                    array[i] = this.readNode(schema[2], input);
                }
                return array;
            }
            case 'version': {
                var version = input.readByte();
                if (version !== schema[1])
                    (0, funcs_1.crash)("Expected version ".concat(schema[1], ", but read ").concat(version));
                return this.readNode(schema[2], input);
            }
        }
    };
    return Serializer;
}());
exports.Serializer = Serializer;
var SettingsSerializer = /** @class */ (function (_super) {
    __extends(SettingsSerializer, _super);
    function SettingsSerializer(settingsKey, schema, oldSchema) {
        var _this = _super.call(this, schema, oldSchema) || this;
        _this.settingsKey = settingsKey;
        _this.schema = schema;
        _this.oldSchema = oldSchema;
        return _this;
    }
    SettingsSerializer.prototype.writeSettings = function (object) {
        var output = new ByteArrayOutputStream();
        this.write(object, new DataOutputStream(output));
        Core.settings.put(this.settingsKey, output.toByteArray());
    };
    SettingsSerializer.prototype.readSettings = function () {
        var data = Core.settings.getBytes(this.settingsKey);
        if (data)
            return this.read(new DataInputStream(new ByteArrayInputStream(data)));
        else
            return null;
    };
    return SettingsSerializer;
}(Serializer));
exports.SettingsSerializer = SettingsSerializer;
if (!Symbol.metadata)
    Object.defineProperty(Symbol, "metadata", {
        writable: false,
        enumerable: false,
        configurable: false,
        value: Symbol("Symbol.metadata")
    });
function serialize(settingsKey, schema, oldSchema, fixer) {
    return function decorate(_, _a) {
        var addInitializer = _a.addInitializer, access = _a.access, name = _a.name;
        addInitializer(function () {
            var _this = this;
            var serializer = (0, funcs_1.lazy)(function () {
                return new SettingsSerializer(settingsKey, schema(), oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema());
            });
            globals_1.FishEvents.on("loadData", function () {
                var value = serializer().readSettings();
                if (value) {
                    if (fixer)
                        value = fixer(value);
                    access.set(_this, value);
                }
            });
            globals_1.FishEvents.on("saveData", function () {
                try {
                    serializer().writeSettings(access.get(_this));
                }
                catch (err) {
                    Log.err("Error while saving field ".concat(String(name), " on ").concat(String(_this === null || _this === void 0 ? void 0 : _this.name), " using settings key ").concat(settingsKey));
                    Log.info(JSON.stringify(access.get(_this)));
                    throw err;
                }
            });
        });
    };
}
