"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains member commands, which are fun cosmetics for donators.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
var commands_1 = require("/frameworks/commands");
exports.commands = (0, commands_1.commandList)({
    pet: (0, commands_1.command)({
        args: ["name:string?"],
        description: 'Spawns a cool pet with a displayed name that follows you around.',
        perm: commands_1.Perm.member,
        data: {},
        handler: function (_a) {
            var _b, _c;
            var args = _a.args, sender = _a.sender, data = _a.data, outputSuccess = _a.outputSuccess;
            if (!args.name) {
                var pet_1 = data[sender.uuid];
                if (pet_1) {
                    pet_1.kill();
                    delete data[sender.uuid];
                    outputSuccess("Your pet has been removed.");
                    return;
                }
            }
            if (sender.muted || !args.name)
                args.name = "".concat(sender.name, "[white]'s pet");
            if (args.name.length > 500)
                (0, commands_1.fail)("Name cannot be more than 500 characters.");
            if (Strings.stripColors(args.name).length > 70)
                (0, commands_1.fail)("Name cannot be more than 70 characters, not including color tags.");
            (_b = data[sender.uuid]) === null || _b === void 0 ? void 0 : _b.kill();
            var unit = (_c = sender.unit()) !== null && _c !== void 0 ? _c : (0, commands_1.fail)("You do not have a unit for the pet to follow.");
            var pet = UnitTypes.merui.spawn(sender.team(), unit.x, unit.y);
            pet.apply(StatusEffects.disarmed, Number.MAX_SAFE_INTEGER);
            data[sender.uuid] = pet;
            Call.infoPopup('[#7FD7FD7f]\uE81B', 5, Align.topRight, 180, 0, 0, 10);
            outputSuccess("Spawned a pet.");
            var petName = args.name;
            var vec = new Vec2(0, 0);
            (function controlUnit() {
                try {
                    var unit_1 = sender.unit();
                    var currentPet = data[sender.uuid];
                    if (pet != currentPet)
                        return;
                    if (currentPet.dead) {
                        delete data[sender.uuid];
                        return;
                    }
                    if (!sender.connected()) {
                        currentPet === null || currentPet === void 0 ? void 0 : currentPet.kill();
                        return;
                    }
                    if (unit_1 && currentPet) {
                        var distX = unit_1.x - currentPet.x;
                        var distY = unit_1.y - currentPet.y;
                        vec.set(distX, distY);
                        if (vec.len() > 50) {
                            currentPet.approach(vec);
                        }
                        if (vec.len() > 20 * 8) {
                            currentPet.apply(StatusEffects.fast, 60);
                        }
                        Call.label(petName, 0.07, currentPet.x, currentPet.y + 5);
                        //Pets share the sender's trail
                        if (sender.trail) {
                            Call.effect(Fx[sender.trail.type], currentPet.x, currentPet.y, 0, sender.trail.color);
                        }
                    }
                    return Timer.schedule(controlUnit, 0.05);
                }
                catch (err) {
                    Log.err(err);
                }
            })();
        }
    }),
    highlight: {
        args: ['color:string?'],
        description: 'Makes your chat text colored by default.',
        perm: commands_1.Perm.member,
        handler: function (_a) {
            var args = _a.args, sender = _a.sender, outputFail = _a.outputFail, outputSuccess = _a.outputSuccess;
            if (args.color == null || args.color.length == 0) {
                if (sender.highlight != null) {
                    sender.highlight = null;
                    outputSuccess("Cleared your highlight.");
                }
                else {
                    outputFail("No highlight to clear.");
                }
            }
            else if (Strings.stripColors(args.color) == "") {
                sender.highlight = args.color;
                outputSuccess("Set highlight to ".concat(args.color.replace("[", "").replace("]", ""), "."));
            }
            else if (Strings.stripColors("[".concat(args.color, "]")) == "") {
                sender.highlight = "[".concat(args.color, "]");
                outputSuccess("Set highlight to ".concat(args.color, "."));
            }
            else {
                outputFail("[yellow]\"".concat(args.color, "[yellow]\" was not a valid color!"));
            }
        }
    },
    rainbow: {
        args: ["speed:number?"],
        description: 'Make your name change colors.',
        perm: commands_1.Perm.member,
        handler: function (_a) {
            var _b;
            var args = _a.args, sender = _a.sender, outputSuccess = _a.outputSuccess;
            var colors = ['[red]', '[orange]', '[yellow]', '[acid]', '[blue]', '[purple]'];
            function rainbowLoop(index, fishP) {
                Timer.schedule(function () {
                    if (!(fishP.rainbow && fishP.player && fishP.connected()))
                        return;
                    fishP.player.name = colors[index % colors.length] + Strings.stripColors(fishP.player.name);
                    rainbowLoop(index + 1, fishP);
                }, args.speed / 5);
            }
            if (!args.speed) {
                sender.rainbow = null;
                sender.updateName();
                outputSuccess("Turned off rainbow.");
            }
            else {
                if (args.speed > 10 || args.speed <= 0 || !Number.isInteger(args.speed)) {
                    (0, commands_1.fail)('Speed must be an integer between 0 and 10.');
                }
                (_b = sender.rainbow) !== null && _b !== void 0 ? _b : (sender.rainbow = { speed: args.speed });
                rainbowLoop(0, sender);
                outputSuccess("Activated rainbow name mode with speed ".concat(args.speed));
            }
        }
    }
});
