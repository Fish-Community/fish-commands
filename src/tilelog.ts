/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the tilelog system, which stores information about the history of each tile.
*/

import { Gamemode } from "/config";
import { crash, StringIO } from "/funcs";
import { uuidPattern } from "/globals";
import { FishPlayer } from "/players";
import { logErrors } from "/utils";


export const tileHistory:Record<string, string> = {};


export const addToTileHistory = logErrors("Error while saving a tilelog entry", (e:any) => {

	// eslint-disable-next-line prefer-const
	let tile:Tile, uuid:string, action:string, type:string, time:number = Date.now();
	if(e instanceof EventType.BlockBuildBeginEvent){
		tile = e.tile;
		uuid = e.unit?.player?.uuid() ?? e.unit?.type.name ?? "unknown";
		if(e.breaking){
			action = "broke";
			type = (e.tile.build instanceof ConstructBlock.ConstructBuild) ? e.tile.build.previous.name : "unknown";
			if(e.unit?.player?.uuid() && e.tile.build.prevBuild.firstOpt()?.team != Team.derelict){
				const fishP = FishPlayer.get(e.unit.player);
				//TODO move this code
				fishP.tstats.blocksBroken ++;
				fishP.tstats.blockInteractionsThisMap ++;
				fishP.updateStats(stats => stats.blocksBroken ++);
			}
		} else {
			action = "built";
			type = (e.tile.build instanceof ConstructBlock.ConstructBuild) ? e.tile.build.current.name : "unknown";
			if(e.unit?.player?.uuid()){
				const fishP = FishPlayer.get(e.unit.player);
				//TODO move this code
				fishP.updateStats(stats => stats.blocksPlaced ++);
				fishP.tstats.blockInteractionsThisMap ++;
			}
		}
	} else if(e instanceof EventType.ConfigEvent){
		tile = e.tile.tile;
		uuid = e.player?.uuid() ?? "unknown";
		if(uuid != "unknown"){
			const fishP = FishPlayer.getById(uuid);
			if(fishP) fishP.tstats.blockInteractionsThisMap ++;
		}
		action = "configured";
		type = e.tile.block.name;
	} else if(e instanceof EventType.BuildRotateEvent){
		tile = e.build.tile;
		uuid = e.unit?.player?.uuid() ?? e.unit?.type.name ?? "unknown";
		if(uuid != "unknown"){
			const fishP = FishPlayer.getById(uuid);
			if(fishP) fishP.tstats.blockInteractionsThisMap ++;
		}
		action = "rotated";
		type = e.build.block.name;
	} else if(e instanceof EventType.UnitDestroyEvent){
		tile = e.unit.tileOn();
		if(!tile) return;
		if(!e.unit.type.playerControllable) return;
		uuid = e.unit.isPlayer() ? e.unit.getPlayer().uuid() : e.unit.lastCommanded ?? "unknown";
		action = "killed";
		type = e.unit.type.name;
	} else if(e instanceof EventType.BlockDestroyEvent){
		if(Gamemode.attack() && e.tile.build?.team != Vars.state.rules.defaultTeam) return; //Don't log destruction of enemy blocks
		tile = e.tile;
		uuid = "[[something]";
		action = "killed";
		type = e.tile.block()?.name ?? "air";
	} else if(e instanceof EventType.PayloadDropEvent){
		action = "pay-dropped";
		const controller = e.carrier.controller();
		uuid = e.carrier.player?.uuid() ?? (controller instanceof LogicAI && controller.controller ?
			`${e.carrier.type.name} controlled by ${controller.controller.block.name} at ${controller.controller.tileX()},${controller.controller.tileY()} last accessed by ${e.carrier.getControllerName()}`
		: null) ?? e.carrier.type.name;
		if(e.build){
			tile = e.build.tile;
			type = e.build.block.name;
		} else if(e.unit){
			tile = e.unit.tileOn();
			if(!tile) return;
			type = e.unit.type.name;
		} else return;
	} else if(e instanceof EventType.PickupEvent){
		action = "picked up";
		if(e.carrier.isPlayer()) return; //This event would have been handled by actionfilter
		const controller = e.carrier.controller();
		if(!(controller instanceof LogicAI && controller.controller != null)) return;
		uuid = `${e.carrier.type.name} controlled by ${controller.controller.block.name} at ${controller.controller.tileX()},${controller.controller.tileY()} last accessed by ${e.carrier.getControllerName()}`;
		if(e.build){
			tile = e.build.tile;
			type = e.build.block.name;
		} else if(e.unit){
			tile = e.unit.tileOn();
			if(!tile) return;
			type = e.unit.type.name;
		} else return;
	} else if(e instanceof EventType.UnitControlEvent){
		if(e.unit instanceof Packages.mindustry.gen.BlockUnitUnit){
			action = "controlled";
			tile = e.unit?.tile().tile;
			if(!tile) return;
			type = tile.block()?.name ?? "air";
			uuid = (e.player as mindustryPlayer).uuid();
		} else return;
	} else if(e instanceof Object && "pos" in e && "uuid" in e && "action" in e && "type" in e){
		let pos;
		({pos, uuid, action, type} = e);
		tile = Vars.world.tile(pos.split(",")[0], pos.split(",")[1]) ?? crash(`Cannot log ${action} at ${pos}: Nonexistent tile`);
	} else return;
	if(tile == null) return;
	[tile, uuid, action, type, time] satisfies [Tile, string, string, string, number];

	tile.getLinkedTiles(t => {
		const pos = `${t.x},${t.y}`;
		let existingData = tileHistory[pos] ? StringIO.read(tileHistory[pos], str => str.readArray(d => ({
			action: d.readString(2),
			uuid: d.readString(3),
			time: d.readNumber(16),
			type: d.readString(2),
		}), 1)) : [];

		existingData.push({
			action, uuid, time, type
		});
		existingData = existingData.slice(-9);
		//Write
		tileHistory[t.x + ',' + t.y] = StringIO.write(existingData, (str, data) => str.writeArray(data, el => {
			str.writeString(el.action, 2);
			str.writeString(el.uuid, 3);
			str.writeNumber(el.time, 16);
			str.writeString(el.type, 2);
		}, 1));
	});

});

export function getTileHistory(x:number, y:number, player:(p:PlayerInfo | null) => PlayerInfo | null){
	const historyData = tileHistory[`${x},${y}`];
	if(!historyData) return null;
	return StringIO.read(historyData, str => str.readArray(d => ({
		action: d.readString(2),
		uuid: d.readString(3)!,
		time: d.readNumber(16),
		type: d.readString(2),
	}), 1)).map(h => ({
		...h,
		info: uuidPattern.test(h.uuid) ? player(Vars.netServer.admins.getInfoOptional(h.uuid)) : null,
	}));
}

Events.on(EventType.BlockBuildBeginEvent, addToTileHistory);
Events.on(EventType.BuildRotateEvent, addToTileHistory);
Events.on(EventType.ConfigEvent, addToTileHistory);
Events.on(EventType.PickupEvent, addToTileHistory);
Events.on(EventType.PayloadDropEvent, addToTileHistory);
Events.on(EventType.UnitDestroyEvent, addToTileHistory);
Events.on(EventType.BlockDestroyEvent, addToTileHistory);
Events.on(EventType.UnitControlEvent, addToTileHistory);
Events.on(EventType.GameOverEvent, (e) => {
	for(const key of Object.keys(tileHistory)){
		//clear tilelog
		tileHistory[key] = null!;
		delete tileHistory[key];
	}
});

