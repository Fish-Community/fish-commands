import { FishPlayer } from "/players";
import { Promise } from "/promise";
/** Stores a mapping from name to the numeric id of a listener that has been registered. */
declare const registeredListeners: Record<string, number>;
/** Registers all listeners, should be called on server load. */
export declare function registerListeners(): void;
type MenuConfirmProps = {
    /** This message is sent to the user (prefixed with /!\) if they cancel. */
    cancelOutput?: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
};
type MenuCancelOption = "ignore" | "reject" | "null";
type MenuOptions<TOption, TCancelBehavior extends MenuCancelOption> = {
    /** [red]Cancel[] will be added to the list of options. */
    includeCancel?: boolean;
    optionStringifier?: (opt: TOption) => string;
    columns?: number;
    /**
     * Specifies the behavior when the player cancels the menu (by clicking Cancel, or by pressing Escape).
     * @default "ignore"
     */
    onCancel?: TCancelBehavior;
    cancelOptionId?: number;
};
export declare const Menu: {
    /** Displays a menu to a player, returning a Promise. */
    raw<const TOption, TCancelBehavior extends MenuCancelOption = "ignore">(this: void, title: string, description: string, arrangedOptions: TOption[][], target: FishPlayer, { optionStringifier, onCancel, cancelOptionId, }?: {
        optionStringifier?: (opt: TOption) => string;
        /**
         * Specifies the behavior when the player cancels the menu (by clicking Cancel, or by pressing Escape).
         * @default "ignore"
         */
        onCancel?: TCancelBehavior;
        cancelOptionId?: number;
    }): Promise<TOption | (TCancelBehavior extends "null" ? null : never), TCancelBehavior extends "reject" ? "cancel" : never>;
    /** Displays a menu to a player, returning a Promise. Arranges provided options into a 2D array, and can add a Cancel option. */
    menu<const TOption, TCancelBehavior extends MenuCancelOption = "ignore">(this: void, title: string, description: string, options: TOption[], target: FishPlayer, { includeCancel, optionStringifier, columns, onCancel, cancelOptionId, }?: MenuOptions<TOption, TCancelBehavior>): Promise<TOption | (TCancelBehavior extends "null" ? null : never), TCancelBehavior extends "reject" ? "cancel" : never>;
    /** Rejects with a CommandError if the user chooses to cancel. */
    confirm(target: FishPlayer, description: string, { cancelOutput, title, confirmText, cancelText, }?: MenuConfirmProps): Promise<string, unknown>;
    /** Same as confirm(), but with inverted colors, for potentially dangerous actions. */
    confirmDangerous(target: FishPlayer, description: string, { confirmText, cancelText, ...rest }?: MenuConfirmProps): Promise<string, unknown>;
    /**
     * Displays a menu to a player, returning a Promise.
     * Accepts pre-generated data and text. Alternative to optionStringifier if the text is already generated.
     */
    buttons<TButtonData, TCancelBehavior extends MenuCancelOption>(this: void, target: FishPlayer, title: string, description: string, options: {
        data: TButtonData;
        text: string;
    }[][], cfg?: Omit<MenuOptions<TButtonData, TCancelBehavior>, "optionStringifier" | "columns">): Promise<TButtonData | (TCancelBehavior extends "null" ? null : never), unknown>;
    /**
     * Displays a menu to a player, returning a Promise.
     * Adds left and right arrows to switch pages.
     * Shows different options based on the page.
     */
    pages<TOption, TCancelBehavior extends MenuCancelOption>(this: void, target: FishPlayer, title: string, description: string, options: {
        data: TOption;
        text: string;
    }[][][], cfg: Pick<MenuOptions<TOption, TCancelBehavior>, "onCancel">): Promise<TOption | (TCancelBehavior extends "null" ? null : never), TCancelBehavior extends "reject" ? "cancel" : never>;
    /**
     * Displays a menu to a player, returning a Promise.
     * Adds left and right arrows to switch pages.
     * Shows different text based on the current page.
     */
    textPages<TCancelBehavior extends MenuCancelOption, TOpt extends string>(this: void, target: FishPlayer, pages: Array<readonly [title: string, description: () => string]>, options?: TOpt[], cfg?: Pick<MenuOptions<never, TCancelBehavior>, "onCancel"> & {
        /** Index or title of the initial page. */
        startPage?: number | string;
    }): Promise<readonly [pageNumber: number, option: TOpt] | (TCancelBehavior extends "null" ? null : never), TCancelBehavior extends "reject" ? "cancel" : never>;
    /**
     * Displays a menu to a player, returning a Promise.
     * Accepts a 2D array of options and shows a region of that 2D grid.
     * Adds arrows to scroll left/right/up/down.
     * Resolves to the selected option.
     */
    scroll2D<TOption, TCancelBehavior extends MenuCancelOption>(this: void, target: FishPlayer, title: string, description: string, options: {
        data: TOption;
        text: string;
    }[][], cfg?: Pick<MenuOptions<TOption, TCancelBehavior>, "onCancel" | "columns"> & {
        rows?: number;
        x?: number;
        y?: number;
        getCenterText?: (x: number, y: number) => string;
    }): Promise<[TOption, x: number, y: number] | (TCancelBehavior extends "null" ? null : never), TCancelBehavior extends "reject" ? "cancel" : never>;
    /**
     * Displays a menu to a player, returning a Promise.
     * Adds left and right arrows to switch pages. Automatically paginates provided options.
     * Accepts pre-generated data and text. Alternative to optionStringifier if the text is already generated.
     */
    pagedListButtons<TButtonData, MenuCancelBehavior extends MenuCancelOption = "ignore">(this: void, target: FishPlayer, title: string, description: string, options: Array<{
        data: TButtonData;
        text: string;
    }>, { rowsPerPage, columns, ...cfg }: Pick<MenuOptions<TButtonData, MenuCancelBehavior>, "columns" | "onCancel"> & {
        /** @default 10 */
        rowsPerPage?: number;
    }): Promise<TButtonData | (MenuCancelBehavior extends "null" ? null : never), unknown> | Promise<TButtonData | (MenuCancelBehavior extends "null" ? null : never), MenuCancelBehavior extends "reject" ? "cancel" : never>;
    /**
     * Displays a menu to a player, returning a Promise.
     * Adds left and right arrows to switch pages. Automatically paginates provided options.
     */
    pagedList<TButtonData, MenuCancelBehavior extends MenuCancelOption = "ignore">(this: void, target: FishPlayer, title: string, description: string, options: TButtonData[], { rowsPerPage, columns, optionStringifier, ...cfg }?: Pick<MenuOptions<TButtonData, MenuCancelBehavior>, "columns" | "onCancel" | "optionStringifier"> & {
        /** @default 10 */
        rowsPerPage?: number;
    }): Promise<TButtonData | (MenuCancelBehavior extends "null" ? null : never), unknown> | Promise<TButtonData | (MenuCancelBehavior extends "null" ? null : never), MenuCancelBehavior extends "reject" ? "cancel" : never>;
};
export { registeredListeners as listeners };
