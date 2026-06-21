/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains a translation client implementation for https://github.com/TheRadioactiveBanana/translate-api-wrapper
*/

import { translationApiToken, translationApiUrl } from "/config";
import { FishPlayer } from "/players";
import { removeFoosChars } from "/utils";

export type Language = {
	name: string;
	code: string;
};

export const languageCache = new ObjectMap<string, Language>();
let lastFailure = 0;
export const playerLanguageCache = new ObjectMap<string, Seq<Player>>();
/** Only modify on main thread */
export const translationCache = new ObjectMap<string, string>();

export function initializeTranslation(){
	void fetchLanguageCache().catch(Log.err);

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	Events.on(EventType.PlayerJoin, async (e) => {
		const fishPlayer = FishPlayer.get(e.player);
		const language = getLanguageFromCache(fishPlayer.language || e.player.locale);
		fishPlayer.language = language.code;

		if(languageCache.isEmpty()){
			if(Date.now() - lastFailure < 60_000) return;
			try {
				await fetchLanguageCache();
			} catch(err){
				Log.err("Network error while fetching language cache");
				lastFailure = Date.now();
				return;
			}
		}

		setPlayerLanguageEntry(e.player, language.code);
	});

	Events.on(EventType.PlayerLeave, e => {
		removePlayerLanguageEntry(e.player);
	});
}

export async function handleMessage(sender: Player, message: string) {
	if(languageCache.isEmpty() && Date.now() - lastFailure > 60_000){
		try {
			await fetchLanguageCache();
		} catch(err){
			Log.err("Network error while fetching language cache");
		}
	}

	sender.sendMessage(Vars.netServer.chatFormatter.format(sender, message)); //return to sender immediately, they don't need to see their own translation

	const cleanedMessage = Strings.stripGlyphs(Strings.stripColors(removeFoosChars(message)));

	playerLanguageCache.each((lang, players) => {
		const formatted = Vars.netServer.chatFormatter.format(sender, message);
		const recipients = players.select(p => p != sender);

		if(recipients.isEmpty()) return;

		if(lang === "off" || lang === "auto" || lang === "none" || translationApiToken.string() == "unset"){
			for (const player of recipients.toArray()) player.sendMessage(formatted); //ignore, send it as if nothing changed
			return;
		}

		const cacheKey = `${lang}\n${cleanedMessage}`;

		const cachedTranslation = translationCache.get(cacheKey);
		if (cachedTranslation != null){
			sendTranslatedMessage(sender, message, cachedTranslation, recipients);
			return;
		}

		requestTranslate(cleanedMessage, lang).then(result => {
			sendTranslatedMessage(sender, message, result, recipients);
			Core.app.post(() => translationCache.put(cacheKey, result));
		}).catch(() => {
			for (const player of recipients.toArray()) player.sendMessage(formatted);
		});

	});
}

export function setPlayerLanguageEntry(player: Player, language: string){
	removePlayerLanguageEntry(player);

	const bucket = playerLanguageCache.get(
		language,
		() => new Seq<Player>()
	);
	bucket.add(player);
}

function removePlayerLanguageEntry(player: Player){
	playerLanguageCache.each((_, players) => players.remove(player));
}

function sendTranslatedMessage(sender: Player, originalMessage: string, translatedMessage: string, recipients: Seq<Player>){
	const formatted = Vars.netServer.chatFormatter.format(sender, originalMessage)
		+ "\n[lightgray]Translated: " + translatedMessage + "[]";
	for (const player of recipients.toArray()){
		Call.sendMessage(player.con, formatted, originalMessage, sender);
	}
}

export function getLanguageFromCache(code:string):Language {
	const normalizedCode = code.toLowerCase();
	if (normalizedCode == "none" || normalizedCode == "off"){
		return {code: "none", name: "Off"};
	}

	return languageCache.get(normalizedCode) ?? {code: "none", name: "Off"}; //unsupported
}

export function isLanguageAvailable(code:string){
	return getLanguageFromCache(code).code != "none";
}

function fetchLanguageCache() {
	return new Promise<void>((resolve, reject) => {
		const req = Http.get(translationApiUrl + "/api/languages");
		req.error(reject);
		req.submit(t => {
			const parsed = JSON.parse(t.getResultAsString()) as Language[];
			Core.app.post(() => {
				try {
					languageCache.clear();
					for (const language of parsed){
						languageCache.put(language.code.toLowerCase(), language);
					}
					resolve();
				} catch(err){
					reject(err);
				}
			});
		});
	});
}

function requestTranslate(message:string, lang:string){
	return new Promise<string>((resolve, reject) => {
		const req = Http.post(
			translationApiUrl + "/api/translate",
			message
		);
	
		req.header("from", "auto");
		req.header("to", lang);
		req.header("token", translationApiToken.string());
		req.timeout = 2000; //low timeout to not lag chat too much
		req.error(e => {
			Log.err(`Network error in translation request: ${e.response.getResultAsString()}`);
			reject();
		});
		req.submit(t => {
			const result = t.getResultAsString();

			if(t.getStatus().code != 200){
				Log.err(`Network error in translation request: ${t.getStatus().code} ${result}`);
				reject();
			} else {
				resolve(result);
			}
		});
	});
}

