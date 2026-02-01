import { FColor, Gamemode, GamemodeName, GamemodeNames } from "/config";
import { Duration } from "/funcs";
import { FishEvents, unitsT5 } from "/globals";
import { FishPlayer } from "/players";
import { Rank } from "/ranks";
import { getStatuses } from "/utils";

//scrap doesn't count
const serpuloItems = [Items.copper, Items.lead, Items.graphite, Items.silicon, Items.metaglass, Items.titanium, Items.plastanium, Items.thorium, Items.surgeAlloy, Items.phaseFabric];
const erekirItems = [Items.beryllium, Items.graphite, Items.silicon, Items.tungsten, Items.oxide, Items.surgeAlloy, Items.thorium, Items.carbide, Items.phaseFabric];
const usefulItems10k = {
	serpulo: serpuloItems.map(i => new ItemStack(i, 10_000)),
	erekir: erekirItems.map(i => new ItemStack(i, 10_000)),
	sun: [...serpuloItems, ...erekirItems].map(i => new ItemStack(i, 10_000)),
};
const allItems1k = Vars.content.items().select(i => !i.hidden).toArray().map(i => new ItemStack(i, 1000));
const mixtechItems = Items.serpuloItems.copy();
Items.erekirItems.each(i => mixtechItems.add(i));

export class Achievement {
	nid: number;
	sid!: string;

	icon: string;
	description: string;
	extendedDescription?: string;

	checkPlayerInfrequent?: (player:FishPlayer) => boolean;
	checkPlayerFrequent?: (player:FishPlayer) => boolean;
	checkPlayerJoin?: (player:FishPlayer) => boolean;
	checkPlayerGameover?: (player:FishPlayer, winTeam:Team) => boolean;
	checkInfrequent?: (team: Team) => boolean;
	checkFrequent?: (team: Team) => boolean;
	checkGameover?: (winTeam:Team) => boolean;

	notify: "nobody" | "player" | "everyone" = "player";
	hidden = false;
	disabled = false;
	allowedModes: GamemodeName[];
	modesText: string;
	
	static all: Achievement[] = [];
	/** Checked every second. */
	static checkFrequent: Achievement[] = [];
	/** Checked every 10 seconds. Use for states that can be gained but not lost, such as "x wins". */
	static checkInfrequent: Achievement[] = [];
	static checkJoin: Achievement[] = [];
	static checkGameover: Achievement[] = [];

	private static _id = 0;
	constructor(
		icon: string | number | [string, number | string],
		public name: string,
		description: string | [string, string],
		options: Partial<Pick<Achievement,
			"notify" | "hidden" | "disabled" |
			"checkFrequent" | "checkInfrequent" | "checkPlayerFrequent" | "checkPlayerInfrequent" | "checkPlayerJoin" | "checkGameover" | "checkPlayerGameover"
		> & {
			modes: ["only" | "not", ...GamemodeName[]];
		}> = {},
	){
		if(Array.isArray(icon)){
			this.icon = (icon[0].startsWith("[") ? icon[0] : `[${icon[0]}]`) + (typeof icon[1] == "number" ? String.fromCharCode(icon[1]) : icon[1]);
		} else if(typeof icon == "number"){
			this.icon = String.fromCharCode(icon);
		} else {
			this.icon = icon;
		}
		if(Array.isArray(description)){
			[this.description, this.extendedDescription] = description;
		} else this.description = description;
		this.nid = Achievement._id ++;
		Object.assign(this, options);
		if(options.modes){
			const [type, ...modes] = options.modes;
			if(type == "only"){
				this.allowedModes = modes;
				this.modesText = modes.join(", ");
			} else {
				this.allowedModes = GamemodeNames.filter(m => !modes.includes(m));
				this.modesText = `all except ${modes.join(", ")}`;
			}
		} else {
			this.allowedModes = GamemodeNames;
			this.modesText = `all`;
		}
		if(!this.disabled){
			Achievement.all.push(this);
			if(this.checkPlayerFrequent || this.checkFrequent) Achievement.checkFrequent.push(this);
			if(this.checkPlayerInfrequent || this.checkInfrequent) Achievement.checkInfrequent.push(this);
			if(this.checkPlayerJoin) Achievement.checkJoin.push(this);
			if(this.checkPlayerGameover || this.checkGameover) Achievement.checkGameover.push(this);
		}
	}

