/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains member commands, which are fun cosmetics for donators.
*/

import { Perm, commandList, fail } from "/commands";
import { FishPlayer } from "/players";


export const commands = commandList({
	pet: {
		args: ["name:string?"],
		description: 'Spawns a cool pet with a displayed name that follows you around.',
		perm: Perm.member,
		handler({args, sender, outputSuccess}){
			if(!args.name){
				const pet = Groups.unit.find(u => u.id === sender.pet);
				if(pet) pet.kill();
				sender.pet = null;
				outputSuccess("Your pet has been removed.");
				return;
			}
			if(sender.muted) args.name = `${sender.name}[white]'s pet`;
			if(args.name.length > 500) fail(`Name cannot be more than 500 characters.`);
			if(Strings.stripColors(args.name).length > 70) fail(`Name cannot be more than 70 characters, not including color tags.`);
			if(sender.pet !== null){
				const pet = Groups.unit.find(u => u.id === sender.pet);
				if(pet) pet.kill();
				sender.pet = null;
			}
			const unit = sender.unit() ?? fail(`You do not have a unit for the pet to follow.`);
			const pet = UnitTypes.merui.spawn(sender.team(), unit.x, unit.y);
			pet.apply(StatusEffects.disarmed, Number.MAX_SAFE_INTEGER);
			sender.pet = pet.id;

			Call.infoPopup('[#7FD7FD7f]\uE81B', 5, Align.topRight, 180, 0, 0, 10);
			outputSuccess(`Spawned a pet.`);

			function controlUnit({pet, fishPlayer, petName}:{
				petName: string; pet: Unit; fishPlayer: FishPlayer;
			}){
				return Timer.schedule(() => {
					const unit = fishPlayer.unit();
					if(pet.id !== fishPlayer.pet || !fishPlayer.connected() || !unit){
						pet.kill();
						return;
					}

					const distX = unit.x - pet.x;
					const distY = unit.y - pet.y;
					if(distX >= 50 || distX <= -50 || distY >= 50 || distY <= -50){
						pet.approach(new Vec2(distX, distY));
					}
					Call.label(petName, 0.07, pet.x, pet.y + 5);
					if(fishPlayer.trail){
						Call.effect(Fx[fishPlayer.trail.type], pet.x, pet.y, 0, fishPlayer.trail.color);
					}
					controlUnit({ petName, pet, fishPlayer });
				}, 0.05);
			};
			controlUnit({ petName: args.name, pet, fishPlayer: sender });
		}
	},

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