/* eslint-disable @typescript-eslint/array-type */
/*
Copyright © BalaM314, 2026. All Rights Reserved.
This file contains the menu framework.
For usage information, see docs/framework-usage-guide.md
For maintenance information, see docs/frameworks.md
*/

import { CommandError, fail } from "/frameworks/commands";
import { parseError, to2DArray } from "/funcs";
import { FishPlayer } from "/players";
import { Promise } from "/promise";
import { outputFail } from "/utils";

/** Used to change the behavior of adding another menu when being run in a menu callback. */
let isInMenuCallback = false;
/** Stores a mapping from name to the numeric id of a listener that has been registered. */
const registeredListeners: Record<string, number> = {};
/** Stores all listeners in use by fish-commands. */
const listeners = {
	generic(player, option){
		const fishSender = FishPlayer.get(player);

		const prevCallback = fishSender.activeMenus.shift();
		if(!prevCallback) return; //No menu to process, do nothing
		isInMenuCallback = true;
		prevCallback.callback(option);
		isInMenuCallback = false;
	},
	none(player, option){
		//do nothing
	}
} satisfies Record<string, (player:mindustryPlayer, option:number) => void>;

/** Registers all listeners, should be called on server load. */
export function registerListeners(){
	for(const [key, listener] of Object.entries(listeners)){
		registeredListeners[key] ??= Menus.registerMenu(listener);
	}
}

type MenuConfirmProps = {
	/** This message is sent to the user (prefixed with /!\) if they cancel. */
	cancelOutput?: string;
	title?: string;
	confirmText?: string;
	cancelText?: string;
};

type MenuCancelOption = "ignore" | "reject" | "null";
type MenuOptions<TOption, TCancelBehavior extends MenuCancelOption> = {
	/** The specified text, or "[red]Cancel[]", will be added to the list of options. */
	includeCancel?: boolean | string;
	optionStringifier?: (opt: TOption) => string;
	columns?: number;
	/**
	 * Specifies the behavior when the player cancels the menu (by clicking Cancel, or by pressing Escape).
	 * @default "ignore"
	 */
	onCancel?: TCancelBehavior;
	cancelOptionId?: number;
};

