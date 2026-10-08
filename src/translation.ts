/*
Copyright © BalaM314, 2026. All Rights Reserved.
mostly written by @author TheRadioactiveBanana
This file contains a translation client implementation for https://github.com/TheRadioactiveBanana/translate-api-wrapper
*/

import { translationApiToken, translationApiUrl } from "/config";
import { escapeStringColorsServer } from "/funcs";
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

Events.on(EventType.ServerLoadEvent, () => {
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
});

const disabledLanguages = ["off", "none", "auto"];

export async function handleMessage(sender: Player, message: string) {
	Call.sendMessage(sender.con, Vars.netServer.chatFormatter.format(sender, message), message, sender);
	//return to sender immediately, they don't need to see their own translation
	
	const cleanedMessage = Strings.stripGlyphs(Strings.stripColors(removeFoosChars(message)));
	const formatted = Vars.netServer.chatFormatter.format(sender, message);

	if(languageCache.isEmpty()){
		if(Date.now() - lastFailure > 60_000){
			try {
				await fetchLanguageCache();
			} catch(err){
				Log.err("Network error while fetching language cache");
				lastFailure = Date.now();
			}
		}
		sendNoTranslations(sender, message, formatted, null);
		return;
	}

	const languagesToFetch:string[] = [];
	playerLanguageCache.each((lang, players) => {
		if(!disabledLanguages.includes(lang) &&
			players.contains(boolf<Player>(p => p != sender && p.con.isConnected())) &&
			!translationCache.containsKey(`${lang}\n${cleanedMessage}`))
		{
			languagesToFetch.push(lang);
		}
	});
	sendCachedTranslations(sender, message, cleanedMessage, formatted, languagesToFetch);
	sendNoTranslations(sender, message, formatted, disabledLanguages);
	if(languagesToFetch.length){
		try {
			const result = await requestTranslate(cleanedMessage, languagesToFetch);
			sendTranslatedMessages(sender, cleanedMessage, message, formatted, result);
			for(const [lang, msg] of Object.entries(result)){
				translationCache.put(`${lang}\n${cleanedMessage}`, msg);
			}
		} catch {
			sendNoTranslations(sender, message, formatted, languagesToFetch);
		}
	}
}

function sendCachedTranslations(sender:Player, message:string, cleanedMessage:string, formatted:string, languagesToFetch:string[]){
	FishPlayer.forEachPlayer(p => {
		if(p.player != sender && !languagesToFetch.includes(p.language)){
			//Not added to the fetch list, this means it must be cached
			const cachedTranslation = translationCache.get(`${p.language}\n${cleanedMessage}`);
			if(cachedTranslation != null){
				Call.sendMessage(p.con(), formatted, message, sender);
				sendTranslatedMessage(cleanedMessage, cachedTranslation, p.player);
			}
		}
	});
}

function sendNoTranslations(sender:Player, message:string, formatted:string, languagesToFetch:string[] | null){
	FishPlayer.forEachPlayer(p => {
		if(p.player != sender && (languagesToFetch == null || languagesToFetch.includes(p.language))){
			//Wanted to fetch the translation but that failed
			//Just send the untranslated message
			Call.sendMessage(p.con(), formatted, message, sender);
		}
	});
}

function sendTranslatedMessages(sender:Player, cleanedMessage:string, message:string, formatted:string, translated:Record<string, string>){
	FishPlayer.forEachPlayer(p => {
		const translatedMessage = translated[p.language];
		if(p.player != sender && translated[p.language]){
			Call.sendMessage(p.con(), formatted, message, sender);
			sendTranslatedMessage(cleanedMessage, translatedMessage, p.player);
		}
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

const NonAlpha = Pattern.compile("[^\\p{IsAlphabetic}0-9_]");
function stripNonWordChars(string:string):string {
	return NonAlpha.matcher(string).replaceAll("");
}

function sendTranslatedMessage(cleanedMessage: string, translatedMessage: string, player: Player){
	if(stripNonWordChars(translatedMessage.toLowerCase()) != stripNonWordChars(cleanedMessage.toLowerCase())){
		Call.sendMessage(player.con, "[lightgray]Translated: " + translatedMessage + "[]", translatedMessage, null);
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
						if(language.code == "auto") continue;
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

function requestTranslate<Lang extends string>(message:string, languages:Lang[]){
	return new Promise<Record<Lang, string>>((resolve, reject) => {
		const req = Http.post(
			translationApiUrl + "/api/translate/batch",
			message
		);
	
		req.header("languages", languages.join(","));
		req.header("token", translationApiToken.string());
		req.timeout = 3500; //low timeout to not lag chat too much
		req.error(e => {
			Log.err(`Network error in translation request: ${"response" in e ? e.response.getResultAsString() : e}`);
			reject();
		});
		req.submit(t => {
			const result = t.getResultAsString();

			if(t.getStatus().code != 200){
				Log.err(`Network error in translation request: ${t.getStatus().code} ${result}`);
				reject();
			} else {
				try {
					const { refusal, ...languages } = JSON.parse(result) as Record<string, unknown>;
					if(refusal) reject();
					resolve(languages as Record<string, string>);
				} catch {
					Log.err(`Network error in translation request: Invalid json received: ${result}`);
					reject();
				}
			}
		});
	});
}

Vars.net.handleServer(SendChatMessageCallPacket, ({player}, {message}) => {
	if(!player?.isAdded() || message == null) return;
	if(message.length > Vars.maxTextLength){
		player.sendMessage(`[scarlet]Message too long. Maximum length is ${Vars.maxTextLength} characters.`);
		return;
	}

	message = message.replace("\n", "");
	Events.fire(new EventType.PlayerChatEvent(player, message));
	Log.info(`&fi&lc${escapeStringColorsServer(player.plainName())}: &lw${escapeStringColorsServer(removeFoosChars(message))}&fr`);

	const response = Vars.netServer.clientCommands.handleMessage(message, player);
	if(response.type == CommandHandler.ResponseType.noCommand){
		const filtered = Vars.netServer.admins.filterMessage(player, message);
		if(filtered != null) void handleMessage(player, filtered);
	} else if(response.type != CommandHandler.ResponseType.valid){
		const text = Vars.netServer.invalidHandler.handle(player, response);
		if(text != null) player.sendMessage(text);
	}
});

