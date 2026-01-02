"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Perm = void 0;
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the Perm class.
*/
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var ranks_1 = require("/ranks");
/** Represents a permission that is required to do something. */
var Perm = /** @class */ (function () {
    function Perm(name, check, color, unauthorizedMessage) {
        if (color === void 0) { color = ""; }
        if (unauthorizedMessage === void 0) { unauthorizedMessage = "You do not have the required permission (".concat(name, ") to execute this command"); }
        this.name = name;
        this.color = color;
        this.unauthorizedMessage = unauthorizedMessage;
        if (typeof check == "string") {
            if (ranks_1.Rank.getByName(check) == null)
                (0, funcs_1.crash)("Invalid perm ".concat(name, ": invalid rank name ").concat(check));
            this.check = function (fishP) { return fishP.ranksAtLeast(check); };
        }
        else {
            this.check = check;
        }
        Perm.perms[name] = this;
    }
    /** Creates a new Perm with overrides for specified gamemodes. */
    Perm.prototype.exceptModes = function (modes, unauthorizedMessage) {
        var _this = this;
        if (unauthorizedMessage === void 0) { unauthorizedMessage = this.unauthorizedMessage; }
        return new Perm(this.name, function (fishP) {
            var _a;
            var effectivePerm = (_a = modes[config_1.Gamemode.name()]) !== null && _a !== void 0 ? _a : _this;
            return effectivePerm.check(fishP);
        }, this.color, unauthorizedMessage);
    };
    Perm.fromRank = function (rank) {
        return new Perm(rank.name, function (fishP) { return fishP.ranksAtLeast(rank); }, rank.color);
    };
    Perm.getByName = function (name) {
        var _a;
        return (_a = Perm.perms[name]) !== null && _a !== void 0 ? _a : (0, funcs_1.crash)("Invalid requiredPerm");
    };
    Perm.perms = {};
    Perm.none = new Perm("none", function (fishP) { return true; }, "[sky]");
    Perm.trusted = Perm.fromRank(ranks_1.Rank.trusted);
    Perm.mod = Perm.fromRank(ranks_1.Rank.mod);
    Perm.admin = Perm.fromRank(ranks_1.Rank.admin);
    Perm.member = new Perm("member", function (fishP) { return fishP.hasFlag("member"); }, "[pink]", "You must have a ".concat(config_1.FColor.member(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Fish Membership"], ["Fish Membership"]))), " to use this command. Get a Fish Membership at[sky] ").concat(config_1.text.membershipURL, " []"));
    Perm.chat = new Perm("chat", function (fishP) { return (!fishP.muted && !fishP.autoflagged) || fishP.ranksAtLeast("mod"); });
    Perm.bypassChatFilter = new Perm("bypassChatFilter", "admin");
    Perm.seeMutedMessages = new Perm("seeMutedMessages", function (fishP) { return fishP.muted || fishP.autoflagged || fishP.ranksAtLeast("mod"); });
    Perm.play = new Perm("play", function (fishP) { return !fishP.stelled() || fishP.ranksAtLeast("mod"); });
    Perm.seeErrorMessages = new Perm("seeErrorMessages", "admin");
    Perm.viewUUIDs = new Perm("viewUUIDs", "admin");
    Perm.blockTrolling = new Perm("blockTrolling", function (fishP) { return fishP.rank === ranks_1.Rank.pi; });
    Perm.visualEffects = new Perm("visualEffects", function (fishP) { return (!fishP.stelled() || fishP.ranksAtLeast("mod")) && !fishP.hasFlag("no_effects"); });
    Perm.bulkVisualEffects = new Perm("bulkVisualEffects", function (fishP) { return ((fishP.hasFlag("developer") || fishP.hasFlag("illusionist") || fishP.hasFlag("member")) && !fishP.stelled())
        || fishP.ranksAtLeast("mod"); });
    Perm.bypassVoteFreeze = new Perm("bypassVoteFreeze", "trusted");
    Perm.bypassVotekick = new Perm("bypassVotekick", "mod");
    Perm.warn = new Perm("warn", "mod");
    Perm.vanish = new Perm("vanish", "mod");
    Perm.changeTeam = new Perm("changeTeam", "admin").exceptModes({
        sandbox: Perm.trusted,
        attack: Perm.admin,
        hexed: Perm.mod,
        pvp: Perm.trusted,
        minigame: Perm.trusted,
        testsrv: Perm.trusted,
    });
    /** Whether players should be allowed to change the team of a unit or building. If not, they will be kicked out of their current unit or building before switching teams. */
    Perm.changeTeamExternal = new Perm("changeTeamExternal", "admin").exceptModes({
        sandbox: Perm.trusted,
    });
    Perm.usidCheck = new Perm("usidCheck", "trusted");
    Perm.runJS = new Perm("runJS", "manager");
    Perm.bypassNameCheck = new Perm("bypassNameCheck", "fish");
    Perm.hardcore = new Perm("hardcore", "trusted");
    Perm.massKill = new Perm("massKill", "admin").exceptModes({
        sandbox: Perm.mod,
    });
    Perm.voteOtherTeams = new Perm("voteOtherTeams", "trusted");
    Perm.immediatelyVotekickNewPlayers = new Perm("immediatelyVotekickNewPlayers", "trusted");
    return Perm;
}());
exports.Perm = Perm;
var templateObject_1;
