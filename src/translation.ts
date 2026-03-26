/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains a translation client implementation for https://github.com/TheRadioactiveBanana/translate-api-wrapper
*/

import * as api from "/api";
import {translationApiToken, translationApiUrl} from "/config";
import {FishPlayer} from "/players";
import {Language} from "/types";
import {removeFoosChars} from "/utils";


export const languageCache:ObjectSet<Language> = new ObjectSet<Language>();

export const playerLanguageCache: ObjectMap<Language, Seq<Player>> = new ObjectMap<Language, Seq<Player>>();

export const translationCache: ObjectMap<string, string> = new ObjectMap<string, string>();

export function initializeTranslation(){
	setLanguageCache(false);

	Events.on(EventType.PlayerJoin, t=>{
		const fishPlayer = FishPlayer.get(t.player);
		const language = fishPlayer.language
			? getLanguageFromCache(fishPlayer.language)
			: getLanguageFromCache(t.player.locale);
		if(fishPlayer.language != language.code){
			fishPlayer.language = language.code;
			void api.setFishPlayerData(fishPlayer.getData(), 1, true);
		}

		if (languageCache.isEmpty()){
			//shouldn't ever happen, but by chance it does
			setLanguageCache(true);
		}

		setPlayerLanguageEntry(t.player, language);
	});

	Events.on(EventType.PlayerLeave, t=>{
		removePlayerLanguageEntry(t.player);
	});
}

export function messageHandoff(sender: Player, message: string) {
	if (languageCache.isEmpty()){
		//shouldn't ever happen, but by chance it does
		setLanguageCache(true);
	}

	sender.sendMessage(Vars.netServer.chatFormatter.format(sender, message)); //return to sender immediately, they don't need to see their own translation

	const cleanedMessage = Strings.stripGlyphs(Strings.stripColors(removeFoosChars(message)));
	const delivered = new ObjectSet<string>();

	playerLanguageCache.each((k: Language, v: Seq<Player>)=>{
		const formatted = Vars.netServer.chatFormatter.format(sender, message);
		const recipients = uniqueRecipients(v, sender, delivered);

		if(recipients.size === 0) return;

		if (k == null || k.code === "off" || k.code === "auto" || k.code === "none") {
			for (const player of recipients.toArray()) player.sendMessage(formatted); //ignore, send it as if nothing changed

			return;
		}

		const cacheKey = `${(k.code)}\n${cleanedMessage}`;

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

		Log.info(k.code);

		req.header("to", k.code);
		req.header("token", translationApiToken.string());

		req.timeout = 2000; //low timeout to not lag chat too much

		req.error(e=>{
			for (const player of recipients.toArray()) player.sendMessage(formatted); //failed, send it as if nothing changed

			Log.err(e.getMessage());

			if (!e.response) return;

			Log.err(e.response.getResultAsString());
		});

		req.submit((t: HttpResponse) =>{
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
	playerLanguageCache.each((_, players: Seq<Player>)=>{
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
	const formatted:string = Vars.netServer.chatFormatter.format(sender, originalMessage) + "\n[lightgray]Translated: " + translatedMessage + "[]";
	for (const player of recipients.toArray()){
		Call.sendMessage(player.con, formatted, originalMessage, sender);
	}
}

export function getLanguageFromCache(code:string): Language {
	if (languageCache.isEmpty()){
		setLanguageCache(true);
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

function setLanguageCache(block: boolean) {
	const req = Http.get(translationApiUrl + "/api/languages");

	req.error(e=>{
		Log.err("Could not reload translation API languages");
		Log.err(e);
	});

	const cons = (t: HttpResponse)=>{
		const parsed: [{code:string, name:string}] = JSON.parse(t.getResultAsString());

		Core.app.post(()=>{
			for (const item of parsed) languageCache.add({name: item.name, code: item.code});
		});
	};

	if (block) req.block(cons);
	else req.submit(cons); //faster startup
}
