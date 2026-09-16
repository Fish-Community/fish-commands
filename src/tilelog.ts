/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the tilelog system, which stores information about the history of each tile.
*/

import { Gamemode } from "/config";
import { crash, StringIO } from "/funcs";
import { FishEvents, uuidPattern } from "/globals";
import { PartialMapRun } from "/maps";
import { FishPlayer } from "/players";
import { logErrors } from "/utils";

export type TilelogEntries = IntMap<string>;
export const tileHistory:TilelogEntries = new IntMap<string>();
const unitTypeOffset = 5000;

const tilelogActions = [
	"built", "broke", "configured", "rotated", "dropped", "picked up", "setblocked",
	"destroyed", "killed", "controlled"
] as const;
type TilelogAction = (typeof tilelogActions)[number];

type TilelogEntry = {
	uuid: string;
	action: TilelogAction;
	/**
	 * Block ID or unit ID
	 * Offset by +5000 if it's a unit id
	 */
	type: number;
	time: number;
	rotation: number;
	/** default false */
	rotationDirection: boolean;
	isRootTile: boolean;
};


export const addToTileHistory = logErrors("Error while saving a tilelog entry", (e:any) => {

	// eslint-disable-next-line prefer-const
	let tile:Tile, uuid:string, action:TilelogAction, type:number, time:number = Date.now(), rotation = 0, rotationDirection = false;
	if(e instanceof EventType.BlockBuildBeginEvent){
		tile = e.tile;
		uuid = e.unit?.player?.uuid() ?? e.unit?.type.name ?? "unknown";
		if(e.breaking){
			action = "broke";
			type = (tile.build instanceof ConstructBlock.ConstructBuild) ? (tile.build as any).previous.id : "unknown";
		} else {
			action = "built";
			type = (tile.build instanceof ConstructBlock.ConstructBuild) ? (tile.build as any).current.id : "unknown";
			rotation = tile.build?.rotation ?? 0;
		}
	} else if(e instanceof EventType.ConfigEvent){
		tile = e.tile.tile;
		uuid = e.player?.uuid() ?? "unknown";
		if(uuid != "unknown"){
			const fishP = FishPlayer.getById(uuid);
			if(fishP) fishP.tstats.blockInteractionsThisMap ++;
		}
		action = "configured";
		type = tile.blockID();
		rotation = e.tile.rotation;
	} else if(e instanceof EventType.BuildRotateEvent){
		tile = e.build.tile;
		uuid = e.unit?.player?.uuid() ?? e.unit?.type.name ?? "unknown";
		if(uuid != "unknown"){
			const fishP = FishPlayer.getById(uuid);
			if(fishP) fishP.tstats.blockInteractionsThisMap ++;
		}
		action = "rotated";
		type = tile.blockID();
		rotation = e.previous;
		rotationDirection = getRotationDirection(rotation, e.build.rotation);
	} else if(e instanceof EventType.UnitDestroyEvent){
		tile = e.unit.tileOn();
		if(!tile) return;
		if(!e.unit.type.playerControllable) return;
		uuid = e.unit.isPlayer() ? e.unit.getPlayer().uuid() : e.unit.lastCommanded ?? "unknown";
		action = "killed";
		type = e.unit.type.id + unitTypeOffset;
	} else if(e instanceof EventType.BlockDestroyEvent){
		if(Gamemode.attack() && e.tile.build?.team != Vars.state.rules.defaultTeam) return; //Don't log destruction of enemy blocks
		tile = e.tile;
		uuid = "[[something]";
		action = "killed";
		type = tile.blockID();
	} else if(e instanceof EventType.PayloadDropEvent){
		action = "dropped";
		const controller = e.carrier.controller();
		uuid = e.carrier.player?.uuid() ?? (controller instanceof LogicAI && controller.controller ?
			`${e.carrier.type.name} controlled by ${controller.controller.block.name} at ${controller.controller.tileX()},${controller.controller.tileY()} last accessed by ${e.carrier.getControllerName()}`
		: null) ?? e.carrier.type.name;
		if(e.build){
			tile = e.build.tile;
			rotation = e.build.rotation;
			type = tile.blockID();
		} else if(e.unit){
			tile = e.unit.tileOn();
			if(!tile) return;
			type = e.unit.type.id + unitTypeOffset;
		} else return;
	} else if(e instanceof EventType.PickupEvent){
		action = "picked up";
		if(e.carrier.isPlayer()) return; //This event would have been handled by actionfilter
		const controller = e.carrier.controller();
		if(!(controller instanceof LogicAI && controller.controller != null)) return;
		uuid = `${e.carrier.type.name} controlled by ${controller.controller.block.name} at ${controller.controller.tileX()},${controller.controller.tileY()} last accessed by ${e.carrier.getControllerName()}`;
		if(e.build){
			tile = e.build.tile;
			type = tile.blockID();
		} else if(e.unit){
			tile = e.unit.tileOn();
			if(!tile) return;
			type = e.unit.type.id + unitTypeOffset;
		} else return;
	} else if(e instanceof EventType.UnitControlEvent){
		if(e.unit instanceof Packages.mindustry.gen.BlockUnitUnit){
			action = "controlled";
			tile = e.unit?.tile().tile;
			if(!tile) return;
			type = tile.blockID();
			uuid = (e.player as mindustryPlayer).uuid();
		} else return;
	} else if(e instanceof Object && "pos" in e && "uuid" in e && "action" in e && "type" in e){
		let pos;
		({pos, uuid, action, type, rotation} = e);
		tile = Vars.world.tile(pos.split(",")[0], pos.split(",")[1]) ?? crash(`Cannot log ${action} at ${pos}: Nonexistent tile`);
	} else return;
	if(tile == null) return;
	[tile, uuid, action, type, time, rotation, rotationDirection] satisfies [Tile, string, TilelogAction, number, number, number, boolean];

	tile.getLinkedTiles(t => {
		const pos = t.pos();
		const serializedData = tileHistory.get(pos);
		let existingData = serializedData ? StringIO.read(serializedData, str => str.readArray<TilelogEntry>(d => ({
			action: d.readEnumString(tilelogActions),
			uuid: d.readString(3)!,
			time: d.readNumber(16),
			type: d.readNumber(4),
			rotation: d.readNumber(1),
			isRootTile: d.readBool(),
			rotationDirection: d.readBool(),
		}), 1)) : [];

		existingData.push({
			action, uuid, time, type, rotation, rotationDirection,
			isRootTile: t == tile,
		});
		existingData = existingData.slice(-9);
		//Write
		tileHistory.put(pos, StringIO.write(existingData, (str, data) => str.writeArray(data, el => {
			str.writeEnumString(el.action, tilelogActions);
			str.writeString(el.uuid, 3);
			str.writeNumber(el.time, 16);
			str.writeNumber(el.type, 4);
			str.writeNumber(el.rotation, 1);
			str.writeBool(el.isRootTile);
			str.writeBool(el.rotationDirection);
		}, 1)));
	});

});

