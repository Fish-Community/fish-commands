import { delay, fakeObject, MockCommandHandler, randomUUID } from './test-utils';
import { initialize, Perm, register, reset } from '../plugin/frameworks/commands';
import { FishPlayer } from '../plugin/players';

describe("commands framework", () => {
	const clientHandler = new MockCommandHandler(() => {});
	const serverHandler = new MockCommandHandler(() => {});
	afterEach(() => {
		reset();
		clientHandler.reset();
		serverHandler.reset();
	});
	it("should register a simple command", async () => {
		const test_command_handler = jasmine.createSpy("handler");
		register({
			test_command: {
				args: [],
				description: "test command description",
				perm: Perm.none,
				handler: test_command_handler,
			}
		}, clientHandler, serverHandler);
		expect(clientHandler.commands).toEqual({
			test_command: {
				args: "",
				description: "test command description",
				runner: new CommandRunner({accept: jasmine.any(Function) as any}),
			}
		});
		initialize();
		const playerUUID = randomUUID();
		const testSender = {
			uuid: () => playerUUID,
			name: "Test Player",
		} as Player;
		//Run the command with no arguments
		clientHandler.commands.test_command.runner.accept([], testSender);
		await delay(0);
		expect(test_command_handler).toHaveBeenCalledTimes(1);
		expect(test_command_handler).toHaveBeenCalledWith(jasmine.objectContaining({
			sender: FishPlayer.getById(playerUUID)
		}));
	});
	it("should handle permissions", async () => {
		const test_command_handler = jasmine.createSpy("handler");
		register({
			test_command: {
				args: [],
				description: "test command description",
				perm: new Perm("test perm", () => false),
				handler: test_command_handler,
			}
		}, clientHandler, serverHandler);
		expect(clientHandler.commands).toEqual({
			test_command: {
				args: "",
				description: "test command description",
				runner: new CommandRunner({accept: jasmine.any(Function) as any}),
			}
		});
		initialize();
		const playerUUID = randomUUID();
		const sendMessage = jasmine.createSpy<(message:string) => void>();
		const testSender = {
			uuid: () => playerUUID,
			name: "Test Player",
			sendMessage: sendMessage,
		} satisfies Partial<Player> as never as Player;
		//Run the command with no arguments
		clientHandler.commands.test_command.runner.accept([], testSender);
		await delay(0);
		expect(test_command_handler).toHaveBeenCalledTimes(0);
		expect(sendMessage).toHaveBeenCalled();
	});
});
