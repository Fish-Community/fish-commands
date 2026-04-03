/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains a translation client implementation for https://github.com/TheRadioactiveBanana/translate-api-wrapper
*/

import * as api from "/api";
import { translationApiToken, translationApiUrl } from "/config";
import { FishPlayer } from "/players";
import { removeFoosChars } from "/utils";

export type Language = {
	name: string;
	code: string;
};

export const languageCache = new ObjectSet<Language>();
export const playerLanguageCache = new ObjectMap<Language, Seq<Player>>();
export const translationCache = new ObjectMap<string, string>();

export function initializeTranslation(){
	fetchLanguageCache(false);

	Events.on(EventType.PlayerJoin, e => {
		const fishPlayer = FishPlayer.get(e.player);
		const language = getLanguageFromCache(fishPlayer.language || e.player.locale);
		if(fishPlayer.language != language.code){
			fishPlayer.language = language.code;
			void api.setFishPlayerData(fishPlayer.getData(), 1, true);
		}

		if (languageCache.isEmpty()){
			//shouldn't ever happen, but by chance it does
			fetchLanguageCache(true);
		}

		setPlayerLanguageEntry(e.player, language);
	});

	Events.on(EventType.PlayerLeave, e => {
		removePlayerLanguageEntry(e.player);
	});
}

export function handleMessage(sender: Player, message: string) {
	if (languageCache.isEmpty()){
		//shouldn't ever happen, but by chance it does
		fetchLanguageCache(true);
	}

	sender.sendMessage(Vars.netServer.chatFormatter.format(sender, message)); //return to sender immediately, they don't need to see their own translation

	const cleanedMessage = Strings.stripGlyphs(Strings.stripColors(removeFoosChars(message)));
	const delivered = new ObjectSet<string>();

	playerLanguageCache.each((lang, players) => {
		const formatted = Vars.netServer.chatFormatter.format(sender, message);
		const recipients = uniqueRecipients(players, sender, delivered);

		if(recipients.isEmpty()) return;

		if(lang == null || lang.code === "off" || lang.code === "auto" || lang.code === "none"){
			for (const player of recipients.toArray()) player.sendMessage(formatted); //ignore, send it as if nothing changed
			return;
		}

		const cacheKey = `${(lang.code)}\n${cleanedMessage}`;

		const cachedTranslation = translationCache.get(cacheKey);
		if (cachedTranslation != null){
			sendTranslatedMessage(sender, message, cachedTranslation, recipients);
			return;
		}

		const req = Http.post(
			translationApiUrl + "/api/translate",
			cleanedMessage
		);

		req.header("from", "auto");
		req.header("to", lang.code);
		req.header("token", translationApiToken.string());

		req.timeout = 2000; //low timeout to not lag chat too much

		req.error(e => {
			for (const player of recipients.toArray()) player.sendMessage(formatted); //failed, send it as if nothing changed

			Log.err(e.getMessage());
			if (e.response) Log.err(e.response.getResultAsString());
		});

		req.submit(t => {
			const result = t.getResultAsString();

			if(t.getStatus().code != 200 || result == message){
				for (const player of recipients.toArray()) player.sendMessage(formatted); //bad, send it as if nothing changed
				return;
			}

			translationCache.put(cacheKey, result);
			sendTranslatedMessage(sender, message, result, recipients);
		});
	});
}

export function setPlayerLanguageEntry(player: Player, language: Language){
	removePlayerLanguageEntry(player);

	const bucket = playerLanguageCache.get(
		language,
		()=>new Seq<Player>()
	);
	bucket.add(player);
}

function removePlayerLanguageEntry(player: Player){
	playerLanguageCache.each((_, players) => {
		players.remove(p => p.uuid() === player.uuid());
	});
}

function uniqueRecipients(players: Seq<Player>, sender: Player, delivered: ObjectSet<string>){
	const recipients = new Seq<Player>();
	for (const player of players.toArray()){
		const uuid = player.uuid();
		if(uuid === sender.uuid()) continue;
		if(delivered.contains(uuid)) continue;
		delivered.add(uuid);
		recipients.add(player);
	}
	return recipients;
}

function sendTranslatedMessage(sender: Player, originalMessage: string, translatedMessage: string, recipients: Seq<Player>){
	const formatted = Vars.netServer.chatFormatter.format(sender, originalMessage)
		+ "\n[lightgray]Translated: " + translatedMessage + "[]";
	for (const player of recipients.toArray()){
		Call.sendMessage(player.con, formatted, originalMessage, sender);
	}
}

export function getLanguageFromCache(code:string):Language {
	if (languageCache.isEmpty()){
		fetchLanguageCache(true);
	}

	const normalizedCode = code.toLowerCase();
	if (normalizedCode == "none" || normalizedCode == "off"){
		return {code: "none", name: "Off"};
	}

	let language: Language | null = null;
	languageCache.each(t=>{
		if (t.code.toLowerCase() == normalizedCode){
			language = t;
		}
	});

	if (language != null) return language;

	return {code: "none", name: "Off"}; //unsupported
}

export function isLanguageAvailable(code:string){
	return getLanguageFromCache(code).code != "none";
}

function fetchLanguageCache(blockUntilResponse:boolean) {
	const req = Http.get(translationApiUrl + "/api/languages");

	req.error(e => {
		Log.err("Failed to load translation API languages");
		Log.err(e);
	});


	req[blockUntilResponse ? "block" : "submit"](t => {
		const parsed = JSON.parse(t.getResultAsString());

		Core.app.post(() => {
			languageCache.addAll(parsed);
		});
	});
}
