import { FColor, Gamemode, GamemodeName, GamemodeNames } from "/config";
import { Duration } from "/funcs";
import { FishEvents, unitsT5 } from "/globals";
import { FishPlayer } from "/players";
import { Rank } from "/ranks";

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
	private nid: number;
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

	notify: "none" | "player" | "everyone" = "player";
	hidden = false;
	disabled = false;
	allowedModes: GamemodeName[];
	
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
			this.icon = `[${icon[0]}]` + (typeof icon[1] == "number" ? String.fromCharCode(icon[1]) : icon[1]);
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
			if(type == "only") this.allowedModes = modes;
			else this.allowedModes = GamemodeNames.filter(m => !modes.includes(m));
		} else {
			this.allowedModes = GamemodeNames;
		}
		Achievement.all.push(this);
		if(this.checkPlayerFrequent || this.checkFrequent) Achievement.checkFrequent.push(this);
		if(this.checkPlayerInfrequent || this.checkInfrequent) Achievement.checkInfrequent.push(this);
		if(this.checkPlayerJoin) Achievement.checkJoin.push(this);
		if(this.checkPlayerGameover || this.checkGameover) Achievement.checkGameover.push(this);
	}

	message():string {
		return FColor.achievement`Achievement granted!\n[accent]${this.name}: [white]${this.description}`;
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
				if(this.notify != "none") p.sendMessage(this.message());
				this.setObtained(p);
			}
		});
	}
	public grantTo(player:FishPlayer){
		if(this.notify == "everyone") Call.sendMessage(this.messageToEveryone(player));
		else if(this.notify == "player") player.sendMessage(this.message());
		this.setObtained(player);
	}

	private setObtained(player:FishPlayer){
		return player.achievements.set(this.nid);
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
				ach.grantTo(fishP);
			}
		}
	}
});
Events.on(EventType.GameOverEvent, ({winner}) => {
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
					Vars.state.teams.active.each(t => {
						if(ach.checkFrequent!(t)) ach.grantToAllOnline(t);
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
					Vars.state.teams.active.each(t => {
						if(ach.checkInfrequent!(t)) ach.grantToAllOnline(t);
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