export const Menu = {
	/** Displays a menu to a player, returning a Promise. */
	raw<const TOption, TCancelBehavior extends MenuCancelOption = "ignore">(
		this:void, title:string, description:string, arrangedOptions:TOption[][], target:FishPlayer,
		{
			optionStringifier = String,
			onCancel = "ignore" as never,
			cancelOptionId = -1,
		}:{
			optionStringifier?:(opt:TOption) => string;
			/**
			 * Specifies the behavior when the player cancels the menu (by clicking Cancel, or by pressing Escape).
			 * @default "ignore"
			 */
			onCancel?: TCancelBehavior;
			cancelOptionId?: number;
		} = {}
	){
		const { promise, reject, resolve } = Promise.withResolvers<
			(TCancelBehavior extends "null" ? null : never) | TOption,
			TCancelBehavior extends "reject" ? "cancel" : never
		>();
	
		//The target fishPlayer has a property called activeMenu, which stores information about the last menu triggered.
		//If menu() is being called from a menu calback, add it to the front of the queue so it is processed before any other menus.
		//Otherwise, two multi-step menus queued together would alternate, which would confuse the player.
		target.activeMenus[isInMenuCallback ? "unshift" : "push"]({ callback(option){
			//Additional permission validation could be done here, but the only way that callback() can be called is if the above statement executed,
			//and on sensitive menus such as the stop menu, the only way to reach that is if menu() was called by the /stop command,
			//which already checks permissions.
			//Additionally, the callback is cleared by the generic menu listener after it is executed.
	
			try {
				const options = arrangedOptions.flat();
				//We do need to validate option though, as it can be any number.
				if(option === -1 || option === cancelOptionId || !(option in options)){
					//Consider any invalid option to be a cancellation
					if(onCancel == "null") resolve(null as never);
					else if(onCancel == "reject") reject("cancel" as never);
					else return;
				} else {
					resolve(options[option]);
				}
			} catch(err){
				if(err instanceof CommandError){
					//If the error is a command error, then just outputFail
					outputFail(err.data, target);
				} else {
					target.sendMessage(`[scarlet]\u274C An error occurred while executing the command!`);
					if(target.hasPerm("seeErrorMessages")) target.sendMessage(parseError(err));
					Log.err(`Unhandled error in menu callback: ${target.cleanedName} submitted menu "${title}" "${description}"`);
					Log.err(err as Error);
				}
			}
		}});
	
		let i = 0;
		const stringifiedOptions = arrangedOptions.map(r => r.map(item => {
			if(i === cancelOptionId) return item as string;
			i ++;
			return optionStringifier(item);
		}));
		Call.menu(target.con, registeredListeners.generic, title, description, stringifiedOptions);
		return promise;
	},
	/** Displays a menu to a player, returning a Promise. Arranges provided options into a 2D array, and can add a Cancel option. */
	menu<const TOption, TCancelBehavior extends MenuCancelOption = "ignore">(
		this:void, title:string, description:string, options:TOption[], target:FishPlayer,
		{
			includeCancel = false,
			optionStringifier = String,
			columns = 3,
			onCancel = "ignore" as never,
			cancelOptionId = -1,
		}:MenuOptions<TOption, TCancelBehavior> = {}
	){
		//Set up the 2D array of options, and maybe add cancel
		//Call.menu() with [[]] will cause a client crash, make sure to pass [] instead
		const arrangedOptions = (options.length == 0 && !includeCancel) ? [] : to2DArray(options, columns);

		if(includeCancel){
			arrangedOptions.push([(typeof includeCancel == "string" ? includeCancel : "[red]Cancel[]") as never]);
			//This is safe because cancelOptionId is set,
			//so the handler will never get called with "Cancel".
			cancelOptionId = options.length;
		}

		return Menu.raw(title, description, arrangedOptions, target, {
			cancelOptionId, onCancel, optionStringifier
		});
	},
	/** Rejects with a CommandError if the user chooses to cancel. */
	confirm(target:FishPlayer, description:string, {
		cancelOutput = "Cancelled.",
		title = "Confirm",
		confirmText = "[green]Confirm",
		cancelText = "[red]Cancel",
	}:MenuConfirmProps = {}){
		return Menu.menu(
			title, description, [confirmText, cancelText], target,
			{ onCancel: "reject", cancelOptionId: 1 }
		).catch(e => {
			if(e === "cancel") fail(cancelOutput);
			throw e; //some random error, rethrow it
		});
	},
	/** Same as confirm(), but with inverted colors, for potentially dangerous actions. */
	confirmDangerous(target:FishPlayer, description:string, {
		confirmText = "[red]Confirm",
		cancelText = "[green]Cancel",
		...rest
	}:MenuConfirmProps = {}){
		return Menu.confirm(target, description, { cancelText, confirmText, ...rest });
	},
	/**
	 * Displays a menu to a player, returning a Promise.
	 * Accepts pre-generated data and text. Alternative to optionStringifier if the text is already generated.
	 */
	buttons<TButtonData, TCancelBehavior extends MenuCancelOption>(
		this:void, target:FishPlayer, title:string, description:string,
		options:{ data: TButtonData; text: string; }[][],
		cfg: Omit<MenuOptions<TButtonData, TCancelBehavior>, "optionStringifier" | "columns"> = {},
	){
		return Menu.raw(title, description, options, target, {
			...cfg,
			optionStringifier: o => o.text,
		}).then(o => o?.data as TButtonData | (TCancelBehavior extends "null" ? null : never));
	},
	/**
	 * Displays a menu to a player, returning a Promise.
	 * Adds left and right arrows to switch pages.
	 * Shows different options based on the page.
	 */
	pages<TOption, TCancelBehavior extends MenuCancelOption>(
		this:void, target:FishPlayer, title:string, description:string,
		options:{ data: TOption; text: string; }[][][],
		cfg: Pick<MenuOptions<TOption, TCancelBehavior>, "onCancel">,
	){
		const { promise, reject, resolve } = Promise.withResolvers<
			(TCancelBehavior extends "null" ? null : never) | TOption,
			TCancelBehavior extends "reject" ? "cancel" : never
		>();
		function showPage(index:number){
			const opts:{ data: "left" | "numbers" | "right" | readonly [TOption]; text: string; }[][] = [
				...options[index].map(r => r.map(d => ({ text: d.text, data: [d.data] as const }))),
				[
					{ data: "left", text: `[${index == 0 ? "gray" : "accent"}]<--` },
					{ data: "numbers", text: `[accent]${index + 1}/${options.length}` },
					{ data: "right", text: `[${index == options.length - 1 ? "gray" : "accent"}]-->` }
				]
			];
			void Menu.buttons(target, title, description, opts, {...cfg, onCancel: "null"}).then<unknown, never>(response => {
				if(response instanceof Array) resolve(response[0]);
				else if(response === "right") showPage(Math.min(index + 1, options.length - 1));
				else if(response === "left") showPage(Math.max(index - 1, 0));
				else {
					//Treat numbers as cancel
					if(cfg.onCancel == "null") resolve(null as never);
					else if(cfg.onCancel == "reject") reject("cancel" as never);
					//otherwise, just let the promise hang
				}
			});
		}
		showPage(0);
		return promise;
	},
	/**
	 * Displays a menu to a player, returning a Promise.
	 * Adds left and right arrows to switch pages.
	 * Does not support options.
	 * Shows different text based on the current page.
	 */
	textPages<TCancelBehavior extends MenuCancelOption>(
		this:void, target:FishPlayer, pages:Array<readonly [title:string, description:() => string]>,
		cfg: Pick<MenuOptions<never, TCancelBehavior>, "onCancel"> & {
			/** Index or title of the initial page. */
			startPage?: number | string;
		} = {},
	){
		const { promise, reject, resolve } = Promise.withResolvers<
			(TCancelBehavior extends "null" ? null : never),
			TCancelBehavior extends "reject" ? "cancel" : never
		>();
		const pageSkipSize = Math.max(Math.floor(pages.length / 8), 5);
		function showPage(index:number){
			const opts:{ data: ["left", number] | ["numbers"] | ["right", number] | ["cancel"]; text: string; }[][] = [
				[
					{ data: ["left", pageSkipSize], text: `[${index == 0 ? "gray" : "accent"}]<<<` },
					{ data: ["left", 1], text: `[${index == 0 ? "gray" : "accent"}]<--` },
					{ data: ["right", 1], text: `[${index == pages.length - 1 ? "gray" : "accent"}]-->` },
					{ data: ["right", pageSkipSize], text: `[${index == pages.length - 1 ? "gray" : "accent"}]>>>` },
				],
				[
					{ data: ["numbers"], text: `[accent]Page ${index + 1}/${pages.length}` },
					{ data: ["cancel"], text: `[red]Close` },
				]
			];
			void Menu.buttons(target, pages[index][0], pages[index][1](), opts, {...cfg, onCancel: "null"}).then<unknown, never>(response => {
				if(response?.[0] === "right") showPage(Math.min(index + response[1], pages.length - 1));
				else if(response?.[0] === "left") showPage(Math.max(index - response[1], 0));
				else {
					//Treat numbers as cancel
					if(cfg.onCancel == "null") resolve(null as never);
					else if(cfg.onCancel == "reject") reject("cancel" as never);
					//otherwise, just let the promise hang
				}
			});
		}
		const index = (() => {
			if(cfg.startPage == undefined) return 0;
			if(typeof cfg.startPage === 'number'){
				if(cfg.startPage < 0) return 0;
				return cfg.startPage;
			}
			const index = pages.findIndex(([title]) => title === cfg.startPage);
			if(index === -1) return 0;
			return index;
		})();
		showPage(index);
		return promise;
	},
	/**
	 * Displays a menu to a player, returning a Promise.
	 * Accepts a 2D array of options and shows a region of that 2D grid.
	 * Adds arrows to scroll left/right/up/down.
	 * Resolves to the selected option.
	 */
	scroll2D<TOption, TCancelBehavior extends MenuCancelOption>(
		this:void, target:FishPlayer, title:string, description:string,
		options:{ data: TOption; text: string; }[][],
		cfg: Pick<MenuOptions<TOption, TCancelBehavior>, "onCancel" | "columns"> & {
			rows?: number;
			x?: number;
			y?: number;
			getCenterText?: (x:number, y:number) => string;
		} = {},
	){
		const { promise, reject, resolve } = Promise.withResolvers<
			(TCancelBehavior extends "null" ? null : never) | [TOption, x:number, y:number],
			TCancelBehavior extends "reject" ? "cancel" : never
		>();
		const { rows = 5, columns: cols = 5 } = cfg;
		const height = options.length;
		const width = options[0].length;
		function showPage(x:number, y:number){
			const opts:{ data: "left" | "blank" | "right" | "up" | "down" | readonly [TOption]; text: string; }[][] = [
				...options.slice(y, y + rows).map(r => r.concat(Array(width - r.length).fill({ data: "blank", text: `` }))).map(r =>
					r.slice(x, x + cols).map(d => ({ text: d.text, data: [d.data] as const }))
				),
				[
					{ data: "blank", text: `` },
				],
				[
					{ data: "blank", text: `` },
					{ data: "up", text: `[${y == 0 ? "gray" : "accent"}]${String.fromCharCode(Iconc.up)}` },
					{ data: "blank", text: `` },
				],[
					{ data: "left", text: `[${x == 0 ? "gray" : "accent"}]${String.fromCharCode(Iconc.left)}` },
					{ data: "blank", text: cfg.getCenterText?.(x, y) ?? '' },
					{ data: "right", text: `[${x == width - cols ? "gray" : "accent"}]${String.fromCharCode(Iconc.right)}` },
				],[
					{ data: "blank", text: `` },
					{ data: "down", text: `[${y == height - rows ? "gray" : "accent"}]${String.fromCharCode(Iconc.down)}` },
					{ data: "blank", text: `` },
				]
			];
			void Menu.buttons(target, title, description, opts, cfg).then<unknown, never>(response => {
				if(response instanceof Array) resolve([response[0], x, y]);
				else if(response === "right") showPage(Math.min(x + 1, width - cols), y);
				else if(response === "left") showPage(Math.max(x - 1, 0), y);
				else if(response === "up") showPage(x, Math.max(y - 1, 0));
				else if(response === "down") showPage(x, Math.min(y + 1, height - rows));
				else {
					//Treat numbers as cancel
					if(cfg.onCancel == "null") resolve(null as never);
					else if(cfg.onCancel == "reject") reject("cancel" as never);
					//otherwise, just let the promise hang
				}
			});
		}
		showPage(Math.min(cfg.x ?? 0, width - cols), Math.min(cfg.y ?? 0, height - rows));
		return promise;
	},
	/**
	 * Displays a menu to a player, returning a Promise.
	 * Adds left and right arrows to switch pages. Automatically paginates provided options.
	 * Accepts pre-generated data and text. Alternative to optionStringifier if the text is already generated.
	 */
	pagedListButtons<TButtonData, MenuCancelBehavior extends MenuCancelOption = "ignore">(
		this:void, target:FishPlayer, title:string, description:string,
		options:Array<{ data: TButtonData; text: string; }>,
		{ rowsPerPage = 10, columns = 3, ...cfg }: Pick<MenuOptions<TButtonData, MenuCancelBehavior>, "columns" | "onCancel"> & {
			/** @default 10 */
			rowsPerPage?:number;
		},
	){
		//Generate pages
		const pages = to2DArray(to2DArray(options, columns), rowsPerPage);
		if(pages.length <= 1) return Menu.buttons(target, title, description, pages[0] ?? [], cfg);
		return Menu.pages(target, title, description, pages, cfg);
	},
	/**
	 * Displays a menu to a player, returning a Promise.
	 * Adds left and right arrows to switch pages. Automatically paginates provided options.
	 */
	pagedList<TButtonData, MenuCancelBehavior extends MenuCancelOption = "ignore">(
		this:void, target:FishPlayer, title:string, description:string,
		options:TButtonData[],
		{ rowsPerPage = 10, columns = 3, optionStringifier = String, ...cfg }: Pick<MenuOptions<TButtonData, MenuCancelBehavior>, "columns" | "onCancel" | "optionStringifier"> & {
			/** @default 10 */
			rowsPerPage?:number;
		} = {},
	){
		//Generate pages
		const pages = to2DArray(to2DArray(options.map(
			o => ({ data: o, get text(){ return optionStringifier(o); }})
		), columns), rowsPerPage);
		if(pages.length <= 1) return Menu.buttons(target, title, description, pages[0] ?? [], cfg);
		return Menu.pages(target, title, description, pages, cfg);
	}
};

export { registeredListeners as listeners };

