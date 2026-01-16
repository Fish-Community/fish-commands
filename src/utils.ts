/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains many utility functions that need access to any values from other files.
For functions that don't need values from other files, see funcs.ts.
*/

import * as api from "/api";
import { adminNames, bannedWords, Gamemode, GamemodeName, multiCharSubstitutions, substitutions, text } from "/config";
import { fail, PartialFormatString } from "/frameworks/commands";
import { crash, escapeStringColorsServer, escapeTextDiscord, parseError, random, StringIO } from "/funcs";
import { fishState, ipPattern, ipPortPattern, ipRangeCIDRPattern, ipRangeWildcardPattern, maxTime, tileHistory, uuidPattern } from "/globals";
import { FishPlayer } from "/players";
import { Boolf, SelectEnumClassKeys } from "/types";


export function memoizeChatFilter(impl:(arg:string) => string){
	let lastCleanedInput:string | null = null;
	let lastOutput:string | null = null;
	return function memoized(input:string):string {
		const cleanedInput = removeFoosChars(input);
		if(cleanedInput === lastCleanedInput) return lastOutput!;
		lastCleanedInput = cleanedInput;
		return lastOutput = impl(input);
	};
}

export function formatTime(time:number){

	if(maxTime - (time + Date.now()) < 20_000) return "forever";
	if(isNaN(time)) return "N/A";

	const months = Math.floor(time / (30 * 24 * 60 * 60 * 1000));
	const days = Math.floor((time % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
	const hours = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
	const seconds = Math.floor((time % (60 * 1000)) / (1000));

	return [
		months && `${months} month${months != 1 ? "s" : ""}`,
		days && `${days} day${days != 1 ? "s" : ""}`,
		hours && `${hours} hour${hours != 1 ? "s" : ""}`,
		minutes && `${minutes} minute${minutes != 1 ? "s" : ""}`,
		(seconds || time < 1000) && `${seconds} second${seconds != 1 ? "s" : ""}`,
	].filter(Boolean).join(", ");
}

export function formatTimeShort(time:number){

	if(maxTime - (time + Date.now()) < 20000) return "forever";
	if(isNaN(time)) return "N/A";

	const months = Math.floor(time / (30 * 24 * 60 * 60 * 1000));
	const days = Math.floor((time % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
	const hours = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const minutes = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
	const seconds = Math.floor((time % (60 * 1000)) / (1000));

	return [
		months && `${months}mo`,
		days && `${days}d`,
		hours && `${hours}h`,
		minutes && `${minutes}m`,
		(seconds || time < 1000) && `${seconds}s`,
	].filter(Boolean).join(" ");
}

//TODO move this data to be right next to Mode
export function formatModeName(name:GamemodeName){
	return {
		"attack": "Attack",
		"survival": "Survival",
		"hexed": "Hexed",
		"pvp": "PVP",
		"sandbox": "Sandbox",
		"hardcore": "Hardcore",
		"testsrv": "Testing Server",
		"minigame": "Minigames",
	}[name];
}

export function formatTimestamp(time:number){
	const date = new Date(time);
	return `${date.toDateString()}, ${date.toTimeString()}`;
}

export function formatTimeRelative(time:number, raw?:boolean){
	const difference = Math.abs(time - Date.now());

	if(difference < 1000)
		return "just now";
	else if(time > Date.now())
		return (raw ? "" : "in ") + formatTime(difference);
	else
		return formatTime(difference) + (raw ? "" : " ago");
}

/** Attempts to parse a Color from the input. */
export function getColor(input:string):Color | null {
	try {
		if(input.includes(',')){
			const formattedColor = input.split(',');
			const col = {
				r: Number(formattedColor[0]),
				g: Number(formattedColor[1]),
				b: Number(formattedColor[2]),
				a: 255,
			};
			return new Color(col.r, col.g, col.b, col.a);
		} else if(input.includes('#')){
			return Color.valueOf(input);
		} else if(((input):input is SelectEnumClassKeys<typeof Color> => input in Color)(input)){
			return Color[input];
		} else {
			return null;
		}
	} catch(e){
		return null;
	}
}

/** Searches for an enemy tile near a unit. */
export function nearbyEnemyTile(unit:Unit, dist:number):Building | null {
	//because the indexer is buggy
	if(dist > 10) crash(`nearbyEnemyTile(): dist (${dist}) is too high!`);

	const x = Math.floor(unit.x / Vars.tilesize);
	const y = Math.floor(unit.y / Vars.tilesize);
	for(let i = -dist; i <= dist; i ++){
		for(let j = -dist; j <= dist; j ++){
			const build = Vars.world.build(x + i, y + j);
			if(build && build.team != unit.team && build.team != Team.derelict) return build;
		}
	}
	return null;
}

/** Attempts to parse a Team from the input. */
export function getTeam(team:string):Team | string {
	if(team in Team && Team[team as keyof typeof Team] instanceof Team) return Team[team as keyof typeof Team] as Team;
	else if(Team.baseTeams.find(t => t.name.includes(team.toLowerCase()))) return Team.baseTeams.find(t => t.name.includes(team.toLowerCase()))!;
	else if(!isNaN(Number(team))) return `"${team}" is not a valid team string. Did you mean "#${team}"?`;
	else if(!isNaN(Number(team.slice(1)))){
		const num = Number(team.slice(1));
		if(num <= 255 && num >= 0 && Number.isInteger(num))
			return Team.all[Number(team.slice(1))];
		else
			return `Team ${team} is outside the valid range (integers 0-255).`;
	}
	return `"${team}" is not a valid team string.`;
}

/** Attempts to parse an Item from the input. */
export function getItem(item:string):Item | string {
	let temp: Item | null;
	if(item in Items && (temp = Items[item]) instanceof Item) return temp;
	else if((temp = Vars.content.items().find(t => t.name.includes(item.toLowerCase())))) return temp;
	return `"${item}" is not a valid item.`;
}


/**
 * @param wordList "chat" is least strict, followed by "strict", and "name" is most strict.
 * @returns a
 */
export function matchFilter(input:string, wordList = "chat" as "chat" | "strict" | "name", aggressive = false):false | string {
	const currentBannedWords = [
		wordList == "name" ? bannedWords.normal.filter(w => w[0] !== "uwu") : bannedWords.normal,
		(wordList == "strict" || wordList == "name") && bannedWords.strict,
		wordList == "name" && bannedWords.names,
	].filter(Boolean).flat();
	if(aggressive) currentBannedWords.push(["hitler", []]);
	//Replace substitutions
	const variations = [input, cleanText(input, false)];
	if(aggressive) variations.push(cleanText(input, true));
	for(const [banned, whitelist] of currentBannedWords){
		for(const text of variations){
			if(banned instanceof RegExp ? banned.test(text) : text.includes(banned)){
				let modifiedText = text;
				whitelist.forEach(w => modifiedText = modifiedText.replace(new RegExp(w, "g"), "")); //Replace whitelisted words with nothing
				if(banned instanceof RegExp ? banned.test(modifiedText) : modifiedText.includes(banned)) //If the text still matches, fail
					return (
						banned === uuidPattern ? `a Mindustry UUID` :
						banned === ipPattern || banned === ipPortPattern ? `an IP address` :
						//parsing regex with regex, massive hack
						banned instanceof RegExp ? banned.source.replace(/\\b|\(\?<!.+?\)|\(\?!.+?\)/g, "") :
						banned
					);
			}
		}
	}
	return false;
}

const foosPattern = Pattern.compile(/[\u0F80-\u107F]{2}$/.source);
export function removeFoosChars(text:string):string {
	return foosPattern.matcher(text).replaceAll("");
}

export function cleanText(text:string, applyAntiEvasion = false){
	//Replace substitutions
	let replacedText =
		multiCharSubstitutions.reduce((acc, [from, to]) => acc.replace(from, to),
			Strings.stripColors(removeFoosChars(text))
				.split("").map(c => substitutions[c] ?? c).join("")
		).toLowerCase().trim();
	if(applyAntiEvasion){
		replacedText = replacedText.replace(new RegExp(`[^a-zA-Z0-9]`, "gi"), "");
	}
	return replacedText;
}

export function isImpersonator(name:string, isAdmin:boolean):false | string {
	const replacedText = cleanText(name);
	const antiEvasionText = cleanText(name, true);
	//very clean code i know
	const filters:Array<[check:Boolf<string>, message:string]> = (
		(input: Array<string | [string | RegExp | Boolf<string>, string]>) =>
			input.map(i =>
				Array.isArray(i) ? [
					typeof i[0] == "string" ? replacedText => replacedText.includes((i[0] as string)) :
					i[0] instanceof RegExp ? replacedText => (i[0] as RegExp).test(replacedText) :
					i[0],
					i[1]
				] : [
					replacedText => replacedText.includes(i),
					`Name contains disallowed ${i.length == 1 ? "icon" : "word"} '${i}'`
				]
			)
	)([
		[/\bserver\b/, "Name contains disallowed word 'server'"],
		"admin", "moderator", "staff", "owner",
		[">|||>", "Name contains >|||> which is reserved for the server owner"],
		"\uE817", "\uE82C", "\uE88E", "\uE813",
		[/^[<\uE825].{1,3}[>\uE83A]/, "Name contains a prefix such as <a> which is used for role prefixes"],
		[(replacedText) => !isAdmin && adminNames.includes(replacedText.replace(/ /g, "")), "One of our admins uses this name"]
	]);
	for(const [check, message] of filters){
		if(check(replacedText)) return message;
		if(check(antiEvasionText)) return message;
	}
	return false;
}

export function logAction(action:string):void;
export function logAction(action:string, by:FishPlayer):void;
export function logAction(action:string, by:FishPlayer | string, to:FishPlayer | PlayerInfo | string, reason?:string, duration?:number):void;
export function logAction(action:string, by?:FishPlayer | string, to?:FishPlayer | PlayerInfo | string, reason?:string, duration?:number) {
	if(by === undefined){ //overload 1
		api.sendModerationMessage(
`${action}
**Server:** ${Gamemode.name()}`
		);
		return;
	}
	if(to === undefined){ //overload 2
		api.sendModerationMessage(
`${escapeTextDiscord(Strings.stripColors((by as FishPlayer).name))} ${action}
**Server:** ${Gamemode.name()}`
		);
		return;
	}
	if(to){ //overload 3
		let name:string, uuid:string, ip:string;
		const actor:string = typeof by === "string" ? by : escapeTextDiscord(Strings.stripColors(by.name));
		if(to instanceof FishPlayer){
			name = escapeTextDiscord(to.name);
			uuid = to.uuid;
			ip = to.ip();
		} else if(typeof to == "string"){
			if(uuidPattern.test(to)){
				name = `[${to}]`;
				uuid = to;
				ip = "[unknown]";
			} else {
				name = to;
				uuid = "[unknown]";
				ip = "[unknown]";
			}
		} else {
			name = escapeTextDiscord(to.lastName);
			uuid = to.id;
			ip = to.lastIP;
		}
		api.sendModerationMessage(
`${actor} ${action} ${name} ${duration ? `for ${formatTime(duration)} ` : ""}${reason ? `with reason ${escapeTextDiscord(reason)}` : ""}
**Server:** ${Gamemode.name()}
**uuid:** \`${uuid}\`
**ip**: \`${ip}\``
		);
		return;
	}
}

/** @returns the number of milliseconds. */
export function parseTimeString(str:string):number | null {
	const formats = ([
		[/(\d+)s/, 1],
		[/(\d+)m/, 60],
		[/(\d+)h/, 3600],
		[/(\d+)d/, 86400],
		[/(\d+)w/, 604800]
	] as Array<[RegExp, number]>).map(([regex, mult]) => [Pattern.compile(regex.source), mult] as const);
	if(str == "forever") return (maxTime - Date.now() - 10000);
	for(const [pattern, mult] of formats){
		//rhino regex doesn't work
		const matcher = pattern.matcher(str);
		if(matcher.matches()){
			const num = Number(matcher.group(1));
			if(!isNaN(num)) return (num * mult) * 1000;
		}
	}
	return null;
}

/** Triggers the restart countdown. Execution always returns from this function. */
export function serverRestartLoop(sec:number):void {
	if(sec > 0){
		if(sec < 15 || sec % 5 == 0) Call.sendMessage(`[scarlet]Server restarting in: ${sec}`);
		fishState.restartLoopTask = Timer.schedule(() => serverRestartLoop(sec - 1), 1);
	} else {
		Log.info(`Restarting...`);
		const file = Vars.saveDirectory.child('1' + '.' + Vars.saveExtension);
		Vars.netServer.kickAll(Packets.KickReason.serverRestarting);
		Vars.net.closeServer();
		Vars.state.set(GameState.State.menu);
		Core.app.post(() => {
			SaveIO.save(file);
			Core.app.exit();
		});
	}
}

export function isBuildable(block:Block){
	return block == Blocks.powerVoid || (block.buildType != Blocks.air.buildType && !(block instanceof ConstructBlock));
}

export function getUnitType(type:string):UnitType | string {
	validUnits ??= Vars.content.units().select((u:UnitType) => !(u instanceof MissileUnitType || u.internal));
	let temp;
	if((temp = validUnits.find(u => u.name == type))) return temp;
	else if((temp = validUnits.find((t:UnitType) => t.name.includes(type.toLowerCase())))) return temp;
	return `"${type}" is not a valid unit type.`;
}

/** The vanilla validation code doesn't work on servers */
export function isMapValidForGamemode(map:MMap):boolean {
	if(map.custom) return true; //we assume that all custom maps are appropriate for the selected gamemode
	const pvpMaps = ["Veins", "Glacier", "Passage"]; //Maps.pvpMaps
	switch(Vars.state.rules.mode().name()){
		case "sandbox": case "editor": return true; //sandbox can be played on any map
		case "attack": case "pvp": return pvpMaps.includes(map.name()); //technically the pvp maps are valid attack maps, since they have an (undefended) enemy core
		case "survival": return !pvpMaps.includes(map.name());
		default: return false; //unreachable
	}
}

//TODO refactor this, lots of duped code across multiple select functions
export function getMap(name:string):MMap | "none" | "multiple" {
	if(name == "") return "none";
	const maps = Vars.maps.all().select(isMapValidForGamemode); //this doesn't work...

	const filters:Array<(m:MMap) => boolean> = [
		//m => m.name() === name, //exact match
		m => m.name().replace(/ /g, "_") === name, //exact match with spaces replaced
		m => m.name().replace(/ /g, "_").toLowerCase() === name.toLowerCase(), //exact match with spaces replaced ignoring case
		m => m.plainName().replace(/ /g, "_").toLowerCase() === name.toLowerCase(), //exact match with spaces replaced ignoring case and colors
		m => m.plainName().toLowerCase().includes(name.toLowerCase()), //partial match ignoring case and colors
		m => m.plainName().replace(/ /g, "_").toLowerCase().includes(name.toLowerCase()), //partial match with spaces replaced ignoring case and colors
		m => m.plainName().replace(/ /g, "").toLowerCase().includes(name.toLowerCase()), //partial match with spaces removed ignoring case and colors
		m => m.plainName().replace(/[^a-zA-Z]/gi, "").toLowerCase().includes(name.toLowerCase()), //partial match with non-alphabetic characters removed ignoring case and colors
	];

	for(const filter of filters){
		const matchingMaps = maps.select(filter);
		if(matchingMaps.size == 1) return matchingMaps.get(0);
		else if(matchingMaps.size > 1) return "multiple";
		//if empty, go to next filter
	}
	//no filters returned a result
	return "none";
}

//static cache
let buildableBlocks:Seq<Block> | null = null;
let validUnits:Seq<UnitType> | null = null;

export function getBlock(block:string, filter:"buildable" | "air" | "all"):Block | string {
	buildableBlocks ??= Vars.content.blocks().select(isBuildable);
	const check = ({
		buildable: b => isBuildable(b),
		air: b => b == Blocks.air || isBuildable(b),
		all: b => true
	} satisfies Record<string, (b:Block) => boolean>)[filter];
	let out:Block | null;
	if(block in Blocks && Blocks[block] instanceof Block && check(Blocks[block])) return Blocks[block];
	else if((out = Vars.content.blocks().find(t => t.name.includes(block.toLowerCase()) && check(t)))) return out;
	else if((out = Vars.content.blocks().find(t => t.name.replace(/-/g, "").includes(block.toLowerCase().replace(/ /g, "")) && check(t)))) return out;
	else if(block.includes("airblast")) return Blocks.blastDrill;
	return `"${block}" is not a valid block.`;
}

export function teleportPlayer(player:mindustryPlayer, to:mindustryPlayer){
	Timer.schedule(() => {
		const p = player.unit();
		const t = to.unit();
		if(p && t){
			p.set(t.x, t.y);
			Call.setPosition(player.con, t.x, t.y);
			Call.setCameraPosition(player.con, t.x, t.y);
		}
	}, 0, 0.016, 10);
}

export function logErrors<T extends (...args:any[]) => unknown>(message:string, func:T):T {
	return function(...args:any[]){
		try {
			return func(...args);
		} catch(err){
			Log.err(message);
			Log.err(parseError(err));
		}
	} as T;
}

export function definitelyRealMemoryCorruption(){
	Log.info(`Triggering a prank: this will cause players to see two error messages claiming to be from a memory corruption, and cause a flickering amount of fissile matter and dormant cysts to be put in the core.`);
	FishPlayer.messageStaff(`[gray]<[cyan]staff[gray]> [white]Activating memory corruption prank! (please don't ruin it by telling players what is happening, pretend you dont know)`);
	api.sendModerationMessage(`Activated memory corruption prank on server ${Vars.state.rules.mode().name()}`);
	let t1f = false;
	let t2f = false;
	fishState.corruption_t1 = Timer.schedule(() => {
		t1f = !t1f;
		Vars.state.rules.defaultTeam.items()?.set(Items.dormantCyst, t1f ? 69 : 420);
	}, 0, 0.4, 600);
	fishState.corruption_t2 = Timer.schedule(() => {
		t2f = !t2f;
		Vars.state.rules.defaultTeam.items()?.set(Items.fissileMatter, t2f ? 999 : 123);
	}, 0, 1.5, 200);
	const hexString = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, "0");
	Call.sendMessage("[scarlet]Error: internal server error.");
	Call.sendMessage(`[scarlet]Error: memory corruption: mindustry.world.modules.ItemModule@${hexString}`);
}

export function getEnemyTeam():Team {
	if(Gamemode.pvp()) return Team.derelict;
	else return Vars.state.rules.waveTeam;
}

export function neutralGameover(){
	FishPlayer.ignoreGameover(() => {
		Events.fire(new EventType.GameOverEvent(getEnemyTeam()));
	});
}

/** Please validate wavesToSkip to ensure it is not huge */
export function skipWaves(wavesToSkip:number, runIntermediateWaves:boolean){
	if(runIntermediateWaves){
		for(let i = 0; i < wavesToSkip; i ++){
			Vars.logic.skipWave();
		}
	} else {
		Vars.state.wave += wavesToSkip - 1;
		Vars.logic.skipWave();
	}
}

export function logHTrip(player:FishPlayer, name:string, message?:string){
	Log.warn(`&yPlayer &b"${player.cleanedName}"&y (&b${player.uuid}&y/&b${player.ip()}&y) tripped &c${name}&y` + (message ? `: ${message}` : ""));
	FishPlayer.messageStaff(`[yellow]Player [blue]"${player.cleanedName}"[] tripped [cyan]${name}[]` + (message ? `: ${message}` : ""));
	api.sendModerationMessage(`Player \`${player.cleanedName}\` (\`${player.uuid}\`/\`${player.ip()}\`) tripped **${name}**${message ? `: ${message}` : ""}\n**Server:** ${Gamemode.name()}`);
}

export function setType<T>(input:unknown):asserts input is T {
	//does not do any checking
}

export function untilForever(){
	return (maxTime - Date.now() - 10000);
}

export function colorNumber(number:number, getColor:(number:number) => string, side:"server" | "client" = "client"):string {
	return getColor(number) + number.toString() + (side == "client" ? "[]" : "&fr");
}

export function getAntiBotInfo(side:"client" | "server"){
	const color = side == "client" ? "[acid]" : "&ly";
	const True = side == "client" ? "[red]true[]" : "&lrtrue";
	const False = side == "client" ? "[green]false[]" : "&gfalse";
	return (
`${color}Flag count(last 1 minute period): ${FishPlayer.flagCount}
${color}Autobanning flagged players: ${FishPlayer.shouldWhackFlaggedPlayers() ? True : False}
${color}Kicking new players: ${FishPlayer.shouldKickNewPlayers() ? True : False}
${color}Recent connect packets(last 1 minute period): ${FishPlayer.playersJoinedRecent}
${color}Override: ${FishPlayer.antiBotModeOverride ? True : False}`
	);
}

const failPrefix = "[scarlet]\u26A0 [yellow]";
const successPrefix = "[#48e076]\uE800 ";

export function outputFail(message:string | PartialFormatString, sender:mindustryPlayer | FishPlayer):void;
export function outputFail(message:string | PartialFormatString, sender:FishPlayer, ratelimit:number):void;
export function outputFail(message:string | PartialFormatString, sender:mindustryPlayer | FishPlayer, ratelimit?:number){
	const msg = failPrefix + (typeof message == "function" && "__partialFormatString" in message ? message("[yellow]") : message);
	if(ratelimit) sender.sendMessage(msg, ratelimit);
	else sender.sendMessage(msg);
}
export function outputSuccess(message:string | PartialFormatString, sender:mindustryPlayer | FishPlayer){
	sender.sendMessage(successPrefix + (typeof message == "function" && "__partialFormatString" in message ? message("[#48e076]") : message));
}
export function outputMessage(message:string | PartialFormatString, sender:mindustryPlayer | FishPlayer){
	sender.sendMessage(((typeof message == "function" && "__partialFormatString" in message ? message(null) : message) + "").replace(/\t/g, " ".repeat(4)));
}
export function outputConsole(message:string | PartialFormatString, channel:(typeof Log)[keyof typeof Log] = Log.info){
	channel(typeof message == "function" && "__partialFormatString" in message ? message("") : message);
}

export function updateBans(message?:(player:mindustryPlayer) => string){
	Groups.player.each(player => {
		if(Vars.netServer.admins.isIDBanned(player.uuid())){
			player.con.kick(Packets.KickReason.banned);
			if(message)
				Call.sendMessage(message(player));
		}
	});
}

export function processChat(player:mindustryPlayer, message:string, effects = false){
	const fishPlayer = FishPlayer.get(player);
	let highlight = fishPlayer.highlight;
	let filterTripText;
	const suspicious = fishPlayer.joinsLessThan(3);
	if(
		(!fishPlayer.hasPerm("bypassChatFilter") || fishPlayer.chatStrictness == "strict")
		&& (filterTripText = matchFilter(message, fishPlayer.chatStrictness, suspicious))
	){
		if(effects){
			if(
				suspicious && removeFoosChars(message).split(" ")
					.map(w => w.replace(/[-_.^*,]/g, ""))
					.some(w => bannedWords.autoWhack.includes(w))
			){
				logHTrip(fishPlayer, "bad words in chat", `message: \`${message}\``);
				fishPlayer.muted = true;
				void fishPlayer.stop("automod", maxTime, `Automatic stop due to suspicious activity`, false);
			}
			Log.info(`Censored message from player ${player.name}: "${escapeStringColorsServer(message)}"; contained "${filterTripText}"`);
			FishPlayer.messageStaff(`[yellow]Censored message from player ${fishPlayer.cleanedName}: "${message}" contained "${filterTripText}"`);
		}
		message = text.chatFilterReplacement.message();
		highlight ??= text.chatFilterReplacement.highlight();
	}

	if(message.startsWith("./")) message = message.replace("./", "/");

	if(!fishPlayer.hasPerm("chat")){
		if(effects){
			FishPlayer.messageMuted(player.name, message);
			Log.info(`<muted>${player.name}: ${message}`);
		}
		return null;
	}

	return (highlight ?? "") + message;
}


const replacements = ([
	//Serpulo units
	["dagger", "mace", "fortress", "scepter", "reign", "nova", "pulsar", "quasar", "vela", "corvus", "crawler", "atrax", "spiroct", "arkyid", "toxopid", "flare", "horizon", "zenith", "antumbra", "eclipse", "mono", "poly", "mega", "quad", "oct", "risso", "minke", "bryde", "sei", "omura", "retusa", "oxynoe", "cyerce", "aegires", "navanax", "fort", "toxo", "flarogus"],
	//Erekir units
	["stell", "locus", "precept", "vanquish", "conquer", "merui", "cleroi", "anthicus", "tecta", "collaris", "elude", "avert", "obviate", "quell", "disrupt", "vanq", "crab", "anthi", "larry", "obvi"],

	//Items, full form
	["copper", "lead", "metaglass", "graphite", "sand", "coal", "titanium", "thorium", "scrap", "silicon", "plastanium", "phase fabric", "surge alloy", "spore pod", "blast compound", "pyratite", "beryllium", "tungsten", "oxide", "carbide"],
	//Items, short form
	["coppa", "meta", "graph", "tita", "titan", "thor", "scrap", "sili", "plast", "phase", "surge", "spore", "blast", "pyra", "beryl", "tung", "oxide", "carb"],

	//Liquids
	["water", "slag", "oil", "cryo", "cryofluid"],

	//Liquids/gases (erekir)
	["hydrogen", "ozone", "nitrogen", "cyanogen", "cyan", "nitro", "hydro", "arky", "arkycite", "neoplasm"],

	//Gamemodes
	["attack", "sandbox", "pvp", "hexed", "survival"],

	//teams
	["crux", "sharded", "malis", "neoplastic"]
] satisfies string[][]).map(set => [set, new RegExp(`\\b(?:${set.join("|")})(e?s?(?:i?gone)?)\\b`, 'g')] as const);

let foolCounter = 0;
export const foolifyChat = memoizeChatFilter(function foolifyChat(message:string){
	const cleanedMessage = removeFoosChars(message);
	setShuffle: {
		if(foolCounter < 5){
			//Skip the next 5 messages no matter what
			foolCounter ++;
			break setShuffle;
		}
		let replacedMessage = cleanedMessage;
		for(const [set, regex] of replacements){
			replacedMessage = replacedMessage.replace(regex, (_, plural) => random(set) + plural);
			//This code has a "feature":
			//if it replaces a long item name to "blast compound",
			//it will then replace "blast" to something else on the next pass
			//this was unintended but it's funny so I'm keeping it
		}
		if(replacedMessage !== cleanedMessage){
			if(foolCounter < 7){
				//Skip the next 2 messages that would get altered
				foolCounter ++;
				break setShuffle;
			}
			foolCounter = 0;
			return replacedMessage;
		} else {
			break setShuffle;
		}
	}
	if(Math.random() < 0.02){
		return cleanedMessage.split("").reverse().join("");
	// eslint-disable-next-line no-dupe-else-if
	} else if(Math.random() < 0.02){
		return "[scarlet]I really hope everyone is having a fun time :} <3";
	} else if(Math.random() < 0.005){
		return "[cyan]AMOGUS";
	} else {
		return message;
	}
});

export const addToTileHistory = logErrors("Error while saving a tilelog entry", (e:any) => {

	// eslint-disable-next-line prefer-const
	let tile:Tile, uuid:string, action:string, type:string, time:number = Date.now();
	if(e instanceof EventType.BlockBuildBeginEvent){
		tile = e.tile;
		uuid = e.unit?.player?.uuid() ?? e.unit?.type.name ?? "unknown";
		if(e.breaking){
			action = "broke";
			type = (e.tile.build instanceof ConstructBlock.ConstructBuild) ? e.tile.build.previous.name : "unknown";
			if(e.unit?.player?.uuid() && e.tile.build?.team != Team.derelict){
				const fishP = FishPlayer.get(e.unit.player);
				//TODO move this code
				fishP.tstats.blocksBroken ++;
				fishP.stats.blocksBroken ++;
			}
		} else {
			action = "built";
			type = (e.tile.build instanceof ConstructBlock.ConstructBuild) ? e.tile.build.current.name : "unknown";
			if(e.unit?.player?.uuid()){
				const fishP = FishPlayer.get(e.unit.player);
				//TODO move this code
				fishP.stats.blocksPlaced ++;
			}
		}
	} else if(e instanceof EventType.ConfigEvent){
		tile = e.tile.tile;
		uuid = e.player?.uuid() ?? "unknown";
		action = "configured";
		type = e.tile.block.name;
	} else if(e instanceof EventType.BuildRotateEvent){
		tile = e.build.tile;
		uuid = e.unit?.player?.uuid() ?? e.unit?.type.name ?? "unknown";
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

export function getIPRange(input:string, error?:(message:string) => never):string | null {
	if(ipRangeCIDRPattern.test(input)){
		const [ip, maskLength] = input.split("/");
		switch(maskLength){
			case "24":
				return ip.split(".").slice(0, 3).join(".") + ".";
			case "16":
				return ip.split(".").slice(0, 2).join(".") + ".";
			default:
				error?.(`Mindustry does not currently support netmasks other than /16 and /24`);
				return null;
		}
	} else if(ipRangeWildcardPattern.test(input)){
		//1.2.3.*
		//1.2.*
		const [a, b, c, d] = input.split(".");
		if(c !== "*") return `${a}.${b}.${c}.`;
		return `${a}.${b}.`;
	} else return null;
}

//this brings me physical pain
export function getHash(file: Fi, algorithm: string = "SHA-1"): string | undefined {
	try {
		const header = `blob ${file.length()}\0`;
		const fileSHAHeader = Packages.java.nio.charset.StandardCharsets.UTF_8.encode(header);
		const contents = file.readBytes();
		const buffer = Packages.java.nio.ByteBuffer.allocate(fileSHAHeader.remaining() + contents.length) as ByteBuffer;
		buffer.put(fileSHAHeader);
		buffer.put(contents);
		buffer.flip();
		const digest = Packages.java.security.MessageDigest.getInstance(algorithm) as MessageDigest;
		digest.update(buffer);
		return digest.digest().map(byte =>
			(byte & 0xFF).toString(16).padStart(2, "0")
		).join("");
	} catch (e) {
		Log.err(`Cannot generate ${algorithm}, ${String(e)}`);
		return undefined;
	}
}

export function match<K extends PropertyKey, O extends Record<K, unknown>>(value:K, clauses:O):K extends keyof O ? O[K] : (O[K & keyof O] | undefined);
export function match<K extends PropertyKey, const O extends Partial<Record<K, unknown>>, D>(value:K, clauses:O, defaultValue:D):O[K & keyof O] | D;
export function match(value:PropertyKey, clauses:Record<PropertyKey, unknown>, defaultValue?:unknown):unknown {
	return Object.prototype.hasOwnProperty.call(clauses, value) ? clauses[value] : defaultValue;
}

/** @throws CommandError */
export function fishCommandsRootDirPath():Path {
	const commandsDir = Vars.modDirectory.child("fish-commands");
	if(!commandsDir.exists())
		fail(`Fish commands directory at path ${commandsDir.absolutePath()} does not exist!`);
	let fishCommandsRootDirPath = Paths.get(commandsDir.file().path);
	if(Packages.java.nio.file.Files.isSymbolicLink(fishCommandsRootDirPath)){
		//fish-commands is linked to the build directory of somewhere else
		//resolve and get the parent directory of the build directory
		fishCommandsRootDirPath = fishCommandsRootDirPath.toRealPath().getParent();
	}
	return fishCommandsRootDirPath;
}

/** Fails if "mode" is invalid. */
export function applyEffectMode(mode:string, unit:Unit, ticks:number){
	const modes = {
		fast: [StatusEffects.fast],
		fast2: [StatusEffects.fast, StatusEffects.overdrive, StatusEffects.overclock],
		boss: [StatusEffects.boss],
		health: [StatusEffects.boss, StatusEffects.shielded],
		slow: [StatusEffects.slow],
		slow2: [
			StatusEffects.slow,
			StatusEffects.freezing,
			StatusEffects.wet,
			StatusEffects.muddy,
			StatusEffects.sapped,
			StatusEffects.sporeSlowed,
			StatusEffects.electrified,
			StatusEffects.tarred,
		],
		freeze: [StatusEffects.unmoving],
		disarm: [StatusEffects.disarmed],
		invincible: [StatusEffects.invincible],
		boost: [
			StatusEffects.fast,
			StatusEffects.overdrive,
			StatusEffects.overclock,
			StatusEffects.boss,
			StatusEffects.shielded,
		],
		damage: [
			StatusEffects.burning,
			StatusEffects.freezing,
			StatusEffects.wet,
			StatusEffects.muddy,
			StatusEffects.melting,
			StatusEffects.sapped,
			StatusEffects.tarred,
			StatusEffects.shocked,
			StatusEffects.blasted,
			StatusEffects.corroded,
			StatusEffects.sporeSlowed,
			StatusEffects.electrified,
			StatusEffects.fast,
		],
		clear(unit){
			unit.clearStatuses();
			unit.maxHealth = unit.type.health;
		},
		paper(unit){
			unit.health = 1;
			unit.maxHealth = 1;
			unit.apply(StatusEffects.disarmed, Number.MAX_VALUE / 2);
		},
		heal(unit){
			unit.health = unit.maxHealth;
		},
		overheal(unit){
			unit.maxHealth = unit.health = 1e15;
		},
		shield(unit){
			unit.shield = 1e15;
		}
	} satisfies Record<string, StatusEffect[] | ((u:Unit) => void)>;
	const effects = match(mode, modes, null) ?? fail(`Invalid mode. Supported modes: ${Object.keys(modes).join(", ")}`);
	if(typeof effects === "function"){
		effects(unit);
	} else {
		for(const effect of effects){
			unit.apply(effect, ticks);
		}
	}
}

