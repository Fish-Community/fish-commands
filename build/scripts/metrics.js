"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the player count tracking.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
var Metrics = /** @class */ (function () {
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
        Time.mark();
        var playerCount = Groups.player.size();
        this.currentWeek()[this.readingNumber()] =
            Math.max(playerCount, this.currentWeek()[this.readingNumber()]);
        Log.debug("metrics update @", Time.elapsed());
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
    var _a;
    _a = Metrics;
    /** 4 May 2025 */
    Metrics.startDate = new Date(2025, 4, 4).getTime();
    Metrics.millisPerWeek = 604800000;
    Metrics.millisBetweenReadings = 240000;
    Metrics.noData = -1;
    /**
     * Weeks are numbered starting at the week of 4 May 2025.
     * A value is taken every 4 minutes, for a total of 15 readings per hour.
    */
    // @serialize("player-count-data", () => ["version", 0,
    // 	["array", "u16", ["array", 2520, ["number", "i8"]]]
    // ], undefined, weeks => {
    // 	for(let i = 0; i <= Metrics.weekNumber(); i ++){
    // 		weeks[i] ??= Metrics.newWeek();
    // 	}
    // 	return weeks;
    // })
    Metrics.weeks = Array(_a.weekNumber() + 1).fill(0).map(function () { return _a.newWeek(); });
    (function () {
        Timer.schedule(function () { return _a.update(); }, 15, 60);
    })();
    return Metrics;
}());
exports.Metrics = Metrics;
