"use strict";
/**
 * Stores logic for extending the capibilities of mindustry maps via a bundled JSON file,
 * @author Jurorno9
 * @version 0.1
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JMap = void 0;
var JMap = /** @class */ (function () {
    function JMap(data) {
        if (data === void 0) { data = {}; }
        this.display_version = 0;
        /*
         * Apply additional map rules not specifiable within a regular msav file
         */
        this.disable_vnw_multiwave = false;
        this.disable_maps_listing = false;
        /*
         * Allows for the specification of javascript using this file.
         *
         * 'JS_init' is called when the associated map is loaded.
         * 'JS_destruct' is called whenever the associated map is over. It is the expectation of a map author to use this function to use this method to deconstruct any code used by 'JS init' (revert settings, remove event listeners)
        */
        this.JS_init = function () { };
        this.JS_destruct = function () { };
        Object.assign(this, data);
    }
    return JMap;
}());
exports.JMap = JMap;
