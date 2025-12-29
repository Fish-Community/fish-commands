
import '../plugin/index';
import { reset } from '../plugin/commands';


describe('fish-commands', () => {
	it('should load', () => {
		Events.fire(new EventType.ServerLoadEvent());
	});
	afterEach(() => {
		reset();
	});
});
