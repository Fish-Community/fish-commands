import { ClientCommandHandler, ServerCommandHandler } from "/types";

const fakeObjectTrap = new Proxy({}, {
	get(target, property){
		if(property == "jasmineToString" || property == Symbol.toStringTag) return;
		throw new Error(`Attempted to access property ${String(property)} on fake object`);
	},
});
export function fakeObject<T>(input:Partial<T>):T {
	Object.setPrototypeOf(input, fakeObjectTrap);
	return input as never;
}
const uuidCharacters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
export function randomUUID():string {
	return Array.from({length: 22}, () => uuidCharacters[Math.floor(Math.random() * uuidCharacters.length)]).join("") + '==';
}
export class MockCommandHandler implements ClientCommandHandler, ServerCommandHandler {
	constructor(
		public onMessage: (command:string) => void,
	){}
	commands: Record<string, {
		args: string;
		description: string;
		runner: CommandRunner<mindustryPlayer | null>;
	}> = {};
	register(name: string, args: string, description: string, runner: CommandRunner<mindustryPlayer | null>){
		this.commands[name] = { args, description, runner };
	}
	removeCommand(name: string){
		delete this.commands[name];
	}
	handleMessage(command: string){
		this.onMessage(command);
	}
}
export function delay(millis:number):Promise<void> {
	return new Promise(res => setTimeout(res, millis));
}
