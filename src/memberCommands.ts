/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains member commands, which are fun cosmetics for donators.
*/

import { Perm, command, commandList, fail } from "/commands";
import { FishPlayer } from "/players";


export const commands = commandList({
	pet: command({
		args: ["name:string?"],
		description: 'Spawns a cool pet with a displayed name that follows you around.',
		perm: Perm.member,
		data: {} as Partial<Record<string, Unit>>,
		handler({args, sender, data, outputSuccess}){
			if(!args.name){
				const pet = data[sender.uuid];
				if(pet){
					pet.kill();
					delete data[sender.uuid];
					outputSuccess("Your pet has been removed.");
					return;
				}
			}
			if(sender.muted || !args.name) args.name = `${sender.name}[white]'s pet`;
			if(args.name.length > 500) fail(`Name cannot be more than 500 characters.`);
			if(Strings.stripColors(args.name).length > 70) fail(`Name cannot be more than 70 characters, not including color tags.`);
			data[sender.uuid]?.kill();
			const unit = sender.unit() ?? fail(`You do not have a unit for the pet to follow.`);
			const pet = UnitTypes.merui.spawn(sender.team(), unit.x, unit.y);
			pet.apply(StatusEffects.disarmed, Number.MAX_SAFE_INTEGER);
			data[sender.uuid] = pet;

			Call.infoPopup('[#7FD7FD7f]\uE81B', 5, Align.topRight, 180, 0, 0, 10);
			outputSuccess(`Spawned a pet.`);

			const petName = args.name;
			const vec = new Vec2(0, 0);
			(function controlUnit(){
				try {
					const unit = sender.unit();
					const currentPet = data[sender.uuid];
					if(pet != currentPet) return;
					if(currentPet.dead){
						delete data[sender.uuid];
						return;
					}
					if(!sender.connected()){
						currentPet?.kill();
						return;
					}
					if(unit && currentPet){
						const distX = unit.x - currentPet.x;
						const distY = unit.y - currentPet.y;
						vec.set(distX, distY);
						if(vec.len() > 50){
							currentPet.approach(vec);
						}
						if(vec.len() > 20*8){
							currentPet.apply(StatusEffects.fast, 60);
						}
						Call.label(petName, 0.07, currentPet.x, currentPet.y + 5);
						//Pets share the sender's trail
						if(sender.trail){
							Call.effect(Fx[sender.trail.type], currentPet.x, currentPet.y, 0, sender.trail.color);
						}
					}
					return Timer.schedule(controlUnit, 0.05);
				} catch(err){
					Log.err(err);
				}
			})();
		}
	}),

	highlight: {
		args: ['color:string?'],
		description: 'Makes your chat text colored by default.',
		perm: Perm.member,
		handler({args, sender, outputFail, outputSuccess}){
			if(args.color == null || args.color.length == 0){
				if(sender.highlight != null){
					sender.highlight = null;
					outputSuccess("Cleared your highlight.");
				} else {
					outputFail("No highlight to clear.");
				}
			} else if(Strings.stripColors(args.color) == ""){
				sender.highlight = args.color;
				outputSuccess(`Set highlight to ${args.color.replace("[","").replace("]","")}.`);
			} else if(Strings.stripColors(`[${args.color}]`) == ""){
				sender.highlight = `[${args.color}]`;
				outputSuccess(`Set highlight to ${args.color}.`);
			} else {
				outputFail(`[yellow]"${args.color}[yellow]" was not a valid color!`);
			}
		}
	},

	rainbow: {
		args: ["speed:number?"],
		description: 'Make your name change colors.',
		perm: Perm.member,
		handler({args, sender, outputSuccess}){
			const colors = ['[red]', '[orange]', '[yellow]', '[acid]', '[blue]', '[purple]'];
			function rainbowLoop(index:number, fishP:FishPlayer){
				Timer.schedule(() => {
					if(!(fishP.rainbow && fishP.player && fishP.connected())) return;
					fishP.player.name = colors[index % colors.length] + Strings.stripColors(fishP.player.name);
					rainbowLoop(index + 1, fishP);
				}, args.speed! / 5);
			}

			if(!args.speed){
				sender.rainbow = null;
				sender.updateName();
				outputSuccess("Turned off rainbow.");
			} else {
				if(args.speed > 10 || args.speed <= 0 || !Number.isInteger(args.speed)){
					fail('Speed must be an integer between 0 and 10.');
				}
	
				sender.rainbow ??= { speed: args.speed };
				rainbowLoop(0, sender);
				outputSuccess(`Activated rainbow name mode with speed ${args.speed}`);
			}

		}
	}
});