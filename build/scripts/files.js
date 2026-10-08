"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaps = updateMaps;
var config_1 = require("/config");
var funcs_1 = require("/funcs");
var globals_1 = require("/globals");
var promise_1 = require("/promise");
var utils_1 = require("/utils");
function fetchGithubContents() {
    return new promise_1.Promise(function (resolve, reject) {
        var url = config_1.mapRepoURLs[config_1.Gamemode.name()];
        if (!url)
            return reject("No recognized gamemode detected. please enter \"host <map> <gamemode>\" and try again");
        var res = Http.get(url);
        res.timeout = 30000;
        res.error(function (err) { return reject("Network error while fetching github repository contents: " + err); });
        res.submit(function (res) {
            try {
                resolve(JSON.parse(res.getResultAsString()));
            }
            catch (e) {
                reject("Failed to parse GitHub repository contents: ".concat(String(e)));
            }
        });
    });
}
function downloadFile(address, filename) {
    if (!/^https?:\/\//i.test(address)) {
        (0, funcs_1.crash)("Invalid address, please start with 'http://' or 'https://'");
    }
    return new promise_1.Promise(function (resolve, reject) {
        var instream = null;
        var outstream = null;
        Log.info("Downloading ".concat(filename, "..."));
        Http.get(address, function (res) {
            try {
                instream = res.getResultAsStream();
                outstream = new Fi(filename).write();
                instream.transferTo(outstream);
                resolve();
            }
            finally {
                instream === null || instream === void 0 ? void 0 : instream.close();
                outstream === null || outstream === void 0 ? void 0 : outstream.close();
            }
        }, function () {
            Log.err("Download failed.");
            reject("Network error while downloading a map file: ".concat(address));
        });
    });
}
function downloadMaps(githubListing) {
    return promise_1.Promise.all(githubListing.map(function (fileEntry) {
        if (!(typeof fileEntry.download_url == "string")) {
            Log.warn("Map ".concat(fileEntry.name, " has no valid download link, skipped."));
            return promise_1.Promise.resolve(null);
        }
        return downloadFile(fileEntry.download_url, Vars.customMapDirectory.child(fileEntry.name).absolutePath());
    })).then(function (v) { });
}
function updateMaps() {
    return fetchGithubContents().then(function (listing) {
        var mapList = listing
            .filter(function (entry) { return entry.type == 'file'; })
            .filter(function (entry) { return entry.name.endsWith(".msav"); });
        var mapFiles = Vars.customMapDirectory.list();
        var mapsToDelete = mapFiles.filter(function (localFile) {
            return !mapList.some(function (remoteFile) {
                return remoteFile.name === localFile.name();
            })
                && !localFile.name().startsWith("$$");
        });
        mapsToDelete.forEach(function (map) { return map.delete(); });
        var mapsToDownload = mapList
            .filter(function (entry) {
            var file = Vars.customMapDirectory.child(entry.name);
            return !file.exists() || entry.sha !== (0, utils_1.getHash)(file);
        });
        if (mapsToDownload.length == 0) {
            return mapsToDelete.length > 0 ? true : false;
        }
        return downloadMaps(mapsToDownload).then(function () {
            globals_1.fishState.lastSuccessfulMapUpdate = Date.now();
            Vars.maps.reload();
            return true;
        });
    });
}
Timer.schedule(function () {
    updateMaps()
        .then(function (result) {
        if (result) {
            Call.sendMessage("[orange]Maps have been updated. Run [white]/maps[] to view available maps.");
            Log.info("Updated maps.");
        }
    })
        .catch(function (message) {
        if (Date.now() - globals_1.fishState.lastSuccessfulMapUpdate >= funcs_1.Duration.hours(1))
            Call.sendMessage("[scarlet]Automated maps update failed too many times, please report this to a staff member.");
        Log.err("Automated map update failed: ".concat(String(message)));
    });
}, funcs_1.DurationSecs.minutes(1), funcs_1.DurationSecs.minutes(10));
