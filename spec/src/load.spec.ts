
import '../plugin/index';
import { reset } from '../plugin/frameworks/commands';


describe('fish-commands', () => {
	it('should load', () => {
		Events.fire(new EventType.ServerLoadEvent());
	});
	afterEach(() => {
		reset();
	});
});
