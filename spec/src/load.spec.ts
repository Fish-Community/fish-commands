
import '../plugin/index';


describe('fish-commands', () => {
	it('should load', () => {
		Events.fire(new EventType.ServerLoadEvent());
	});
});
