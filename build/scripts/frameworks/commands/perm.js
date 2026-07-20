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
var utils_1 = require("/utils");
/** Represents a permission that is required to do something. */
var Perm = /** @class */ (function () {
    function Perm(name, check, category_, color, unauthorizedMessage, modes) {
        if (category_ === void 0) { category_ = typeof check == "string" ? rankToCategory(check) : (0, funcs_1.crash)("category is required"); }
        if (color === void 0) { color = ""; }
        if (unauthorizedMessage === void 0) { unauthorizedMessage = "You do not have the required permission (".concat(name, ") to execute this command"); }
        if (modes === void 0) { modes = null; }
        this.name = name;
        this.category_ = category_;
        this.color = color;
        this.unauthorizedMessage = unauthorizedMessage;
        this.modes = modes;
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
        }, this.category_, this.color, unauthorizedMessage, modes);
    };
    Perm.prototype.category = function () {
        var _a, _b;
        var effectivePerm = (_b = (_a = this.modes) === null || _a === void 0 ? void 0 : _a[config_1.Gamemode.name()]) !== null && _b !== void 0 ? _b : this;
        return effectivePerm.category_;
    };
    Perm.fromRank = function (rank) {
        return new Perm(rank.name, function (fishP) { return fishP.ranksAtLeast(rank); }, rankToCategory(rank.name), rank.color);
    };
    Perm.getByName = function (name) {
        var _a;
        return (_a = Perm.perms[name]) !== null && _a !== void 0 ? _a : (0, funcs_1.crash)("Invalid requiredPerm");
    };
    Perm.perms = {};
    Perm.none = new Perm("none", function (fishP) { return true; }, "player", "[sky]");
    Perm.trusted = Perm.fromRank(ranks_1.Rank.trusted);
    Perm.mod = Perm.fromRank(ranks_1.Rank.mod);
    Perm.admin = Perm.fromRank(ranks_1.Rank.admin);
    Perm.manager = Perm.fromRank(ranks_1.Rank.manager);
    Perm.member = new Perm("member", function (fishP) { return fishP.hasFlag("member"); }, "member", "[pink]", "You must have a ".concat(config_1.FColor.member(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Fish Membership"], ["Fish Membership"]))), " to use this command. Get a Fish Membership at[sky] ").concat(config_1.text.membershipURL, " []"));
    Perm.chat = new Perm("chat", function (fishP) { return (!fishP.muted() && !fishP.autoflagged) || fishP.ranksAtLeast("mod"); }, "player");
    Perm.bypassChatFilter = new Perm("bypassChatFilter", "admin");
    Perm.seeMutedMessages = new Perm("seeMutedMessages", function (fishP) { return fishP.muted() || fishP.autoflagged || fishP.ranksAtLeast("mod"); }, "mod");
    Perm.play = new Perm("play", function (fishP) { return !fishP.stelled() || fishP.ranksAtLeast("mod"); }, "player");
    Perm.seeErrorMessages = new Perm("seeErrorMessages", "mod");
    Perm.viewUUIDs = new Perm("viewUUIDs", "mod");
    Perm.viewIPs = new Perm("viewIPs", "admin");
    Perm.blockTrolling = new Perm("blockTrolling", function (fishP) { return fishP.rank === ranks_1.Rank.pi; }, "player");
    Perm.visualEffects = new Perm("visualEffects", function (fishP) { return (!fishP.stelled() || fishP.ranksAtLeast("mod")) && !fishP.hasFlag("no_effects"); }, "player");
    Perm.bulkVisualEffects = new Perm("bulkVisualEffects", function (fishP) { return ((fishP.hasFlag("developer") || fishP.hasFlag("illusionist") || fishP.hasFlag("member")) && !fishP.stelled())
        || fishP.ranksAtLeast("mod"); }, "trusted");
    Perm.bypassVoteFreeze = new Perm("bypassVoteFreeze", "trusted");
    Perm.bypassVotekick = new Perm("bypassVotekick", "mod");
    Perm.warn = new Perm("warn", "mod");
    Perm.vanish = new Perm("vanish", "trusted");
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
    Perm.massUnblacklist = new Perm("massUnblacklist", "manager");
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
function rankToCategory(check) {
    return (0, utils_1.match)(check, {
        active: "player",
        admin: "admin",
        fish: "manager",
        manager: "manager",
        mod: "mod",
        pi: "manager",
        player: "player",
        trusted: "trusted"
    });
}
var templateObject_1;
