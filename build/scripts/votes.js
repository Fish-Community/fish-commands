"use strict";
/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains the voting system.
Some contributions: @author Jurorno9
*/
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteManager = void 0;
var players_1 = require("/players");
var funcs_1 = require("/funcs");
var funcs_2 = require("/funcs");
/** Manages a vote. */
var VoteManager = /** @class */ (function (_super) {
    __extends(VoteManager, _super);
    function VoteManager(voteTime, goal, isEligible) {
        if (goal === void 0) { goal = ["fractionOfVoters", 0.50001]; }
        if (isEligible === void 0) { isEligible = function () { return true; }; }
        var _this = _super.call(this) || this;
        _this.voteTime = voteTime;
        _this.goal = goal;
        _this.isEligible = isEligible;
        /** The ongoing voting session, if there is one. */
        _this.session = null;
        if (goal[0] == "fractionOfVoters") {
            if (goal[1] < 0 || goal[1] > 1)
                (0, funcs_1.crash)("Invalid goal: fractionOfVoters must be between 0 and 1 inclusive");
        }
        else if (goal[0] == "absolute") {
            if (goal[1] < 0)
                (0, funcs_1.crash)("Invalid goal: absolute must be greater than 0");
        }
        Events.on(EventType.PlayerLeave, function (_a) {
            var player = _a.player;
            //Run once the player has been removed, but resolve the player first in case the connection gets nulled
            var fishP = players_1.FishPlayer.get(player);
            Core.app.post(function () { return _this.unvote(fishP); });
        });
        Events.on(EventType.GameOverEvent, function () { return _this.resetVote(); });
        return _this;
    }
    VoteManager.prototype.start = function (player, newVote, data) {
        var _this = this;
        if (data === null)
            (0, funcs_1.crash)("Cannot start vote: data not provided");
        this.session = {
            timer: Timer.schedule(function () { return _this._checkVote(false); }, this.voteTime / 1000),
            votes: new Map(),
            data: data,
        };
        this.vote(player, newVote, data);
    };
    VoteManager.prototype.vote = function (player, newVote, data) {
        if (!this.session)
            return this.start(player, newVote, data);
        var oldVote = this.session.votes.get(player.uuid);
        this.session.votes.set(player.uuid, newVote);
        if (oldVote == null)
            this.fire("player vote", [player, newVote]);
        this.fire("player vote change", [player, oldVote !== null && oldVote !== void 0 ? oldVote : 0, newVote]);
        this._checkVote(false);
    };
    VoteManager.prototype.unvote = function (player) {
        if (!this.session)
            return;
        var fishP = players_1.FishPlayer.resolve(player);
        var vote = this.session.votes.get(fishP.uuid);
        if (vote) {
            this.session.votes.delete(fishP.uuid);
            this.fire("player vote removed", [player, vote]);
            this._checkVote(false);
        }
    };
    /** Does not fire the events used to display messages, please print one before calling this */
    VoteManager.prototype.forceVote = function (outcome) {
        if (outcome) {
            this.fire("success", [true]);
        }
        else {
            this.fire("fail", [true]);
        }
        this.resetVote();
    };
    VoteManager.prototype.resetVote = function () {
        if (this.session == null)
            return;
        this.session.timer.cancel();
        this.session = null;
    };
    VoteManager.prototype.requiredVotes = function () {
        if (this.goal[0] == "absolute")
            return this.goal[1];
        else
            return Math.max(Math.ceil(this.goal[1] * this.getEligibleVoters().length), 1);
    };
    VoteManager.prototype.currentVotes = function () {
        return this.session ? __spreadArray([], __read(this.session.votes), false).reduce(function (acc, _a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            return acc + v;
        }, 0) : 0;
    };
    VoteManager.prototype.getEligibleVoters = function () {
        var _this = this;
        if (!this.session)
            return [];
        return players_1.FishPlayer.getAllOnline().filter(function (p) { return _this.isEligible(p, _this.session.data); });
    };
    VoteManager.prototype.messageEligibleVoters = function (message) {
        this.getEligibleVoters().forEach(function (p) { return p.sendMessage(message); });
    };
    VoteManager.prototype._checkVote = function (end) {
        var votes = this.currentVotes();
        var required = this.requiredVotes();
        if (votes >= required) {
            this.fire("success", [false]);
            this.fire("vote passed", [votes, required]);
            this.resetVote();
        }
        else if (end) {
            this.fire("fail", [false]);
            this.fire("vote failed", [votes, required]);
            this.resetVote();
        }
    };
    return VoteManager;
}(funcs_2.EventEmitter));
exports.VoteManager = VoteManager;
