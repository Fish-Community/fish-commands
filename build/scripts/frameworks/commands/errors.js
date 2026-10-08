"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandError = void 0;
exports.fail = fail;
exports.handleError = handleError;
var menus_1 = require("/frameworks/menus");
var funcs_1 = require("/funcs");
exports.CommandError = (function () { });
Object.setPrototypeOf(exports.CommandError.prototype, Error.prototype);
function fail(message) {
    var err = new Error(typeof message == "string" ? message : "");
    err.data = message;
    Object.setPrototypeOf(err, exports.CommandError.prototype);
    throw err;
}
function handleError(err, sender, outputFail, context) {
    if (err instanceof exports.CommandError) {
        outputFail(err.data, sender);
    }
    else if (err === menus_1.Cancel) {
        return;
    }
    else {
        sender.sendMessage("[scarlet]\u274C An error occurred while executing the command!");
        if (sender.hasPerm("seeErrorMessages"))
            sender.sendMessage((0, funcs_1.parseError)(err));
        Log.err(context ?
            "Unhandled error in command execution: ".concat(context)
            : "Unhandled error in command execution.");
        Log.err(err);
        if (typeof err == "object" && err != null && "stack" in err)
            Log.err(err.stack);
    }
}
