/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains wrappers over the API calls to the backend server.
*/

import { backendIP, Gamemode, Mode } from "/config";
import { FishPlayer } from "/players";
import { Promise } from "/promise";
import type { FishPlayerData, UploadedFishPlayerData } from "/types";


const cachedIps:Record<string, boolean | undefined> = {};
/** Make an API request to see if an IP is likely VPN. */
export function isVpn(ip:string, callback: (isVpn:boolean) => unknown, callbackError?: (errorMessage:Throwable) => unknown){
	if(ip in cachedIps) return callback(cachedIps[ip]!);
	Http.get(`http://ip-api.com/json/${ip}?fields=proxy,hosting`, (res) => {
		const data = res.getResultAsString();
		const json = JSON.parse(data) as {
			proxy: boolean;
			hosting: boolean;
		};
		const isVpn = json.proxy || json.hosting;
		cachedIps[ip] = isVpn;
		FishPlayer.stats.numIpsChecked ++;
		if(isVpn) FishPlayer.stats.numIpsFlagged ++;
		callback(isVpn);
	}, callbackError ?? ((err) => {
		Log.err(`[API] Network error when trying to call api.isVpn()`);
		FishPlayer.stats.numIpsErrored ++;
		callback(false);
	}));
}

/** Send text to the moderation logs channel in Discord. */
export function sendModerationMessage(message: string) {
	if(Mode.noBackend){
		Log.info(`Sent moderation log message: ${message}`);
		return;
	}
	const req = Http.post(`http://${backendIP}/api/mod-dump`, JSON.stringify({ message })).header('Content-Type', 'application/json').header('Accept', '*/*');
	req.timeout = 10000;

	req.error(() => Log.err(`[API] Network error when trying to call api.sendModerationMessage()`));
	req.submit((response) => {
		//Log.info(response.getResultAsString());
	});
}

/** Get staff messages from discord. */
export function getStaffMessages(callback: (messages: string) => unknown) {
	if(Mode.noBackend) return;
	const req = Http.post(`http://${backendIP}/api/getStaffMessages`, JSON.stringify({ server: Gamemode.name() }))
		.header('Content-Type', 'application/json').header('Accept', '*/*');
	req.timeout = 10000;
	req.error(() => Log.err(`[API] Network error when trying to call api.getStaffMessages()`));
	req.submit((response) => {
		const temp = response.getResultAsString();
		if(!temp.length) Log.err(`[API] Network error(empty response) when trying to call api.getStaffMessages()`);
		else callback(JSON.parse(temp).messages);
	});
}

/** Send staff messages from server. */
export function sendStaffMessage(message:string, playerName:string, callback?: (sent:boolean) => unknown){
	if(Mode.noBackend) return;
	const req = Http.post(
		`http://${backendIP}/api/sendStaffMessage`,
		// need to send both name variants so one can be sent to the other servers with color and discord can use the clean one
		JSON.stringify({ message, playerName, cleanedName: Strings.stripColors(playerName), server: Gamemode.name() })
	).header('Content-Type', 'application/json').header('Accept', '*/*');
	req.timeout = 10000;
	req.error(() => {
		Log.err(`[API] Network error when trying to call api.sendStaffMessage()`);
		callback?.(false);
	});
	req.submit((response) => {
		const temp = response.getResultAsString();
		if(!temp.length) Log.err(`[API] Network error(empty response) when trying to call api.sendStaffMessage()`);
		else callback?.(JSON.parse(temp).data);
	});
}

/** Bans the provided ip and/or uuid. */
export function ban(data:{ip?:string; uuid?:string;}, callback:(status:string) => unknown = () => {}){
	if(Mode.noBackend) return;
	const req = Http.post(`http://${backendIP}/api/ban`, JSON.stringify(data))
		.header('Content-Type', 'application/json')
		.header('Accept', '*/*');
	req.timeout = 10000;
	req.error(() => Log.err(`[API] Network error when trying to call api.ban(${data.ip}, ${data.uuid})`));
	req.submit((response) => {
		const str = response.getResultAsString();
		if(!str.length) return Log.err(`[API] Network error(empty response) when trying to call api.ban()`);
		callback(JSON.parse(str).data);
	});
}

