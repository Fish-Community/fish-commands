"use strict";
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
exports.command = command;
var perm_1 = require("/frameworks/commands/perm");
var requirements_1 = require("/frameworks/commands/requirements");
function command(name, perm, callback) {
    var builder = {
        "~name": name,
        "~perm": perm,
        description: function (desc) {
            this["~description"] = desc;
            return this;
        },
        target: function () {
            var targets = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                targets[_i] = arguments[_i];
            }
            var _this = this;
            _this["~targets"] = targets;
            return _this;
        },
        misc: function (_a) {
            var customUnauthorizedMessage = _a.customUnauthorizedMessage, hidden = _a.hidden;
            this["~customUnauthorizedMessage"] = customUnauthorizedMessage;
            this["~isHidden"] = hidden;
            return this;
        },
        data: function (data) {
            var _this = this;
            _this["~data"] = data;
            return _this;
        },
        init: function (func) {
            this["~init"] = func;
            return this;
        },
        args: function (args) {
            if (args === void 0) { args = {}; }
            this["~args"] = new Map(Object.entries(args).map(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return [k,
                    typeof v == "string" ? {
                        name: k, type: v.endsWith("?") ? v.slice(0, -1) : v, isOptional: v.endsWith("?")
                    } : __assign({ name: k }, v)
                ];
            }));
            return this;
        },
        requirements: function () {
            var requirements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                requirements[_i] = arguments[_i];
            }
            this["~requirements"] = requirements;
            return this;
        },
        tapped: function (handler) {
            this["~tapped"] = handler;
            return this;
        },
        handler: function (handler) {
            this["~handler"] = handler;
            return this;
        },
    };
    return builder;
}
command("unpause", perm_1.Perm.trusted)
    .description("Unpauses the game.")
    .data({ unpaused: false })
    .init(function (data) {
    Events.on(EventType.PlayEvent, function () {
        if (data.unpaused) {
            data.unpaused = false;
            Vars.state.rules.pvpAutoPause = true;
        }
    });
})
    .args()
    .requirements(requirements_1.Req.mode("pvp"))
    .handler(function (_a) {
    var data = _a.data, sender = _a.sender, outputSuccess = _a.outputSuccess;
    Vars.state.rules.pvpAutoPause = false;
    data.unpaused = true;
    Core.app.post(function () { return Vars.state.set(GameState.State.playing); });
    outputSuccess("Unpaused.");
});
// command("spectate", Perm.play, cmd => {
// 	/** Mapping between player and original team */
// 	const spectators = new Map<FishPlayer, Team>();
// 	function spectate(target:FishPlayer){
// 		spectators.set(target, target.team());
// 		target.forceRespawn();
// 		target.setTeam(Team.derelict);
// 		target.forceRespawn();
// 	}
// 	function resume(target:FishPlayer){
// 		if(spectators.get(target) == null) return; // this state is possible for a person who left not in spectate
// 		target.setTeam(spectators.get(target)!);
// 		spectators.delete(target);
// 		target.forceRespawn();
// 	}
// 	Events.on(EventType.GameOverEvent, () => spectators.clear());
// 	Events.on(EventType.PlayerLeave, ({player}:{player:mindustryPlayer}) => resume(FishPlayer.get(player)));
// 	cmd
// 		.description("Toggles spectator mode in PVP games.")
// 		.args({ target: Arg.player().optional() })
// 		.requirements(Req.gameRunning)
// 		.handler(({sender, args: {target = sender}, outputSuccess, f}) => {
// 			if(!Gamemode.pvp() && !sender.hasPerm("mod")) fail(`You do not have permission to spectate on a non-pvp server.`);
// 			if(target !== sender && target.hasPerm("blockTrolling")) fail(`Target player is insufficiently trollable.`);
// 			if(target !== sender && !sender.ranksAtLeast("admin")) fail(`You do not have permission to force other players to spectate.`);
// 			if(spectators.has(target)){
// 				resume(target);
// 				outputSuccess(target == sender
// 					? f`Rejoining game as team ${target.team()}.`
// 					: f`Forced ${target} out of spectator mode.`
// 				);
// 			} else {
// 				spectate(target);
// 				outputSuccess(target == sender
// 					? f`Now spectating. Run /spectate again to resume gameplay.`
// 					: f`Forced ${target} into spectator mode.`)
// 				;
// 			}
// 		});
// });