export function getTileHistory(x:number, y:number, history = tileHistory){
	const historyData = history.get(Point2.pack(x, y));
	if(!historyData) return null;
	return StringIO.read(historyData, str => str.readArray<TilelogEntry>(d => ({
		action: d.readEnumString(tilelogActions),
		uuid: d.readString(3)!,
		time: d.readNumber(16),
		type: d.readNumber(4),
		rotation: d.readNumber(1),
		isRootTile: d.readBool(),
		rotationDirection: d.readBool(),
	}), 1)).map(h => ({
		...h,
		type: (h.type >= unitTypeOffset ? Vars.content.unit(h.type - unitTypeOffset) : Vars.content.block(h.type)).localizedName,
		info: uuidPattern.test(h.uuid) ? Vars.netServer.admins.getInfoOptional(h.uuid) : null,
	}));
}

/** Writes tileHistory to the specified file. */
function writeToFile(file:Fi){
	const stream = new DataOutputStream(file.write());
	try {
		stream.writeInt(tileHistory.size);
		tileHistory.forEach(({key, value}) => {
			stream.writeInt(key);
			stream.writeUTF(value);
		});
	} finally {
		stream.close();
	}
}
/** Reads tilelog data from the specified file. */
export function readFile(file:Fi):TilelogEntries {
	const stream = new DataInputStream(file.read(1024));
	try {
		const size = stream.readInt();
		const map = new IntMap<string>(size);
		Log.info(`Reading ${size} values`);
		for(let i = 0; i < size; i ++){
			map.put(stream.readInt(), stream.readUTF());
		}
		return map;
	} finally {
		stream.close();
	}
}
function getFile(runID:number):Fi {
	return Vars.dataDirectory.child('tilelog-data').child(`${runID}.bin`);
}
/** Writes tileHistory to the file for the current map run. */
const writeToCurrentRunFile = logErrors("Error writing tilelog entries", () => {
	const currentRun = PartialMapRun.current?.startTime;
	if(currentRun && tileHistory.size > 0){
		Log.info(`Writing to run ${currentRun}`);
		writeToFile(getFile(currentRun));
	}
});

