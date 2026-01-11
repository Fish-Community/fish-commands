/**
 * Stores logic for extending the capibilities of mindustry maps via a bundled JSON file, 
 * @author Jurorno9
 * @version 0.1
 * 
 */


export class JMap {
    /*
     * Settings concerning metadata overrides, such as Display name or Author. Overrides settings presented in the map file
     */
    display_name_override:string | undefined;
    display_author_override:string | undefined;
    display_version = 0
    /*
     * Apply additional map rules not specifiable within a regular msav file
     */
    disable_vnw_multiwave:boolean = false;
    disable_maps_listing:boolean = false;
    /*
    * TODO: FUTURE SUPPORT FOR SPECIFYING CAMPAIGN DETAILS 
    */
    campaign:undefined;
    /*
     * Allows for the specification of javascript using this file. 
     * 
     * 'JS_init' is called when the associated map is loaded.
     * 'JS_destruct' is called whenever the associated map is over. It is the expectation of a map author to use this function to use this method to deconstruct any code used by 'JS init' (revert settings, remove event listeners)
    */
    JS_init: () => void = () => {};
    JS_destruct : () => void = () => {};

    constructor(data: Partial<JMap> = {}) {
    Object.assign(this, data)
  }
}

