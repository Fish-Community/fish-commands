"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
var maps_1 = require("./maps");
var funcs_1 = require("/funcs");
/**
 * Object can be played by a server (MMap or Campaign);
 */
var campaignMapNode = /** @class */ (function () {
    function campaignMapNode(filename, require, gamemode, flags) {
        if (gamemode === void 0) { gamemode = "attack"; }
        if (flags === void 0) { flags = ""; }
        this.filename = filename;
        this.require = require;
        this.gamemode = gamemode;
        this.flags = flags;
    }
    campaignMapNode.from = function (obj) {
        var _a, _b, _c, _d;
        if (!obj)
            (0, funcs_1.crash)("campaignMapNode.from: received invalid node: ".concat(obj));
        return new campaignMapNode((_a = obj.filename) !== null && _a !== void 0 ? _a : "unknown", (_b = obj.require) !== null && _b !== void 0 ? _b : [], (_c = obj.gamemode) !== null && _c !== void 0 ? _c : "attack", (_d = obj.flags) !== null && _d !== void 0 ? _d : "");
    };
    return campaignMapNode;
}());
;
var Campaign = /** @class */ (function () {
    function Campaign(name, graph, authorname, displayname, resourcePersistance, unitpersistance, blockpersistance) {
        if (authorname === void 0) { authorname = "unspecified"; }
        if (displayname === void 0) { displayname = name; }
        if (resourcePersistance === void 0) { resourcePersistance = false; }
        if (unitpersistance === void 0) { unitpersistance = "none"; }
        if (blockpersistance === void 0) { blockpersistance = "none"; }
        this.privateName = name;
        this.author = authorname;
        this.graph = graph;
        this.displayName = displayname !== null && displayname !== void 0 ? displayname : name;
        this.resourcePersistance = resourcePersistance;
        this.unitPersistance = unitpersistance;
        this.blockPersistance = blockpersistance;
    }
    //here to overlap MMap to make printing map names SO much better. name = displayname, plainName = campaignName
    Campaign.prototype.name = function () {
        if (this.displayName)
            return (this.displayName);
        else
            return this.privateName;
    };
    Campaign.prototype.plainName = function () {
        return (this.privateName);
    };
    Campaign.from = function (data) {
        var _a;
        var graphNodes = ((_a = data.graph) !== null && _a !== void 0 ? _a : []).map(function (node) { return campaignMapNode.from(node); });
        return new Campaign(data.campaignName, graphNodes, data.campaignAuthor || "unspecified", data.displayName || data.campaignName, data.resourcePersistance || false, data.unitPersistance || "none", data.blockPersistance || "none");
    };
    /**
     * Load all available campaigns
     */
    Campaign.loadAll = function () {
        var _this = this;
        this.Campaigns = [];
        Vars.customMapDirectory.list().filter(function (file) { return file.extEquals("json"); }).forEach(function (file) { return _this.loadFromFi(file); });
    };
    /**
     * Attempt to load specified campaign from filename (ie `erekir.msav`)
     */
    Campaign.loadFromName = function (filename) {
        var file = Vars.customMapDirectory.child(filename);
        return this.loadFromFi(file);
    };
    /**
     * Attempt to load specified campaign from Fi pointing to `campaign.json`
     */
    Campaign.loadFromFi = function (file) {
        if (!file.exists()) {
            Log.err("Error loading campaign: '".concat(file.name(), "' - No JSON found"));
            return;
        }
        var c = Campaign.from(JSON.parse(file.readString()));
        if (!c.graph.every(function (node) { return (Vars.customMapDirectory.findAll().toArray().filter(function (file) { return file.extEquals("msav"); }).find(function (file) { return (file.name() == node.filename); })); })) {
            Log.err("Error loading campaign: '".concat(file.name(), " - Map Dependencies Missing"));
            return;
        }
        Log.info("Loaded Campaign '".concat(file.name(), "!"));
        this.Campaigns.push(c);
        return c;
    };
    Campaign.reset = function () {
        this.state.playing = false;
        this.state.campaign_advertise = false;
        this.state.map = null;
        this.state.campaign = null;
        this.state.startTime = 0;
        this.state.previous = [];
        this.state.res = new Map();
        maps_1.MapAdvertiser.setMapProvider(this.mapProvider);
        maps_1.MapAdvertiser.setCampaignProvider(function () { return []; });
    };
    // these are mainly for me to make event code more easy to read. please don't try to hook up unrelated things to these
    /**
     * Called after a Campaign Wins a Map Voteout or map votes mid-campaign
     */
    Campaign.upNext = function (next) {
        if (!this.state.playing) {
            this.reset();
            this.state.campaign = next;
            this.state.next = this.state.campaign.graph.find(function (node) { return node.flags == "entry"; }) || (0, funcs_1.crash)("Unable to find entry node in Campaign");
            this.state.startTime = -1; // used by event handlers indicate a campaign is up next. kinda sloppy, but I like playable as a boolean, so it will have to do.
        }
        else {
            this.state.next = this.state.campaign.graph.find(function (node) { return node.filename == next.file.name(); }) || (0, funcs_1.crash)("Unable to find next map ".concat(next.plainName()));
        }
    };
    /**
     * Called right before the first map loads
     */
    Campaign.onStart = function () {
        this.state.playing = true;
        this.state.campaign_advertise = true;
        this.onMapOver();
    };
    /**
     * Called right after each map loads
     */
    Campaign.onLoad = function () {
        var _a;
        this.state.current = this.state.next;
        this.state.next = null;
        if (((_a = this.state.current) === null || _a === void 0 ? void 0 : _a.flags) == "exit") {
            maps_1.MapAdvertiser.setMapProvider(maps_1.MapAdvertiser.presets.customMaps);
            maps_1.MapAdvertiser.setCampaignProvider(maps_1.MapAdvertiser.presets.defaultCampaigns);
        }
        else if (maps_1.MapAdvertiser.getMaps().length == 0) {
            Log.warn("Incorrect Campaign Tree Configuration. Map ".concat(this.state.current.filename, " has no children, but it is not marked as a exit node. Please add a \"exit\" flag"));
            maps_1.MapAdvertiser.setMapProvider(maps_1.MapAdvertiser.presets.customMaps);
            maps_1.MapAdvertiser.setCampaignProvider(maps_1.MapAdvertiser.presets.defaultCampaigns);
        }
        else {
            this.upNext(maps_1.MapAdvertiser.getMaps()[0] || (0, funcs_1.crash)("Incorrect campaign configuration. Make sure the last nodes in any sequence end in a \"exit\" flag."));
            //todo - resource load;
        }
    };
    /**
     * Called after players finishes the last map, AFTER onWin/onLose functions
     */
    Campaign.onMapOver = function () {
        var _this = this;
        Vars.maps.setNextMapOverride(Vars.maps.all().find(function (map) { return map.file.name() == _this.state.next.filename; }) || (0, funcs_1.crash)("Unable to find next map msav file."));
        if (this.state.campaign.resourcePersistance && this.state.playing) {
            //TODO - save res
        }
    };
    /**
     * Triggered when the last map finishes up
     */
    Campaign.onFinish = function () {
        // TODO - win message, highscore
        this.reset();
    };
    /**
     * Called every time a player wins a map
     */
    Campaign.onWin = function () {
    };
    /**
     * Called every time a player loses a map
     */
    Campaign.onLose = function () {
        this.state.next = this.state.current;
        // TODO - sad message
    };
    Campaign.Campaigns = [];
    Campaign.mapProvider = function () {
        var validMaps = [];
        if (!Campaign.state.campaign_advertise || !Campaign.state.campaign)
            return validMaps;
        Campaign.state.campaign.graph.filter(function (node) { return ((!Campaign.state.previous.find(function (previous_map) { return previous_map == node.filename; }))) && (node.flags == "entry" || node.require.every(function (requirement) { return Campaign.state.campaign.graph.find(function (previous) { return previous.filename == requirement; }); })); }).forEach(function (mapnode) { if (Vars.maps.all().find(function (map) { return map.file.name() == mapnode.filename; })) {
            validMaps.push(Vars.maps.all().find(function (map) { return map.file.name() == mapnode.filename; }));
        } });
        return validMaps;
    };
    Campaign.state = {
        playing: false,
        /**
         * If campaign is restricting available maps in `MapAdvertiser` or not
         */
        campaign_advertise: false,
        startTime: 0,
        campaign: null,
        map: null,
        previous: [],
        res: new Map(),
        current: null,
        next: null,
    };
    return Campaign;
}());
exports.Campaign = Campaign;
Events.on(EventType.LoseEvent, function () {
    if (Campaign.state.playing) {
        Campaign.onLose();
        Campaign.onMapOver();
    }
});
Events.on(EventType.WinEvent, function () {
    if (Campaign.state.playing) {
        Campaign.onWin();
        Campaign.onMapOver();
    }
});
Events.on(EventType.WorldLoadEndEvent, function () {
    if (Campaign.state.playing) {
        Campaign.onLoad();
        if (Campaign.state.current.flags == "exit") {
            Campaign.onFinish();
        }
    }
});
