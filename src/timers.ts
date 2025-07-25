/*
Copyright © BalaM314, 2025. All Rights Reserved.
This file contains timers that run code at regular intervals.
*/

import { getStaffMessages } from '/api';
import * as config from "/config";
import { Gamemode } from "/config";
import { updateMaps } from '/files';
import { FishEvents, ipJoins } from "/globals";
import { FishPlayer } from "/players";
import { definitelyRealMemoryCorruption, neutralGameover } from "/utils";


/** Must be called once, and only once, on server start. */
export function initializeTimers(){
	Timer.schedule(() => {
		//Autosave
		const file = Vars.saveDirectory.child('1' + '.' + Vars.saveExtension);
		Core.app.post(() => {
			SaveIO.save(file);
			FishPlayer.saveAll();
			Call.sendMessage('[#4fff8f9f]Game saved.');
			FishEvents.fire("saveData", []);
		});
		//Unblacklist trusted players
		for(const fishP of Object.values(FishPlayer.cachedPlayers)){
			if(fishP.ranksAtLeast("trusted")){
				Vars.netServer.admins.dosBlacklist.remove(fishP.info().lastIP);
			}
		}
	}, 10, 300);
	//Memory corruption prank
	Timer.schedule(() => {
		if(Math.random() < 0.2 && !Gamemode.hexed()){
			//Timer triggers every 17 hours, and the random chance is 20%, so the average interval between pranks is 85 hours
			definitelyRealMemoryCorruption();
		}
	}, 3600, 61200);
	//Trails
	Timer.schedule(() =>
		FishPlayer.forEachPlayer(p => p.displayTrail()),
	5, 0.15);
	//Staff chat
	if(!config.Mode.localDebug)
		Timer.schedule(() => {
			getStaffMessages((messages) => {
				if(messages.length) FishPlayer.messageStaff(messages);
			})
		}, 5, 2);
	//Tip
	Timer.schedule(() => {
		const showAd = Math.random() < 0.10; //10% chance every 15 minutes
		let messagePool = showAd ? config.tips.ads : (config.Mode.isChristmas && Math.random() > 0.5) ? config.tips.christmas : config.tips.normal;
		const messageText = messagePool[Math.floor(Math.random() * messagePool.length)];
		const message = showAd ? `[gold]${messageText}[]` : `[gold]Tip: ${messageText}[]`
		Call.sendMessage(message);
	}, 60, 15 * 60);
	//State check
	Timer.schedule(() => {
		if(Groups.unit.size() > 10000){
			Call.sendMessage(`\n[scarlet]!!!!!\n[scarlet]Way too many units! Game over!\n[scarlet]!!!!!\n`);
			Groups.unit.clear();
			neutralGameover();
		}
	}, 0, 1);
	Timer.schedule(() => {
		FishPlayer.updateAFKCheck();
	}, 0, 1);
	//Various bad antibot code TODO fix, dont update state on clock tick
	Timer.schedule(() => {
		FishPlayer.antiBotModePersist = false;
		//dubious code, will keep antibot mode on for the next minute after it was triggered by high flag count or high join count
		if(FishPlayer.flagCount > 10 || FishPlayer.playersJoinedRecent > 50) FishPlayer.antiBotModePersist = true;
		FishPlayer.flagCount = 0;
		ipJoins.clear();
	}, 0, 60);
	Timer.schedule(() => {
		if(FishPlayer.playersJoinedRecent > 50) FishPlayer.antiBotModePersist = true;
		FishPlayer.playersJoinedRecent = 0;
	}, 0, 40);
	Timer.schedule(() => {
		if(FishPlayer.antiBotMode()){
			Call.infoToast(`[scarlet]ANTIBOT ACTIVE!!![] DOS blacklist size: ${Vars.netServer.admins.dosBlacklist.size}`, 2);
		}
	}, 0, 1);
	Timer.schedule(() => {
		FishPlayer.validateVotekickSession();
	}, 0, 0.5);
}
Timer.schedule(() => {
	updateMaps()
		.then((result) => {
			if(result){
				Call.sendMessage(`[orange]Maps have been updated. Run [white]/maps[] to view available maps.`);
				Log.info(`Updated maps.`);
			}
		})
		.catch((message) => {
			Call.sendMessage(`[scarlet]Automated maps update failed, please report this to a staff member.`);
			Log.err(`Automated map update failed: ${message}`);
		});
}, 60, 600)