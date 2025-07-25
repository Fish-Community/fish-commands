/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains the visual effects system.
Original contributor: @author TheEt1234
Fixes: @author BalaM314
Fixes: @author Dart25
Fixes: @author Jurorno9
*/

import { Perm, commandList } from '/commands';
import { FishPlayer } from '/players';

//some much needed restrictions
/** point in which effects will refuse to render */
const MIN_EFFECT_TPS = 20;
/** maximum duration for user-created labels (seconds) */
const MAX_LABEL_TIME = 20;

//info tracker
let lastLabel = '';
let lastAccessedBulkLabel:FishPlayer | null = null;
let lastAccessedLabel:FishPlayer | null = null;
let lastAccessedBulkLine:FishPlayer | null = null;
let lastAccessedLine:FishPlayer | null = null;

const bulkLimit = 1000;

const noPermissionText = "[red]You don't have permission to use this packet.";
const invalidContentText = '[red]Invalid label content.';
const tooLongText = '[red]Bulk content length exceeded, please use fewer effects.';
const bulkSeparator = '|';
const procError = '[red]An error occured while processing your request.';
const invalidReq = '[red]Invalid request. Please consult the documentation.';
const lowTPSError = '[red]Low server TPS, skipping request.'

const tmpLinePacket = new EffectCallPacket2();
const tmpLabelPacket = new LabelReliableCallPacket();

export function loadPacketHandlers() {
	//initialize line packet
	tmpLinePacket.effect = Fx.pointBeam;
	tmpLinePacket.rotation = 0.0;
	tmpLinePacket.color = Tmp.c1;
	tmpLinePacket.data = Tmp.v1;

	//labels

	//fmt: "content,duration,x,y"
	Vars.netServer.addPacketHandler('label', (player:mindustryPlayer, content:string) => {
		const p = FishPlayer.get(player);
		try {
			if(Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS){
				p.sendMessage(lowTPSError, 1000);
				return;
			}
			if (!p.hasPerm("visualEffects")) {
				p.sendMessage(noPermissionText, 1000);
				return;
			}

			lastAccessedLabel = p;
	
			handleLabel(player, content, true);
		} catch {
			p.sendMessage(procError, 1000);			
		}
	});

	Vars.netServer.addPacketHandler('bulkLabel', (player:mindustryPlayer, content:string) => {
		const p = FishPlayer.get(player);
		try {
			if(Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS){
				p.sendMessage(lowTPSError, 1000);
				return;
			}
			if (!p.hasPerm('bulkVisualEffects')) {
				p.sendMessage(noPermissionText, 1000);
				return;
			}

			lastAccessedBulkLabel = p;

			//get individual labels
			const labels:string[] = [];
			let inQuotes = false;
			let startIdx = 0;

			for (let i = 0; i < content.length; i++) {
				switch (content[i]) {
					case '"':
						if (i > 0 && content[i-1] == '\\') break;
						inQuotes = !inQuotes;
						break;
					//separate
					case bulkSeparator:
						if (inQuotes) break;
						
						labels.push(content.substring(startIdx, i));
						startIdx = i + 1;
						break;
					default:
						break;
				}
			}
			
			//last label
			if (startIdx < content.length) {
				labels.push(content.substring(startIdx, content.length - 1));
			}

			if(labels.length > bulkLimit){
				p.sendMessage(tooLongText, 1000);
				return;
			}

			//display labels
			for (let i = 0; i < labels.length; i++) {
				const label = labels[i];
				if (label.trim().length <= 0) continue;
				if (!handleLabel(player, label, false)) return;
			}
		} catch {
			p.sendMessage(procError, 1000);
		}
	});

	//lines
	Vars.netServer.addPacketHandler('lineEffect', (player:mindustryPlayer, content:string) => {
		const p = FishPlayer.get(player);
		try {
			if(Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS){
				p.sendMessage(lowTPSError, 1000);
				return;
			}
			if (!p.hasPerm("visualEffects")) {
				p.sendMessage(noPermissionText, 1000);
				return;
			}

			if (!handleLine(content, player)) return;
			lastAccessedLine = p;
		} catch {
			p.sendMessage(procError, 1000);
		}
	});

	//this is the silas effect but it's way too real
	Vars.netServer.addPacketHandler('bulkLineEffect', (player:mindustryPlayer, content:string) => {
		const p = FishPlayer.get(player);
		if(Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS){
			p.sendMessage(lowTPSError, 1000);
			return;
		}
		if (!p.hasPerm('bulkVisualEffects')) {
			p.sendMessage(noPermissionText, 1000);
			return;
		}
		try {

			const lines = content.split(bulkSeparator);

			if(lines.length > bulkLimit){
				p.sendMessage(tooLongText, 1000);
				return;
			}

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (line.trim().length <= 0) continue;
				if (!handleLine(line, player)) return;
			}

			lastAccessedBulkLine = p;
		} catch {
			p.sendMessage(procError, 1000);
		}
	});
}

