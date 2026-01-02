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
exports.CommandError = (function () { });
Object.setPrototypeOf(exports.CommandError.prototype, Error.prototype);
function fail(message) {
    var err = new Error(typeof message == "string" ? message : "");
    //oh no it's even worse now because i have to smuggle a function through here
    err.data = message;
    Object.setPrototypeOf(err, exports.CommandError.prototype);
    throw err;
}
