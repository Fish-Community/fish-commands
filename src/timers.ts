/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains timers that run code at regular intervals.
*/

import { fetchAntibotData, getStaffMessages, syncDosBlacklist } from "/api";
import * as config from "/config";
import { Gamemode } from "/config";
import { updateMaps } from "/files";
import { Duration, DurationSecs } from "/funcs";
import { dosBlacklistCopy, FishEvents, fishState } from "/globals";
import { FishPlayer } from "/players";
import { definitelyRealMemoryCorruption, neutralGameover, unblacklist } from "/utils";


/** Must be called once, and only once, on server start. */
export function initializeTimers(){
	Timer.schedule(() => {
		Time.mark();
		//Autosave
		const file = Vars.saveDirectory.child('1' + '.' + Vars.saveExtension);
		Core.app.post(() => {
			Time.mark();
			Time.mark();
			Time.mark();
			SaveIO.save(file);
			Log.debug("SaveIO @", Time.elapsed());
			FishPlayer.saveAll();
			FishPlayer.uploadAll();
			Log.debug("Save/upload @", Time.elapsed());
			Call.sendMessage('[#4fff8f9f]Game saved.');
			FishEvents.fire("saveData", []);
			Log.debug("autosave on main thread @", Time.elapsed());
		});
		//Unblacklist trusted players
		for(const fishP of Object.values(FishPlayer.cachedPlayers)){
			if(fishP.ranksAtLeast("trusted")){
				unblacklist(fishP.info().lastIP);
			}
		}
		Log.debug("autosave @", Time.elapsed());
	}, 10, DurationSecs.minutes(5));
	//Memory corruption prank
	Timer.schedule(() => {
		if(Math.random() < 0.2 && !Gamemode.hexed()){
			//Timer triggers every 17 hours, and the random chance is 20%, so the average interval between pranks is 85 hours
			definitelyRealMemoryCorruption();
		}
	}, DurationSecs.hours(1), DurationSecs.hours(17));
	//Staff chat
	if(!config.Mode.noBackend)
		Timer.schedule(() => {
			getStaffMessages((messages) => {
				if(messages.length) FishPlayer.messageStaff(messages);
			});
			fetchAntibotData().then(m => {
				if(fishState.antibotData.nameBlacklist?.[0] != m.nameBlacklistRegex){
					fishState.antibotData.nameBlacklist = m.nameBlacklistRegex == null ? null : [m.nameBlacklistRegex, Pattern.compile(m.nameBlacklistRegex)];
				}
				if(fishState.antibotData.nameGraylist?.[0] != m.nameGraylistRegex){
					fishState.antibotData.nameGraylist = m.nameGraylistRegex == null ? null : [m.nameGraylistRegex, Pattern.compile(m.nameGraylistRegex)];
				}
			}).catch(() => {});
			const { dosBlacklist } = Vars.netServer.admins;
			const newIPs:string[] = [];
			if(dosBlacklistCopy.size != dosBlacklist.size){
				//Find new IPs
				dosBlacklist.each(ip => dosBlacklistCopy.add(ip) && newIPs.push(ip));
			}
			syncDosBlacklist(newIPs).then(ips => {
				if(ips.length != dosBlacklist.size){
					//this is technically wrong as the returned data could lose x and gain x ips at once
					//close enough
					dosBlacklist.clear();
					dosBlacklistCopy.clear();
					dosBlacklist.addAll(ips);
					dosBlacklistCopy.addAll(ips);
				}
			}).catch(() => {});
		}, 5, 2);
	//Tip
	Timer.schedule(() => {
		const showAd = Math.random() < 0.10; //10% chance every 15 minutes
		const messagePool =
			showAd ? config.tips.ads :
			(config.Mode.isChristmas && Math.random() > 0.5) ? config.tips.christmas :
			config.tips.normal;
		const messageText = messagePool[Math.floor(Math.random() * messagePool.length)];
		const message = showAd ? `[gold]${messageText}[]` : `[gold]Tip: ${messageText}[]`;
		Call.sendMessage(message);
	}, 60, DurationSecs.minutes(15));
	//State check
	Timer.schedule(() => {
		if(Groups.unit.size() > 10000){
			Call.sendMessage(`\n[scarlet]!!!!!\n[scarlet]Way too many units! Game over!\n[scarlet]!!!!!\n`);
			Groups.unit.clear();
			neutralGameover();
		}
	}, 0, 1);
	//deliberately updating state on clock tick:
	//avoids memory leak and other complications from Record<ip, IndexedRatekeeper>
	Events.run(Trigger.update, () => {
		const speed = Vars.state.map.tags.getFloat("backgroundOffsetXSpeed");
		if(speed != 0){
			Vars.state.rules.backgroundOffsetX += speed;
			Call.setRule("backgroundOffsetX", String(Vars.state.rules.backgroundOffsetX));
		}
	});
	Timer.schedule(() => {
		Vars.dataDirectory.child('geolocation-data').child(`${Date.now()}.json`).writeString(JSON.stringify(fishState.geolocationData));
	}, 10, 1200);
	
	if(Gamemode.name() == "pvp") Timer.schedule(() => {
		if(Vars.state.isPaused() && Vars.state.tick > 60 * 60 * 6){
			if(!Groups.player.isEmpty()){
				Vars.state.teams.updateTeamStats();
				//More than 6 minutes, paused with players online
				Vars.state.teams.getActive().each(t => t.players.isEmpty(), t => {
					const timer = --fishState.autoloseCountdown[t.team.id];
					if(timer <= 0){
						t.cores.copy().each(c => c.kill());
					} else {
						Call.sendMessage(`Team ${t.team.coloredName()} will lose automatically in ${timer * 2} seconds`);
					}
				});
			}
		} else {
			fishState.autoloseCountdown.fill(10);
		}
	}, 20, 2);
}