//commands
export const commands = commandList({
	pklast: {
		args: [],
		description: 'Tells you who last accessed the packet handlers.',
		perm: Perm.none,
		handler({output}) {
			const outputLines:string[] = [];

			if (lastAccessedLabel && lastLabel) {
				outputLines.push(`${lastAccessedLabel.name}[white] created label "${lastLabel}".`);
			}
			if (lastAccessedBulkLabel) {
				outputLines.push(`${lastAccessedBulkLabel.name}[white] last used the bulk label effect.`);
			}
			if (lastAccessedLine) {
				outputLines.push(`${lastAccessedLine.name}[white] last used the line effect.`);
			}
			if (lastAccessedBulkLine) {
				outputLines.push(`${lastAccessedBulkLine.name}[white] last used the bulk line effect.`);
			}

			output(outputLines.length > 0 ? outputLines.join('\n') : 'No packet handlers have been accessed yet.');
		}
	},
	pkdocs: {
		description: 'Packet handler documentation.',
		args: [],
		perm: Perm.none,
		handler({sender, output}){
				output(
`				[blue]FISH[white] Packet Handler Docs
[white]Usage:[accent]
	- Run the javascript function "Call.serverPacketReliable()" to send these. (!js in foos)
	- You need to multiply world coordinates by Vars.tilesize (8) for things to work properly. This is a relic from the v3 days where every tile was 8 pixels.

[white]Packet types[accent]:
	- Line effect: "lineEffect", "x0,y0,x1,y1,hexColor" (for example "20.7,19.3,50.4,28.9,#FF0000")
	- Bulk line effect: "bulkLineEffect", equivalent to multiple lineEffect packets, with every line separated by a \'|\' symbol.
	- Label effect: "label", "content,duration,x,y" (for example ""Hi!",10,20,28")
	- Bulk label effect: "bulkLabel", equivalent to multiple label packets, with every label separated by a \'|\' symbol.

[white]Limitations[accent]:
	- You ${(sender.hasPerm('bulkVisualEffects')?(`[green]have been granted[accent]`):(`[red]do not have[accent]`))} access to bulk effects.
	- Effects will no longer be drawn at ${MIN_EFFECT_TPS} for server preformance.
	- Labels cannot last longer than ${MAX_LABEL_TIME} seconds.
	- There is a set ratelimit for sending packets, be careful ...

[white]Starter Example[accent]:

	To place a label saying "hello" at (0,0);
	Foos users: [lightgray]!js Call.serverPacketReliable("label", ["\\"hello\\"", 10, 0, 0].join(","))[accent]
	newConsole users: [lightgrey]Call.serverPacketReliable("label", ["hello", 10, 0, 10].join(","))[accent]

[white]Comments and Credits[accent]:
	- 'These packet handlers and everything related to them were made by [green]frog[accent].
	- 'The code style when submitted was beyond drunk... but it worked... barely' -BalaM314
	- "worst error handling i have ever seen, why kick the player???" -ASimpleBeginner'
	- Most of the code was rewritten in 2024 by [#6e00fb]D[#9e15de]a[#cd29c2]r[#fd3ea5]t[accent].'
	- Small tweaks by [#00cf]s[#00bf]w[#009f]a[#007f]m[#005f]p[accent]`)
		}
	}
});

//#region utils

function findEndQuote(content:string, startPos:number) {
	if (content[startPos] != '"') {
		//not a start quote??
		return -1;
	}

	for (let i = startPos + 1; i < content.length; i++) {
		if (content[i] == '"' && (i < 1 || content[i-1] != '\\')) {
			return i;
		}
	}

	return -1;
}

function handleLabel(player:mindustryPlayer, content:string, isSingle:boolean):boolean {
	const endPos = findEndQuote(content, 0);
	if (endPos == -1) {
		//invalid content
		player.sendMessage(invalidContentText);
		return false;
	}

	//label, clean up \"s
	const message = content.substring(1, endPos).replace('\\"', '"');
	const parts = content.substring(endPos + 2).split(',');

	if (parts.length != 3) { //dur,x,y
		player.sendMessage(invalidReq);
		return false;
	}

	if (isSingle) {
		lastLabel = message;
	}

	let duration = Number(parts[0]);
	const x = Number(parts[1]), y = Number(parts[2]);
	if(Number.isNaN(duration) || duration > MAX_LABEL_TIME || Number.isNaN(x) || Number.isNaN(y)){
		player.sendMessage(invalidReq);
		return false;
	}

	/*Call.labelReliable(
		message, //message
		Number(parts[0]), //duration
		Number(parts[1]), //x
		Number(parts[2]) //y
	);*/
	tmpLabelPacket.message = message;
	tmpLabelPacket.duration = duration;
	tmpLabelPacket.worldx = x;
	tmpLabelPacket.worldy = y;
	Vars.net.send(tmpLabelPacket, false);
	return true;
}

function handleLine(content:string, player:mindustryPlayer):boolean {
	const parts = content.split(',');

	if (parts.length != 5) { //x0,y0,x1,y1,color
		player.sendMessage(invalidReq);
		return false;
	}

	Tmp.v1.set(Number(parts[2]), Number(parts[3])); //x1,y1
	Color.valueOf(Tmp.c1, parts[4]); //color

	/*Call.effect(
		Fx.pointBeam,
		Number(parts[0]), Number(parts[1]), //x,y
		0, Tmp.c1, //color
		Tmp.v1 //x1,y1
	);*/
	tmpLinePacket.x = Number(parts[0]);
	tmpLinePacket.y = Number(parts[1]);
	Vars.net.send(tmpLinePacket, false);

	return true;
}

export function bulkInfoMsg(messages:string[], conn:NetConnection) {
	for (let i = messages.length - 1; i >= 0; i--) {
		Call.infoMessage(conn, messages[i]);
	}
}


//#endregion