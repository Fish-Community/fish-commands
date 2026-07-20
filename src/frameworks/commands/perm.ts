/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the Perm class.
*/
import { FColor, Gamemode, GamemodeName, text } from "/config";
import { crash } from "/funcs";
import { FishPlayer } from "/players";
import { Rank, RankName } from "/ranks";
import { SelectEnumClassKeys } from "/types";
import { match } from "/utils";

export type PermCategory = "player" | "trusted" | "mod" | "admin" | "manager" | "member";

/** Represents a permission that is required to do something. */
export class Perm {
	static perms:Partial<Record<string, Perm>> = {};

	static none = new Perm("none", fishP => true, "player", "[sky]");
	static trusted = Perm.fromRank(Rank.trusted);
	static mod = Perm.fromRank(Rank.mod);
	static admin = Perm.fromRank(Rank.admin);
	static manager = Perm.fromRank(Rank.manager);
	static member = new Perm("member", fishP => fishP.hasFlag("member"), "member", "[pink]", `You must have a ${FColor.member`Fish Membership`} to use this command. Get a Fish Membership at[sky] ${text.membershipURL} []`);
	static chat = new Perm("chat", fishP => (!fishP.muted() && !fishP.autoflagged) || fishP.ranksAtLeast("mod"), "player");
	static bypassChatFilter = new Perm("bypassChatFilter", "admin");
	static seeMutedMessages = new Perm("seeMutedMessages", fishP => fishP.muted() || fishP.autoflagged || fishP.ranksAtLeast("mod"), "mod");
	static play = new Perm("play", fishP => !fishP.stelled() || fishP.ranksAtLeast("mod"), "player");
	static seeErrorMessages = new Perm("seeErrorMessages", "mod");
	static viewUUIDs = new Perm("viewUUIDs", "mod");
	static viewIPs = new Perm("viewIPs", "admin");
	static blockTrolling = new Perm("blockTrolling", fishP => fishP.rank === Rank.pi, "player");
	static visualEffects = new Perm("visualEffects", fishP => (!fishP.stelled() || fishP.ranksAtLeast("mod")) && !fishP.hasFlag("no_effects"), "player");
	static bulkVisualEffects = new Perm("bulkVisualEffects", fishP => (
		(fishP.hasFlag("developer") || fishP.hasFlag("illusionist") || fishP.hasFlag("member")) && !fishP.stelled())
		|| fishP.ranksAtLeast("mod"),
	"trusted"
	);
	static bypassVoteFreeze = new Perm("bypassVoteFreeze", "trusted");
	static bypassVotekick = new Perm("bypassVotekick", "mod");
	static warn = new Perm("warn", "mod");
	static vanish = new Perm("vanish", "trusted");
	static changeTeam = new Perm("changeTeam", "admin").exceptModes({
		sandbox: Perm.trusted,
		attack: Perm.admin,
		hexed: Perm.mod,
		pvp: Perm.trusted,
		minigame: Perm.trusted,
		testsrv: Perm.trusted,
	});
	/** Whether players should be allowed to change the team of a unit or building. If not, they will be kicked out of their current unit or building before switching teams. */
	static changeTeamExternal = new Perm("changeTeamExternal", "admin").exceptModes({
		sandbox: Perm.trusted,
	});
	static usidCheck = new Perm("usidCheck", "trusted");
	static runJS = new Perm("runJS", "manager");
	static massUnblacklist = new Perm("massUnblacklist", "manager");
	static bypassNameCheck = new Perm("bypassNameCheck", "fish");
	static hardcore = new Perm("hardcore", "trusted");
	static massKill = new Perm("massKill", "admin").exceptModes({
		sandbox: Perm.mod,
	});
	static voteOtherTeams = new Perm("voteOtherTeams", "trusted");
	static immediatelyVotekickNewPlayers = new Perm("immediatelyVotekickNewPlayers", "trusted");

	check:(fishP:FishPlayer) => boolean;
	constructor(name:string, check:RankName);
	constructor(
		name:string, check:(fishP:FishPlayer) => boolean,
		category:PermCategory,
		color?:string, unauthorizedMessage?:string,
		modes?: Partial<Record<GamemodeName, Perm>>,
	);
	constructor(
		public name:string, check:RankName | ((fishP:FishPlayer) => boolean),
		private category_:PermCategory = typeof check == "string" ? rankToCategory(check) : crash(`category is required`),
		public color:string = "",
		public unauthorizedMessage:string = `You do not have the required permission (${name}) to execute this command`,
		public modes: null | Partial<Record<GamemodeName, Perm>> = null,
	){
		if(typeof check == "string"){
			if(Rank.getByName(check) == null) crash(`Invalid perm ${name}: invalid rank name ${check}`);
			this.check = fishP => fishP.ranksAtLeast(check);
		} else {
			this.check = check;
		}
		Perm.perms[name] = this;
	}

	/** Creates a new Perm with overrides for specified gamemodes. */
	exceptModes(modes:Partial<Record<GamemodeName, Perm>>, unauthorizedMessage:string = this.unauthorizedMessage){
		return new Perm(this.name, (fishP) => {
			const effectivePerm = modes[Gamemode.name()] ?? this;
			return effectivePerm.check(fishP);
		}, this.category_, this.color, unauthorizedMessage, modes);
	}
	category(){
		const effectivePerm = this.modes?.[Gamemode.name()] ?? this;
		return effectivePerm.category_;
	}

	private static fromRank(rank:Rank){
		return new Perm(rank.name, fishP => fishP.ranksAtLeast(rank), rankToCategory(rank.name as RankName), rank.color);
	}
	static getByName(name:PermType):Perm {
		return Perm.perms[name] ?? crash(`Invalid requiredPerm`);
	}
}
export type PermType = SelectEnumClassKeys<typeof Perm>;

function rankToCategory(check:RankName):PermCategory {
	return match(check, {
		active: "player",
		admin: "admin",
		fish: "manager",
		manager: "manager",
		mod: "mod",
		pi: "manager",
		player: "player",
		trusted: "trusted"
	} as const);
}