/** Unbans the provided ip and/or uuid. */
export function unban(data:{ip?:string; uuid?:string;}, callback:(status:string, error?:string) => unknown = () => {}){
	if(Mode.noBackend) return;
	const req = Http.post(`http://${backendIP}/api/unban`, JSON.stringify(data))
		.header('Content-Type', 'application/json')
		.header('Accept', '*/*');
	req.timeout = 10000;
	req.error(() => Log.err(`[API] Network error when trying to call api.ban({${data.ip}, ${data.uuid}})`));
	req.submit((response) => {
		const str = response.getResultAsString();
		if(!str.length) return Log.err(`[API] Network error(empty response) when trying to call api.unban()`);
		const parsedData = JSON.parse(str);
		callback(parsedData.status, parsedData.error);
	});
}

/** Gets if either the provided uuid or ip is banned. */
export function getBanned(data:{uuid?:string, ip?:string}, callback:(banned:boolean) => unknown){
	if(Mode.noBackend){
		Log.info(`[API] Attempted to getBanned(${data.uuid}/${data.ip}), assuming false due to local debug`);
		callback(false);
		return;
	}
	//TODO cache 4s
	const req = Http.post(`http://${backendIP}/api/checkIsBanned`, JSON.stringify(data))
		.header('Content-Type', 'application/json')
		.header('Accept', '*/*');
	req.timeout = 10000;
	req.error(() => Log.err(`[API] Network error when trying to call api.getBanned()`));
	req.submit((response) => {
		const str = response.getResultAsString();
		if(!str.length) return Log.err(`[API] Network error(empty response) when trying to call api.getBanned()`);
		callback(JSON.parse(str).data);
	});
}

/**
 * Fetches fish player data from the backend.
 **/
export function getFishPlayerData(uuid:string){
	const { promise, resolve, reject } = Promise.withResolvers<FishPlayerData | null, unknown>();
	function fail(err:string){
		Log.err(`[API] Network error when trying to call api.getFishPlayerData()`);
		if(err) Log.err(err);
		reject(err);
	}

	if(Mode.noBackend){
		reject("local debug mode");
		return promise;
	}

	const req = Http.post(`http://${backendIP}/api/fish-player`, JSON.stringify({
		id: uuid,
		gamemode: Gamemode.name(),
	}))
		.header('Content-Type', 'application/json')
		.header('Accept', '*/*');
	req.timeout = 10000;
	req.error(fail);
	req.submit((response) => {
		const data = response.getResultAsString();
		if(data){
			const result = JSON.parse(data);
			if(!result || typeof result != "object") fail(`Invalid fish player data`);
			resolve(result);
		} else {
			resolve(null);
		}
	});
	return promise;
}

/** Pushes fish player data to the backend. */
export function setFishPlayerData(data: UploadedFishPlayerData, repeats = 1, ignoreActivelySyncedFields = false) {
	const { promise, resolve, reject } = Promise.withResolvers<void, unknown>();
	if(Mode.noBackend){
		resolve();
		return promise;
	}
	const req = Http.post(`http://${backendIP}/api/fish-player/set`, JSON.stringify({
		player: data,
		gamemode: Gamemode.name(),
		ignoreActivelySyncedFields,
	}))
		.header('Content-Type', 'application/json')
		.header('Accept', '*/*');
	req.timeout = 10000;
	req.error((err) => {
		Log.err(`[API] Network error when trying to call api.setFishPlayerData(), repeats=${repeats}`);
		Log.err(err);
		if(err?.response) Log.err(err.response.getResultAsString());
		if(repeats > 0 && !(err.status?.code >= 400 && err.status?.code <= 499))
			setFishPlayerData(data, repeats - 1, ignoreActivelySyncedFields).then(resolve).catch(reject);
		else reject(err);
	});
	req.submit((response) => {
		resolve();
	});
	return promise;
}

