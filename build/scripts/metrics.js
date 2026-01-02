"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the player count tracking.
*/
var io_1 = require("/frameworks/io");
var Metrics = function () {
    var _a;
    var _static_weeks_decorators;
    var _static_weeks_initializers = [];
    var _static_weeks_extraInitializers = [];
    return _a = /** @class */ (function () {
            function Metrics() {
            }
            Metrics.weekNumber = function (date) {
                if (date === void 0) { date = Date.now(); }
                return Math.floor((date - this.startDate) / this.millisPerWeek);
            };
            Metrics.readingNumber = function (date) {
                if (date === void 0) { date = Date.now(); }
                return Math.floor(((date - this.startDate) % this.millisPerWeek) / this.millisBetweenReadings);
            };
            Metrics.newWeek = function () {
                return Array(2520).fill(this.noData);
            };
            Metrics.currentWeek = function () {
                var _b;
                var _c, _d;
                return (_b = (_c = this.weeks)[_d = this.weekNumber()]) !== null && _b !== void 0 ? _b : (_c[_d] = this.newWeek());
            };
            Metrics.update = function () {
                var playerCount = Groups.player.size();
                this.currentWeek()[this.readingNumber()] =
                    Math.max(playerCount, this.currentWeek()[this.readingNumber()]);
            };
            Metrics.exportRange = function (startDate, endDate) {
                var _this = this;
                if (startDate === void 0) { startDate = this.startDate; }
                if (endDate === void 0) { endDate = Date.now(); }
                if (typeof startDate !== "number")
                    throw new Error('startDate should be a number');
                var startWeek = this.weekNumber(startDate);
                var endWeek = this.weekNumber(endDate);
                return this.weeks.slice(startWeek, endWeek + 1).map(function (week, weekNumber) {
                    return week.filter(function (v) { return v >= 0; }).map(function (v, i) { return [
                        v,
                        _this.startDate +
                            weekNumber * _this.millisPerWeek +
                            i * _this.millisBetweenReadings
                    ]; });
                }).flat();
            };
            return Metrics;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _static_weeks_decorators = [(0, io_1.serialize)("player-count-data", function () { return ["version", 0,
                    ["array", "u16", ["array", 2520, ["number", "i8"]]]
                ]; }, undefined, function (weeks) {
                    var _b;
                    for (var i = 0; i <= Metrics.weekNumber(); i++) {
                        (_b = weeks[i]) !== null && _b !== void 0 ? _b : (weeks[i] = Metrics.newWeek());
                    }
                    return weeks;
                })];
            __esDecorate(null, null, _static_weeks_decorators, { kind: "field", name: "weeks", static: true, private: false, access: { has: function (obj) { return "weeks" in obj; }, get: function (obj) { return obj.weeks; }, set: function (obj, value) { obj.weeks = value; } }, metadata: _metadata }, _static_weeks_initializers, _static_weeks_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        /** 4 May 2025 */
        _a.startDate = new Date(2025, 4, 4).getTime(),
        _a.millisPerWeek = 604800000,
        _a.millisBetweenReadings = 240000,
        _a.noData = -1,
        /**
         * Weeks are numbered starting at the week of 4 May 2025.
         * A value is taken every 4 minutes, for a total of 15 readings per hour.
        */
        _a.weeks = __runInitializers(_a, _static_weeks_initializers, Array(_a.weekNumber() + 1).fill(0).map(function () { return _a.newWeek(); })),
        (function () {
            __runInitializers(_a, _static_weeks_extraInitializers);
        })(),
        (function () {
            Timer.schedule(function () { return _a.update(); }, 15, 60);
        })(),
        _a;
}();
exports.Metrics = Metrics;
