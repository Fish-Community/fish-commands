const players = require("players");
const utils = require("utils");

type MenuListener = (player:mindustryPlayer, option:number) => void;

const registeredListeners:{
	[index:string]: number;
} = {};
const listeners = (
	<T extends Record<string, (player:mindustryPlayer, option:number) => void>>(d:T) => d
)({ 
	generic(player, option){
		const fishSender = players.getP(player) as FishPlayer;
		if (option === -1 || option === fishSender.activeMenu.cancelOptionId) return;

		fishSender.activeMenu.callback?.(fishSender, option);
		fishSender.activeMenu.callback = undefined;
	},
	none(player, option){
		//do nothing
	}
});

Events.on(ServerLoadEvent, (e) => {
  for(const key of Object.keys(listeners)){
		registeredListeners[key] = Menus.registerMenu(listeners[key as keyof typeof listeners]);
	}
});

/**Displays a menu. */
function menu<T>(title:string, description:string, options:T[], callback: (opts: {
	option:T, sender:FishPlayer, outputSuccess:(message:string) => void, outputFail:(message:string) => void;
}) => void, target:FishPlayer, includeCancel:boolean = true, optionStringifier:(opt:T) => string = t => t as string){

	//Set up the 2D array of options, and add cancel
	const arrangedOptions = utils.to2DArray(options.map(optionStringifier), 3);
	if(includeCancel){
		arrangedOptions.push("Cancel");
		target.activeMenu.cancelOptionId = options.length;
	} else {
		target.activeMenu.cancelOptionId = -1;
	}

	//The target fishPlayer has a property called activeMenu, which stores information about the last menu triggered.
	target.activeMenu.callback = (fishSender, option) => {
		//Additional permission validation could be done here, but the only way that callback() can be called is if the above statement executed,
		//and on sensitive menus such as the stop menu, the only way to reach that is if menu() was called by the /stop command,
		//which already checks permissions.
		//Additionally, the callback is cleared by the generic menu listener after it is executed.
		callback({
			option: options[option],
			sender: target,
			outputFail(message:string){
				target.player.sendMessage(`[scarlet]⚠ [yellow]${message}`);
			},
			outputSuccess(message:string){
				target.player.sendMessage(`[#48e076]${message}`);
			}
		});
	};

	Call.menu(target.player.con, registeredListeners.generic, title, description, arrangedOptions);
}

module.exports = {
	listeners: registeredListeners,
	menu
};