	message():string {
		return FColor.achievement`Achievement granted!\n[accent]${this.name}[white]: ${this.description}`;
	}
	messageToEveryone(player:FishPlayer):string {
		return FColor.achievement`Player ${player.prefixedName} has completed the achievement "${this.name}".`;
	}
	allowedInMode(){
		return this.allowedModes.includes(Gamemode.name());
	}

	public grantToAllOnline(team?: Team){
		FishPlayer.forEachPlayer(p => {
			if(!this.has(p) && (!team || p.team() == team)){
				if(this.notify != "nobody") p.sendMessage(this.message());
				this.setObtained(p);
			}
		});
	}
	/** Do not call this in a loop on an achievement set to notify everyone. */
	public grantTo(player:FishPlayer){
		if(this.notify == "everyone") Call.sendMessage(this.messageToEveryone(player));
		else if(this.notify == "player") player.sendMessage(this.message());
		if(!this.has(player)) this.setObtained(player);
	}

	private setObtained(player:FishPlayer){
		//void player.updateSynced(fishP => fishP.achievements.set(this.nid));
		player.achievements.set(this.nid);
	}
	public has(player:FishPlayer){
		return player.achievements.get(this.nid);
	}
}

Events.on(EventType.PlayerJoin, ({player}: {player: mindustryPlayer}) => {
	for(const ach of Achievement.checkJoin){
		if(ach.allowedInMode()){
			const fishP = FishPlayer.get(player);
			if(!ach.has(fishP) && ach.checkPlayerJoin?.(fishP)){
				if(fishP.dataSynced) ach.grantTo(fishP);
				else Timer.schedule(() => ach.grantTo(fishP), 2); //2 seconds should be enough
			}
		}
	}
});
FishEvents.on("gameOver", (_, winner) => {
	for(const ach of Achievement.checkGameover){
		if(ach.allowedInMode()){
			if(ach.checkGameover?.(winner)) ach.grantToAllOnline();
			else FishPlayer.forEachPlayer(fishP => {
				if(!ach.has(fishP) && ach.checkPlayerGameover?.(fishP, winner)){
					ach.grantTo(fishP);
				}
			});
		}
	}
});
Timer.schedule(() => {
	for(const ach of Achievement.checkFrequent){
		if(ach.allowedInMode()){
			if(ach.checkFrequent){
				if(Gamemode.pvp()){
					Vars.state.teams.active.each(({team}) => {
						if(ach.checkFrequent!(team)) ach.grantToAllOnline(team);
					});
				} else {
					if(ach.checkFrequent(Vars.state.rules.defaultTeam)) ach.grantToAllOnline();
				}
			} else {
				FishPlayer.forEachPlayer(fishP => {
					if(!ach.has(fishP) && ach.checkPlayerFrequent?.(fishP)) ach.grantTo(fishP);
				});
			}
		}
	}
}, 1, 1);
Timer.schedule(() => {
	for(const ach of Achievement.checkInfrequent){
		if(ach.allowedInMode()){
			if(ach.checkInfrequent){
				if(Gamemode.pvp()){
					Vars.state.teams.active.each(({team}) => {
						if(ach.checkInfrequent!(team)) ach.grantToAllOnline(team);
					});
				} else {
					if(ach.checkInfrequent(Vars.state.rules.defaultTeam)) ach.grantToAllOnline();
				}
			} else {
				FishPlayer.forEachPlayer(fishP => {
					if(!ach.has(fishP) && ach.checkPlayerInfrequent?.(fishP)) ach.grantTo(fishP);
				});
			}
		}
	}
}, 10, 10);

