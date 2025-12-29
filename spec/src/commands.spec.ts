import { Perm, register } from '../plugin/commands';
import { MockCommandHandler } from './test-utils';

describe("commands framework", () => {
	it("should register a simple command", () => {
		const clientHandler = new MockCommandHandler(() => {});
		const serverHandler = new MockCommandHandler(() => {});
		register({
			test_command: {
				args: [],
				description: "test command description",
				perm: Perm.none,
				handler(){
					//empty
				}
			}
		}, clientHandler, serverHandler);
		expect(clientHandler.commands).toEqual({
			test_command: {
				args: "",
				description: "test command description",
				runner: new CommandRunner({accept: jasmine.any(Function) as any}),
			}
		});
	});
});
