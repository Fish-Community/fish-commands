import { ClientCommandHandler, ServerCommandHandler } from "/types";

const fakeObjectTrap = new Proxy({}, {
	get(target, property){ throw new Error(`Attempted to access property ${String(property)} on fake object`); },
});
export function fakeObject<T>(input:Partial<T>):T {
	Object.setPrototypeOf(input, fakeObjectTrap);
	return input as never;
}

export class MockCommandHandler implements ClientCommandHandler, ServerCommandHandler {
	constructor(
		public onMessage: (command:string) => void,
	){}
	commands: Record<string, {
		args: string;
		description: string;
		runner: (args: string[], player: mindustryPlayer) => unknown;
	}> = {};
	register(name: string, args: string, description: string, runner: (args: string[], player: mindustryPlayer) => unknown){
		this.commands[name] = { args, description, runner };
	}
	removeCommand(name: string){
		delete this.commands[name];
	}
	handleMessage(command: string){
		this.onMessage(command);
	}
}