/** Copy pasted from foos */
function getRotationDirection(old: number, n: number){
	return old < n && (old != 0 || n != 3) || old == 3 && n == 0;
}

function writeEntry(entry:TilelogEntry, writes:Writes){
	let wasPlayer = false;
	if(uuidPattern.test(entry.uuid)){
		wasPlayer = true;
		const data = FishPlayer.getById(entry.uuid);
		if(data?.player){
			writes.bool(true);
			writes.str(data.name);
			writes.str(data.cleanedName);
			writes.i(data.player.id);
		} else {
			const info = Vars.netServer.admins.getInfoOptional(entry.uuid);
			if(info){
				writes.bool(true);
				writes.str(info.lastName);
				writes.str(info.plainLastName());
				writes.i(-1);
			} else {
				writes.bool(false);
			}
		}
	} else if(entry.uuid){
		writes.bool(true);
		writes.str(entry.uuid);
		writes.str(entry.uuid); //write it twice
		writes.i(-1);
	} else {
		writes.bool(false);
	}
	const diff = Date.now() - entry.time;
	writes.l(Math.floor(diff / 1000)); //subtracted from current time to make unsynced clocks work
	writes.i(diff % 1000); //we don't care
	writes.b({
		built: 0,
		broke: 1,
		configured: 2,
		rotated: 3,
		destroyed: 4,
		killed: 5,
		"picked up": 7,
		dropped: 8,
		//these two get mapped to the closest thing that foo knows about
		setblocked: 0, //we tell foos that the server (player id 2147483647) placed it
		controlled: 2, //we tell foos that it was configured with null
	}[entry.action]);
	switch(entry.action){
		case "built": case "dropped":
			writes.s(entry.type);
			writes.b(entry.rotation);
			TypeIO.writeObject(writes, null); //TODO: config
			writes.bool(entry.isRootTile);
			break;
		case "broke": case "picked up": case "destroyed":
			writes.s(entry.type);
			break;
		case "configured":
			writes.s(entry.type);
			writes.b(entry.rotation);
			TypeIO.writeObject(writes, null); //TODO: config
			break;
		case "controlled":
			writes.s(entry.type);
			writes.b(entry.rotation);
			TypeIO.writeObject(writes, null);
			break;
		case "rotated":
			writes.s(entry.type);
			writes.b(entry.rotation);
			writes.bool(entry.rotationDirection);
			break;
		case "killed":
			writes.s(entry.type - unitTypeOffset);
			writes.bool(wasPlayer);
			break;
	}
}

FishEvents.on("saveData", writeToCurrentRunFile);
Events.on(EventType.SaveLoadEvent, logErrors("Error loading tilelog entries", () => {
	const currentRun = PartialMapRun.current?.startTime;
	if(currentRun != undefined && tileHistory.size == 0){
		Log.info(`Reading run ${currentRun}`);
		const file = Vars.dataDirectory.child('tilelog-data').child(`${currentRun}.bin`);
		if(file.exists()){
			Log.info("DEBUG: file exists, reading");
			tileHistory.putAll(readFile(file));
		} else Log.info(`DEBUG: b ${currentRun}`);
	} else Log.info(`DEBUG: ${tileHistory.size}`);
}));

Events.on(EventType.BlockBuildBeginEvent, addToTileHistory);
Events.on(EventType.BuildRotateEvent, addToTileHistory);
Events.on(EventType.ConfigEvent, addToTileHistory);
Events.on(EventType.PickupEvent, addToTileHistory);
Events.on(EventType.PayloadDropEvent, addToTileHistory);
Events.on(EventType.UnitDestroyEvent, addToTileHistory);
Events.on(EventType.BlockDestroyEvent, addToTileHistory);
Events.on(EventType.UnitControlEvent, addToTileHistory);
Events.on(EventType.GameOverEvent, () => {
	writeToCurrentRunFile();
	tileHistory.clear();
});

