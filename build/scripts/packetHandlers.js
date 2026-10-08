"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
exports.loadPacketHandlers = loadPacketHandlers;
exports.bulkInfoMsg = bulkInfoMsg;
var commands_1 = require("/frameworks/commands");
var players_1 = require("/players");
var MIN_EFFECT_TPS = 20;
var MAX_LABEL_TIME = 20;
var lastLabel = '';
var lastAccessedBulkLabel = null;
var lastAccessedLabel = null;
var lastAccessedBulkLine = null;
var lastAccessedLine = null;
var bulkLimit = 1000;
var noPermissionText = "[red]You don't have permission to use this packet.";
var invalidContentText = '[red]Invalid label content.';
var tooLongText = '[red]Bulk content length exceeded, please use fewer effects.';
var bulkSeparator = '|';
var procError = '[red]An error occured while processing your request.';
var invalidReq = '[red]Invalid request. Please consult the documentation.';
var lowTPSError = '[red]Low server TPS, skipping request.';
var tmpLinePacket = new EffectCallPacket2();
var tmpLabelPacket = new LabelReliableCallPacket();
function loadPacketHandlers() {
    tmpLinePacket.effect = Fx.pointBeam;
    tmpLinePacket.rotation = 0.0;
    tmpLinePacket.color = Tmp.c1;
    tmpLinePacket.data = Tmp.v1;
    Vars.netServer.addPacketHandler('label', function (player, content) {
        var p = players_1.FishPlayer.get(player);
        try {
            if (Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS) {
                p.sendMessage(lowTPSError, 1000);
                return;
            }
            if (!p.hasPerm("visualEffects")) {
                p.sendMessage(noPermissionText, 1000);
                return;
            }
            lastAccessedLabel = p;
            handleLabel(player, content, true);
        }
        catch (_a) {
            p.sendMessage(procError, 1000);
        }
    });
    Vars.netServer.addPacketHandler('bulkLabel', function (player, content) {
        var p = players_1.FishPlayer.get(player);
        try {
            if (Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS) {
                p.sendMessage(lowTPSError, 1000);
                return;
            }
            if (!p.hasPerm('bulkVisualEffects')) {
                p.sendMessage(noPermissionText, 1000);
                return;
            }
            lastAccessedBulkLabel = p;
            var labels = [];
            var inQuotes = false;
            var startIdx = 0;
            for (var i = 0; i < content.length; i++) {
                switch (content[i]) {
                    case '"':
                        if (i > 0 && content[i - 1] == '\\')
                            break;
                        inQuotes = !inQuotes;
                        break;
                    case bulkSeparator:
                        if (inQuotes)
                            break;
                        labels.push(content.substring(startIdx, i));
                        startIdx = i + 1;
                        break;
                    default:
                        break;
                }
            }
            if (startIdx < content.length) {
                labels.push(content.substring(startIdx, content.length - 1));
            }
            if (labels.length > bulkLimit) {
                p.sendMessage(tooLongText, 1000);
                return;
            }
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (label.trim().length <= 0)
                    continue;
                if (!handleLabel(player, label, false))
                    return;
            }
        }
        catch (_a) {
            p.sendMessage(procError, 1000);
        }
    });
    Vars.netServer.addPacketHandler('lineEffect', function (player, content) {
        var p = players_1.FishPlayer.get(player);
        try {
            if (Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS) {
                p.sendMessage(lowTPSError, 1000);
                return;
            }
            if (!p.hasPerm("visualEffects")) {
                p.sendMessage(noPermissionText, 1000);
                return;
            }
            if (!handleLine(content, player))
                return;
            lastAccessedLine = p;
        }
        catch (_a) {
            p.sendMessage(procError, 1000);
        }
    });
    Vars.netServer.addPacketHandler('bulkLineEffect', function (player, content) {
        var p = players_1.FishPlayer.get(player);
        if (Core.graphics.getFramesPerSecond() < MIN_EFFECT_TPS) {
            p.sendMessage(lowTPSError, 1000);
            return;
        }
        if (!p.hasPerm('bulkVisualEffects')) {
            p.sendMessage(noPermissionText, 1000);
            return;
        }
        try {
            var lines = content.split(bulkSeparator);
            if (lines.length > bulkLimit) {
                p.sendMessage(tooLongText, 1000);
                return;
            }
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.trim().length <= 0)
                    continue;
                if (!handleLine(line, player))
                    return;
            }
            lastAccessedBulkLine = p;
        }
        catch (_a) {
            p.sendMessage(procError, 1000);
        }
    });
}
exports.commands = (0, commands_1.commandList)({
    pklast: {
        args: [],
        description: 'Tells you who last accessed the packet handlers.',
        perm: commands_1.Perm.none,
        handler: function (_a) {
            var output = _a.output;
            var outputLines = [];
            if (lastAccessedLabel && lastLabel) {
                outputLines.push("".concat(lastAccessedLabel.name, "[white] created label \"").concat(lastLabel, "\"."));
            }
            if (lastAccessedBulkLabel) {
                outputLines.push("".concat(lastAccessedBulkLabel.name, "[white] last used the bulk label effect."));
            }
            if (lastAccessedLine) {
                outputLines.push("".concat(lastAccessedLine.name, "[white] last used the line effect."));
            }
            if (lastAccessedBulkLine) {
                outputLines.push("".concat(lastAccessedBulkLine.name, "[white] last used the bulk line effect."));
            }
            output(outputLines.length > 0 ? outputLines.join('\n') : 'No packet handlers have been accessed yet.');
        }
    },
    pkdocs: {
        description: 'Packet handler documentation.',
        args: [],
        perm: commands_1.Perm.none,
        handler: function (_a) {
            var sender = _a.sender, output = _a.output;
            output("\t\t\t\t[blue]FISH[white] Packet Handler Docs\n[white]Usage:[accent]\n\t- Run the javascript function \"Call.serverPacketReliable()\" to send these. (!js in foos)\n\t- You need to multiply world coordinates by Vars.tilesize (8) for things to work properly. This is a relic from the v3 days where every tile was 8 pixels.\n\n[white]Packet types[accent]:\n\t- Line effect: \"lineEffect\", \"x0,y0,x1,y1,hexColor\" (for example \"20.7,19.3,50.4,28.9,#FF0000\")\n\t- Bulk line effect: \"bulkLineEffect\", equivalent to multiple lineEffect packets, with every line separated by a '|' symbol.\n\t- Label effect: \"label\", \"content,duration,x,y\" (for example \"\"Hi!\",10,20,28\")\n\t- Bulk label effect: \"bulkLabel\", equivalent to multiple label packets, with every label separated by a '|' symbol.\n\n[white]Limitations[accent]:\n\t- You ".concat((sender.hasPerm('bulkVisualEffects') ? ("[green]have been granted[accent]") : ("[red]do not have[accent]")), " access to bulk effects.\n\t- Effects will no longer be drawn at ").concat(MIN_EFFECT_TPS, " for server preformance.\n\t- Labels cannot last longer than ").concat(MAX_LABEL_TIME, " seconds.\n\t- There is a set ratelimit for sending packets, be careful ...\n\n[white]Starter Example[accent]:\n\n\tTo place a label saying \"hello\" at (0,0);\n\tFoos users: [lightgray]!js Call.serverPacketReliable(\"label\", [\"\\\"hello\\\"\", 10, 0, 0].join(\",\"))[accent]\n\tnewConsole users: [lightgrey]Call.serverPacketReliable(\"label\", [\"hello\", 10, 0, 10].join(\",\"))[accent]\n\n[white]Comments and Credits[accent]:\n\t- 'These packet handlers and everything related to them were made by [green]frog[accent].\n\t- 'The code style when submitted was beyond drunk... but it worked... barely' -BalaM314\n\t- \"worst error handling i have ever seen, why kick the player???\" -ASimpleBeginner'\n\t- Most of the code was rewritten in 2024 by [#6e00fb]D[#9e15de]a[#cd29c2]r[#fd3ea5]t[accent].'\n\t- Small tweaks by [#00cf]s[#00bf]w[#009f]a[#007f]m[#005f]p[accent]"));
        }
    }
});
function findEndQuote(content, startPos) {
    if (content[startPos] != '"') {
        return -1;
    }
    for (var i = startPos + 1; i < content.length; i++) {
        if (content[i] == '"' && (i < 1 || content[i - 1] != '\\')) {
            return i;
        }
    }
    return -1;
}
function handleLabel(player, content, isSingle) {
    var endPos = findEndQuote(content, 0);
    if (endPos == -1) {
        player.sendMessage(invalidContentText);
        return false;
    }
    var message = content.substring(1, endPos).replace('\\"', '"');
    var parts = content.substring(endPos + 2).split(',');
    if (parts.length != 3) {
        player.sendMessage(invalidReq);
        return false;
    }
    if (isSingle && Strings.stripColors(message).length > 150) {
        player.sendMessage('Label too large. Maximum is 150 characters, not including color tags.');
    }
    if (isSingle) {
        lastLabel = message;
    }
    var duration = Number(parts[0]);
    var x = Number(parts[1]), y = Number(parts[2]);
    if (Number.isNaN(duration) || duration > MAX_LABEL_TIME || Number.isNaN(x) || Number.isNaN(y)) {
        player.sendMessage(invalidReq);
        return false;
    }
    tmpLabelPacket.message = message;
    tmpLabelPacket.duration = duration;
    tmpLabelPacket.worldx = x;
    tmpLabelPacket.worldy = y;
    Vars.net.send(tmpLabelPacket, false);
    return true;
}
function handleLine(content, player) {
    var parts = content.split(',');
    if (parts.length != 5) {
        player.sendMessage(invalidReq);
        return false;
    }
    Tmp.v1.set(Number(parts[2]), Number(parts[3]));
    Color.valueOf(Tmp.c1, parts[4]);
    tmpLinePacket.x = Number(parts[0]);
    tmpLinePacket.y = Number(parts[1]);
    Vars.net.send(tmpLinePacket, false);
    return true;
}
function bulkInfoMsg(messages, conn) {
    for (var i = messages.length - 1; i >= 0; i--) {
        Call.infoMessage(conn, messages[i]);
    }
}
