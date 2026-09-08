"use strict";
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the error handling framework.
For usage information, see docs/framework-usage-guide.md
For maintenance information, see docs/frameworks.md
*/
//Behold, the power of typescript!
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
    //oh no it's even worse now because i have to smuggle a function through here
    err.data = message;
    Object.setPrototypeOf(err, exports.CommandError.prototype);
    throw err;
}
function handleError(err, sender, outputFail, context) {
    if (err instanceof exports.CommandError) {
        //If the error is a command error, then just outputFail
        outputFail(err.data, sender);
    }
    else if (err === menus_1.Cancel) {
        //Menu cancelled, do nothing
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
