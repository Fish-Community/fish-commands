"use strict";
/**
 * Contains functionality for the localization of FishCommands
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.validLanguageCodes = void 0;
exports.isLanguageCode = isLanguageCode;
exports.localize = localize;
exports.localizef = localizef;
exports.ENlocalize = ENlocalize;
exports.ENlocalizef = ENlocalizef;
var commands_1 = require("./commands");
var funcs_1 = require("./funcs");
var ranks_1 = require("./ranks");
var utils_1 = require("./utils");
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
            commandLangChangeSuccess: "Language now set to ${lang}.",
            commandLangInfo: "Your Current Language is Set to ${lang}. To change it, type [red]/lang [language][].",
            commandLangNoLangCodeFound: "Language ${args.language} not found.",
            commandSetLangNoLangCodeFound: "Language ${args.language} not found.",
            commandSetLangFailNotFound: "Player ${target} not found",
            commandSetLangFailPerm: "You do not have permission to change the language of other players.",
            commandSetLangSuccess: "Successfully Set ${target}'s language to ${lang}.",
            commandSetLangLanguageChanged: "Your language has been forcfully set to ${lang}"
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
        definitions: {}
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
function getKeyFromEnglishTemplate(template) {
    var enDefinitions = localeMap["EN"].definitions;
    for (var key in enDefinitions) {
        if (enDefinitions[key] === template) {
            return key;
        }
    }
    return undefined;
}
function ENlocalize(code, englishTemplate) {
    var key = getKeyFromEnglishTemplate(englishTemplate);
    if (!key) {
        (0, funcs_1.crash)("Could not find matching key for English template: \"".concat(englishTemplate, "\""));
    }
    return localize(code, key);
}
function ENlocalizef(code, englishTemplate, params) {
    if (params === void 0) { params = {}; }
    var key = getKeyFromEnglishTemplate(englishTemplate);
    if (!key) {
        (0, funcs_1.crash)("Could not find matching key for English template: \"".concat(englishTemplate, "\""));
    }
    return localizef(code, key, params);
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
                    (0, commands_1.fail)(ENlocalizef(sender.lang, "Language ${lang} not found.", { lang: sender.lang }));
                sender.lang = args.language;
                (0, utils_1.outputSuccess)(ENlocalizef(sender.lang, "Language now set to ${lang}.", { lang: sender.lang }), sender);
                return;
            }
            else {
                (0, utils_1.outputMessage)(ENlocalizef(sender.lang, "Your Current Language is Set to ${lang}. To change it, type [red]/lang [language][].", { lang: sender.lang }), sender);
                return;
            }
        }),
    },
    setlanguage: {
        args: ['target:player', "language:string"],
        description: "Set the language of another fish player",
        perm: commands_1.Perm.none,
        handler: function (_a) {
            var sender = _a.sender, args = _a.args;
            if (sender.ranksAtLeast(ranks_1.Rank.mod) && sender.canModerate(args.target, true)) {
                if (!isLanguageCode(args.language))
                    (0, commands_1.fail)(localizef(sender.lang, "commandSetLangNoLangCodeFound", { lang: sender.lang }));
                args.target.lang = args.language;
                (0, utils_1.outputSuccess)(localizef(sender.lang, "commandSetLangSuccess", { target: args.target.name, lang: args.language }), sender);
                (0, utils_1.outputMessage)(localizef(sender.lang, "commandSetLangLanguageChanged", { lang: args.language }), args.target);
            }
            (0, commands_1.fail)(localizef(sender.lang, "commandSetLangFailPerm"));
        }
    }
});
