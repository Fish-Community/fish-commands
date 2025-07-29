"use strict";
/**
 * Contains functionality for the localization of FishCommands
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.validLanguageCodes = void 0;
exports.isLanguageCode = isLanguageCode;
exports.localize = localize;
exports.localizef = localizef;
var commands_1 = require("./commands");
var funcs_1 = require("./funcs");
var utils_1 = require("./utils");
//
var Locales = [
    {
        info: {
            name_en: "English",
            name_native: "English",
            code: "EN",
            maintainer: "Various",
            quickfox: "The quick brown fox jumps over the lazy dog"
        },
        definitions: {
            commandLangDescription: "View or set language preferences",
            commandLangNoLangCodeFound: "Language ${args.language} not found.",
            commandLangChangeSuccess: "Language now set to ${lang}.",
            commandLangInfo: "Your Current Language is Set to ${lang}. To change it, type [yellow]/lang [language][]."
        }
    },
    {
        info: {
            name_en: "Pig Latin",
            name_native: "igpay atinlay",
            code: "PL", // not up to ISO 639, but I do not really care :/
            maintainer: "JurorNo9",
            quickfox: "ethay uickqay ownbray oxfay umpsjay overyay ethay azylay ogday"
        },
        definitions: {
            tip1: "hello",
            tip2: "bye",
        }
    }
];
exports.validLanguageCodes = Locales.map(function (l) { return l.info.code; });
var localeMap = Object.fromEntries(Locales.map(function (l) { return [l.info.code, l]; }));
function isLanguageCode(str) {
    return exports.validLanguageCodes.includes(str);
}
function localize(code, key) {
    var _a, _b;
    var locale = localeMap[code];
    if (locale)
        return (_a = locale === null || locale === void 0 ? void 0 : locale.definitions) === null || _a === void 0 ? void 0 : _a[key];
    locale = localeMap["EN"];
    if (locale)
        return (_b = locale === null || locale === void 0 ? void 0 : locale.definitions) === null || _b === void 0 ? void 0 : _b[key];
    (0, funcs_1.crash)("Missing Language Definition : ".concat(key, "."));
}
function localizef(code, key, params) {
    if (params === void 0) { params = {}; }
    var template = localize(code, key);
    return template.replace(/\$\{(.*?)\}/g, function (_, match) {
        return params[match] !== undefined ? String(params[match]) : "[missing:".concat(match, "]");
    });
}
exports.commands = (0, commands_1.commandList)({
    language: {
        args: ['language:string?'],
        description: "View or set language preferences",
        perm: commands_1.Perm.none,
        handler: (function (_a) {
            var args = _a.args, sender = _a.sender;
            if (args.language) {
                if (!isLanguageCode(args.language))
                    (0, commands_1.fail)(localizef(sender.lang, "commandLangDescription"));
                sender.lang = args.language;
                return;
            }
            else {
                (0, utils_1.outputMessage)(localizef(sender.lang, "commandLangInfo", { lang: sender.lang }), sender);
                return;
            }
        }),
    },
});