export const Achievements = {
	// ===========================
	// ╦ ╦ ╔═╗ ╦═╗ ╔╗╔ ╦ ╔╗╔ ╔═╗ ┬
	// ║║║ ╠═╣ ╠╦╝ ║║║ ║ ║║║ ║ ╦ │
	// ╚╩╝ ╩ ╩ ╩╚═ ╝╚╝ ╩ ╝╚╝ ╚═╝ o
	// ===========================
	// Do not change the order of any achievements.
	// Do not remove any achievements: instead, set the "disabled" option to true.
	// Reordering achievements will cause ID shifts.


	//Joining based
	welcome: new Achievement(["gold", Iconc.infoCircle], "Welcome", "Join the server.", {
		checkPlayerJoin: () => true,
		notify: "nobody"
	}),
	migratory_fish: new Achievement(Iconc.exit, "Migratory Fish", "Join all of our servers.", {
		disabled: true
	}), //TODO
	frequent_visitor: new Achievement(Iconc.planeOutline, "Frequent Visitor", ["Join the server 100 times.", "Note: Do not reconnect frequently, that will not work. This achievement requires that you have been playing for 1 month."], {
		checkPlayerJoin: p => p.info().timesJoined >= 100 && (Date.now() - p.globalFirstJoined > Duration.months(1))
	}),

	//Gamemode based
	attack: new Achievement(Iconc.modeAttack, "Attack", ["Defeat an attack map.", "You must be present for the beginning and end of the game."], {
		modes: ["only", "attack"],
		checkPlayerGameover: (player, winTeam) => 
			Vars.state.rules.defaultTeam == winTeam && player.tstats.lastMapStartTime == FishPlayer.lastMapStartTime,
	}),
	survival: new Achievement(Iconc.modeSurvival, "Survival", ["Survive 50 waves in a survival map.", "Must be during the same game."], {
		modes: ["only", "survival"],
		checkPlayerInfrequent: (player) => 
			player.tstats.wavesSurvived >= 50,
	}),
	pvp: new Achievement(Iconc.modePvp, "PVP", ["Win a match of PVP.", "You must be present for the beginning and end of the game."], {
		modes: ["only", "pvp"],
		checkPlayerGameover: (player, winTeam) => 
			player.team() == winTeam && player.tstats.lastMapStartTime == FishPlayer.lastMapStartTime,
	}),
	sandbox: new Achievement(Iconc.image, "Sandbox", "Spend 1 hour in Sandbox.", {
		modes: ["only", "sandbox"],
		checkPlayerInfrequent: p => p.stats.timeInGame > Duration.hours(1),
	}),
	hexed: new Achievement(Iconc.layers, "Hexed", ["Play a match of Hexed.", "You must be present for the beginning and end of the game."], {
		modes: ["only", "hexed"],
		checkPlayerGameover: (player) => 
			player.tstats.lastMapStartTime == FishPlayer.lastMapStartTime,
	}),
	minigame: new Achievement(Iconc.play, "Minigame", ["Win a Minigame.", "You must be present for the beginning and end of the game."], {
		modes: ["only", "minigame"],
		checkPlayerGameover: (player, winTeam) => 
			player.team() == winTeam && player.tstats.lastMapStartTime == FishPlayer.lastMapStartTime,
	}),

	//playtime based
	playtime_1: new Achievement(["white", Iconc.googleplay], "Playtime 1", "Spend 1 hour in-game.", {
		checkPlayerInfrequent: p => p.globalStats.timeInGame >= Duration.hours(1)
	}),
	playtime_2: new Achievement(["red", Iconc.googleplay], "Playtime 2", "Spend 12 hours in-game.", {
		checkPlayerInfrequent: p => p.globalStats.timeInGame >= Duration.hours(12)
	}),
	playtime_3: new Achievement(["orange", Iconc.googleplay], "Playtime 3", "Spend 2 days in-game.", {
		checkPlayerInfrequent: p => p.globalStats.timeInGame >= Duration.days(2)
	}),
	playtime_4: new Achievement(["yellow", Iconc.googleplay], "Playtime 4", "Spend 10 days in-game.", {
		checkPlayerInfrequent: p => p.globalStats.timeInGame >= Duration.days(10)
	}),

	//victories based
	victory_1: new Achievement(["white", Iconc.star], "First Victory", "Win a map run.", {
		checkPlayerGameover: p => p.globalStats.gamesWon >= 1
	}),
	victory_2: new Achievement(["red", Iconc.star], "Victories 2", "Win 5 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesWon >= 5
	}),
	victory_3: new Achievement(["orange", Iconc.star], "Victories 3", "Win 30 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesWon >= 30
	}),
	victory_4: new Achievement(["yellow", Iconc.star], "Victories 4", "Win 100 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesWon >= 100,
		notify: "everyone"
	}),

	//games based
	games_1: new Achievement(["white", Iconc.itchio], "Games 1", "Play 10 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesFinished >= 10
	}),
	games_2: new Achievement(["red", Iconc.itchio], "Games 2", "Play 40 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesFinished >= 40
	}),
	games_3: new Achievement(["orange", Iconc.itchio], "Games 3", "Play 100 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesFinished >= 100
	}),
	games_4: new Achievement(["yellow", Iconc.itchio], "Games 4", "Play 200 map runs.", {
		checkPlayerGameover: p => p.globalStats.gamesFinished >= 200,
		notify: "everyone"
	}),

	//messages based
	messages_1: new Achievement(["white", Iconc.chat], "Hello", "Send your first chat message.", {
		checkPlayerInfrequent: p => p.globalStats.chatMessagesSent >= 1,
		notify: "nobody"
	}),
	messages_2: new Achievement(["red", Iconc.chat], "Chat 2", ["Send 100 chat messages.", "Warning: you will be kicked if you spam the chat."], {
		checkPlayerInfrequent: p => p.globalStats.chatMessagesSent >= 100
	}),
	messages_3: new Achievement(["orange", Iconc.chat], "Chat 3", ["Send 500 chat messages.", "Warning: you will be kicked if you spam the chat."], {
		checkPlayerInfrequent: p => p.globalStats.chatMessagesSent >= 500
	}),
	messages_4: new Achievement(["yellow", Iconc.chat], "Chat 4", ["Send 2000 chat messages.", "Warning: you will be kicked if you spam the chat."], {
		checkPlayerInfrequent: p => p.globalStats.chatMessagesSent >= 2000
	}),
	messages_5: new Achievement(["lime", Iconc.chat], "Chat 4", ["Send 5000 chat messages.", "Warning: you will be kicked if you spam the chat."], {
		checkPlayerInfrequent: p => p.globalStats.chatMessagesSent >= 5000,
		notify: "everyone"
	}),

	//blocks built based
	builds_1: new Achievement(["white", Iconc.fileText], "The Factory Must Prepare", "Construct 1 buildings.", {
		checkPlayerInfrequent: p => p.globalStats.blocksPlaced >= 1,
		notify: "nobody"
	}),
	builds_2: new Achievement(["red", Iconc.fileText], "The Factory Must Begin", "Construct 200 buildings.", {
		checkPlayerInfrequent: p => p.globalStats.blocksPlaced > 200
	}),
	builds_3: new Achievement(["orange", Iconc.fileText], "The Factory Must Produce", "Construct 1000 buildings.", {
		checkPlayerInfrequent: p => p.globalStats.blocksPlaced > 1000
	}),
	builds_4: new Achievement(["yellow", Iconc.fileText], "The Factory Must Grow", "Construct 5000 buildings.", {
		checkPlayerInfrequent: p => p.globalStats.blocksPlaced > 5000,
	}),

	//units
	t5: new Achievement(Blocks.tetrativeReconstructor.emoji(), "T5", "Control a T5 unit.", {
		modes: ["not", "sandbox"], checkPlayerFrequent(player) {
			return (unitsT5 as Array<UnitType | undefined>).includes(player.unit()?.type);
		},
	}),
	dibs: new Achievement(["green", Blocks.tetrativeReconstructor.emoji()], "Dibs", "Be the first player to control the first T5 unit made by a reconstructor that you placed.", {
		modes: ["not", "sandbox"],
		disabled: true
	}), //TODO
	worm: new Achievement(UnitTypes.latum.emoji(), "Worm", "Control a Latum.", {
		checkPlayerFrequent(player) {
			return player.unit()?.type == UnitTypes.latum;
		}
	}),
	
	//pvp
	above_average: new Achievement(Iconc.chartBar, "Above Average", ["Reach a win rate above 50%.", "Must be over at least 20 games of PVP."], {
		modes: ["only", "pvp"],
		checkPlayerInfrequent: p => p.stats.gamesWon / p.stats.gamesFinished > 0.5 && p.stats.gamesFinished >= 20
	}),
	head_start: new Achievement(Iconc.commandAttack, "Head Start", ["Win a match of PVP where your opponents have a 5 minute head start.", "Your team must wait for the first 5 minutes without building or descontructing any buildings."], {
		modes: ["only", "pvp"],
		disabled: true
	}), //TODO
	one_v_two: new Achievement(["red", Iconc.modePvp], "1v2", "Defeat two (or more) opponents in PVP without help from other players.", {
		modes: ["only", "pvp"],
		disabled: true
	}), //TODO

	//sandbox
	underpowered: new Achievement(["red", Blocks.powerSource.emoji()], "Underpowered", "Overload a power source.", {
		modes: ["only", "sandbox"],
		checkFrequent(){
			let found = false;
			//deliberate ordering for performance reasons
			Groups.powerGraph.each(({graph}) => {
				//we don't need to actually check for power sources, just assume that ~1mil power is a source
				if(graph.lastPowerNeeded > graph.lastPowerProduced && graph.lastPowerNeeded < 1e10 && graph.lastPowerProduced >= 999_900)
					found = true;
			});
			return found;
		}
	}),

	//easter eggs
	memory_corruption: new Achievement(["red", Iconc.host], "Is the server OK?", "Witness a memory corruption.", {
		notify: "nobody"
	}),
	run_js_without_perms: new Achievement(["yellow", Iconc.warning], "XKCD 838", ["Receive a warning from the server that an incident will be reported.", "One of the admin commands has a custom error message."], {
		notify: "everyone"
	}),
	script_kiddie: new Achievement(["red", Iconc.warning], "Script Kiddie", ["Pretend to be a hacker. The server will disagree.", "Change your name to something including \"hacker\"."], {
		notify: "nobody"
	}),
	hacker: new Achievement(["lightgray", Iconc.host], "Hacker", "Find a bug in the server and report it responsibly.", {
		hidden: true
	}),

	//items based
	items_10k: new Achievement(["green", Iconc.distribution], "Cornucopia", "Obtain 10k of every useful resource.", {
		modes: ["not", "sandbox"],
		checkPlayerFrequent(player) {
			if(!Vars.state.planet) return false;
			return player.team().items()?.has(usefulItems10k[Vars.state.planet.name as "serpulo" | "erekir" | "sun"]) || false;
		},
	}),
	fullVault: new Achievement(["green", Blocks.vault.emoji()], "Well Stocked", ["Fill a vault with every obtainable item.", "Requires mixtech."], {
		modes: ["not", "sandbox"],
		checkInfrequent(team) {
			return Vars.indexer.getFlagged(team, BlockFlag.storage).contains(boolf<Building>(b => b.block == Blocks.vault && b.items.has(allItems1k)));
		},
	}),
	full_core: new Achievement(["green", Blocks.coreAcropolis.emoji()], "Multiblock Incinerator", "Completely fill the core with all obtainable items on a map with core incineration enabled.", {
		modes: ["not", "sandbox"],
		checkFrequent(team) {
			if(!Vars.state.planet) return false;
			let items;
			switch(Vars.state.planet.name as "serpulo" | "erekir" | "sun"){
				case "serpulo": items = Items.serpuloItems; break;
				case "erekir": items = Items.erekirItems; break;
				case "sun": items = mixtechItems; break;
			}
			const capacity = team.core()?.storageCapacity;
			if(!capacity) return false;
			const module = team.items();
			return items.allMatch(i => module.has(i, capacity));
		},
	}),
	siligone: new Achievement(["red", Items.silicon.emoji()], "Siligone", ["Run out of silicon.", "You must have reached 2000 silicon before running out."], {
		modes: ["not", "sandbox"]
	}),
	silicon_100k: new Achievement(["green", Items.silicon.emoji()], "Silicon for days", "Obtain 100k silicon.", {
		modes: ["not", "sandbox"],
		checkFrequent: team => team.items().has(Items.silicon, 100_000)
	}),

	//other players based
	alone: new Achievement(["red", Iconc.players], "Alone", "Be the only player online for more than two minutes", {
		notify: "nobody"
	}),
	join_playercount_20: new Achievement(["lime", Iconc.players], "Is there enough room?", "Join a server with 20 players online", {
		checkPlayerJoin: () => Groups.player.size() > 20,
	}),
	meet_staff: new Achievement(["lime", Iconc.hammer], "Griefer Beware", "Meet a staff member in-game", {
		checkPlayerJoin: () => Groups.player.contains(p => FishPlayer.get(p).ranksAtLeast("mod")),
	}),
	meet_fish: new Achievement(["blue", Iconc.admin], "The Big Fish", "Meet >|||>Fish himself in-game", {
		checkPlayerJoin: () => Groups.player.contains(p => FishPlayer.get(p).ranksAtLeast("fish")),
		hidden: true,
	}),
	server_speak: new Achievement(["pink", Iconc.host], "It Speaks!", "Hear the server talk in chat."),
	see_marked_griefer: new Achievement(["red", Iconc.hammer], "Flying Tonk", "See a marked griefer in-game.", {
		checkInfrequent: () => Groups.player.contains(p => FishPlayer.get(p).marked()),
	}),

	//maps based
	beat_map_not_in_rotation: new Achievement(["pink", Iconc.map], "How?", "Beat a map that isn't in the list of maps.", {
		notify: "everyone",
		modes: ["not", "pvp"],
		checkGameover: (team) => team == Vars.state.rules.defaultTeam && !Vars.state.map.custom
	}),

	//misc
	power_1mil: new Achievement(["green", Blocks.powerSource.emoji()], "Who needs sources?", "Reach a power production of 1 million without using power sources.", {
		modes: ["not", "sandbox"],
		checkFrequent(){
			let found = false;
			//deliberate ordering for performance reasons
			Groups.powerGraph.each(({graph}) => {
				//we don't need to actually check for power sources, just assume that ~1mil power is a source
				if(graph.lastPowerProduced > 1e6 && !graph.producers.contains(boolf<Building>(b => b.block == Blocks.powerSource)))
					found = true;
			});
			return found;
		}
	}),
	pacifist_crawler: new Achievement(UnitTypes.crawler.emoji(), "Pacifist Crawler", "Control a crawler for 15 minutes without exploding.", {
		modes: ["not", "sandbox"],
		disabled: true
	}), //TODO
	core_low_hp: new Achievement(["yellow", Blocks.coreNucleus.emoji()], "Close Call", "Have your core reach less than 50 health, but survive.", {
		modes: ["not", "sandbox"],
	}),
	enemy_core_low_hp: new Achievement(["red", Blocks.coreNucleus.emoji()], "So Close", "Cause the enemy core to reach less than 50 health, but survive.", {
		modes: ["not", "sandbox"],
	}),
	verified: new Achievement([Rank.active.color, Iconc.ok], "Verified", `Be promoted automatically to ${Rank.active.coloredName()} rank.`, {
		checkPlayerJoin: p => p.ranksAtLeast("active"), notify: "nobody"
	}),
	click_me: new Achievement(Iconc.bookOpen, "Clicked", `Run /achievementgrid and click this achievement.`),
	afk: new Achievement(["yellow", Iconc.lock], "AFK?", "Win a game without interacting with any blocks.", {
		modes: ["not", "sandbox"],
		checkPlayerGameover(player, winTeam) {
			return player.team() == winTeam && player.tstats.blockInteractionsThisMap == 0;
		},
	}),
	status_effects_5: new Achievement(StatusEffects.electrified.emoji(), "A Furious Cocktail", "Have at least 5 status effects at once.", {
		checkPlayerFrequent: p => {
			const unit = p.unit();
			if(!unit) return false;
			const statuses = getStatuses(unit);
			return statuses.size >= 5;
		},
		modes: ["not", "sandbox"]
	}),
	drown_big_tank: new Achievement(["blue", UnitTypes.conquer.emoji()], "Not Waterproof", "Drown an enemy Conquer or Vanquish.", {
		notify: "everyone",
		modes: ["not", "sandbox"]
	}),
	drown_mace_in_cryo: new Achievement(["cyan", UnitTypes.mace.emoji()], "Cooldown", `Drown a Mace in ${Blocks.cryofluid.emoji()} Cryofluid.`, {
		notify: "everyone",
		modes: ["not", "sandbox"]
	}),
	max_boost_duo: new Achievement(["yellow", Blocks.duo.emoji()], "In Duo We Trust", "Control a Duo with maximum boosts.", {
		checkPlayerFrequent(player) {
			const tile = player.unit()?.tile?.();
			if(!tile) return false;
			return tile.block == Blocks.duo && tile.ammo!.peek().item == Items.silicon && tile.liquids.current() == Liquids.cryofluid && tile.timeScale() >= 2.5;
		},
		notify: "everyone",
		modes: ["not", "sandbox"]
	}),
	foreshadow_overkill: new Achievement(["yellow", Blocks.foreshadow.emoji()], "Overkill", ["Kill a Dagger with a maximally boosted Foreshadow.", "Hint: the maximum overdrive is not +150%..."], {
		notify: "everyone",
		modes: ["not", "sandbox"]
	}),
	impacts_15: new Achievement(["green", Blocks.impactReactor.emoji()], "Darthscion's Nightmare", "Run 15 impact reactors at full efficiency.", {
		modes: ["not", "sandbox"],
		notify: "everyone",
		checkInfrequent(team){
			let found = false;
			//deliberate ordering for performance reasons
			Groups.powerGraph.each(({graph}) => {
				//assume that any network running 15 impacts has at least 2 other power sources
				if(graph.producers.size >= 17 && graph.producers.count(b => b.block == Blocks.impactReactor && b.warmup! > 0.99999) > 15 && graph.producers.first().team == team)
					found = true;
			});
			return found;
		},
	}),

} satisfies Record<string, Achievement>;
Object.entries(Achievements).forEach(([id, a]) => a.sid = id);

