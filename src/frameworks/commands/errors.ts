/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the error handling framework.
For usage information, see docs/framework-usage-guide.md
For maintenance information, see docs/frameworks.md
*/
//Behold, the power of typescript!

import type { PartialFormatString } from "/frameworks/commands/types";

//Shenanigans were once necessary due to odd behavior of Typescript's compiled error subclass
//however it morphed into something bizarre
declare class _FAKE_CommandError { //oh god no why
	data: string | PartialFormatString;
}
export const CommandError = (function(){/*empty*/}) as unknown as typeof _FAKE_CommandError;
Object.setPrototypeOf(CommandError.prototype, Error.prototype);
export function fail(message:string | PartialFormatString):never {
	const err = new Error(typeof message == "string" ? message : "");
	//oh no it's even worse now because i have to smuggle a function through here
	(err as any).data = message;
	Object.setPrototypeOf(err, CommandError.prototype);
	throw err;
}