FishEvents.on("commandUnauthorized", (_, player, name) => {
	if(name == "js" || name == "fjs") Achievements.run_js_without_perms.grantTo(player);
});


Events.on(EventType.UnitDrownEvent, ({unit}:{unit: Unit}) => {
	if(!Gamemode.sandbox()){
		if(unit.type == UnitTypes.mace && unit.tileOn()?.floor() == Blocks.cryofluid) Achievements.drown_mace_in_cryo.grantToAllOnline();
		else if(unit.type == UnitTypes.conquer || unit.type == UnitTypes.vanquish){
			if(Gamemode.pvp()){
				Vars.state.teams.active.map(t => t.team).select(t => t !== unit.team).each(t => Achievements.drown_big_tank.grantToAllOnline(t));
			} else {
				if(unit.team !== Vars.state.rules.defaultTeam) Achievements.drown_big_tank.grantToAllOnline();
			}
		}
	}
});

Events.on(EventType.UnitBulletDestroyEvent, ({unit, bullet}:{unit:Unit; bullet: Bullet}) => {
	if(!Gamemode.sandbox() && unit.type == UnitTypes.dagger && (bullet.owner as Building).block == Blocks.foreshadow){
		const build = bullet.owner as Building;
		if(build.liquids.current() == Liquids.cryofluid && build.timeScale() >= 3) Achievements.foreshadow_overkill.grantToAllOnline(build.team);
	}
});

let siliconReached = Team.all.map(_ => false);
Events.on(EventType.GameOverEvent, () => siliconReached = Team.all.map(_ => false));
let isAlone = 0;

Timer.schedule(() => {
	if(!Vars.state.gameOver && !Gamemode.sandbox()){
		Vars.state.teams.active.each(({team}) => {
			if(team.items().has(Items.silicon, 2000)) siliconReached[team.id] = true;
			else if(siliconReached[team.id] && team.items().get(Items.silicon) == 0)
				Achievements.siligone.grantToAllOnline(team);
		});
	}
	if(Groups.player.size() == 1){
		if(isAlone == 0) isAlone = Date.now();
		else if(Date.now() > isAlone + Duration.minutes(2)) Achievements.alone.grantToAllOnline();
	} else isAlone = 0;
}, 2, 2);

const coreHealthTime = new Map<Building, number>();
if(!Gamemode.sandbox()) Timer.schedule(() => {
	coreHealthTime.forEach((value, core) => {
		if(Date.now() > value){
			if(core.dead){
				coreHealthTime.delete(core);
			} else if(core.health > 50){
				//grant achievement
				FishPlayer.forEachPlayer(p => {
					if(core.team == p.team()) Achievements.core_low_hp.grantTo(p);
					else Achievements.enemy_core_low_hp.grantTo(p);
				});
				coreHealthTime.delete(core);
			}
		}
	});
	Vars.state.teams.active.flatMap(t => t.cores).each(core => {
		if(core.health < 50 && !coreHealthTime.get(core)) coreHealthTime.set(core, Date.now() + 12_000);
	});
}, 1, 1);
Events.on(EventType.GameOverEvent, () => coreHealthTime.clear());
Events.on(EventType.WorldLoadEvent, () => coreHealthTime.clear());


FishEvents.on("scriptKiddie", (_, p) => Timer.schedule(() => Achievements.script_kiddie.grantTo(p), 2));
FishEvents.on("memoryCorruption", () => Achievements.memory_corruption.grantToAllOnline());
FishEvents.on("serverSays", () => Achievements.server_speak.grantToAllOnline());