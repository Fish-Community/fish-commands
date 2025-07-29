/**
 * Contains functionality for the localization of FishCommands
*/

import { commandList, fail, Perm } from "./commands";
import { crash } from "./funcs";
import { Rank } from "./ranks";
import { outputMessage, outputSuccess } from "./utils";


export type TranslationBundle = {
    info: {
        name_en: string; // English name for the Locale
        name_native: string; // Native name for the Locale
        code: string; // ISO 639 Locale code
        maintainer: string; // Contributers responsible for maintaining said translation
        quickfox: string; // Debug string used for testing
    };
    definitions: {
        commandLangDescription:string
        commandLangNoLangCodeFound:string
        commandLangChangeSuccess:string
        commandSetLangNoLangCodeFound:string
        commandSetLangDescription:string
        commandSetLangSuccess:string
        commandSetLangFail:string
        commandSetLangLanguageChanged:string
    }
};


const Locales = [
    {
        info:{
            name_en:"English",
            name_native:"English",
            code:"EN",
            maintainer:"Various",
            quickfox:"The quick brown fox jumps over the lazy dog"
        },
        definitions:{
            commandLangChangeSuccess:"Language now set to ${lang}.",
            commandLangInfo:"Your Current Language is Set to ${lang}. To change it, type [red]/lang [language][].",
            commandLangNoLangCodeFound:"Language ${args.language} not found.",
            commandSetLangNoLangCodeFound:"Language ${args.language} not found.",
            commandSetLangFailNotFound:"Player ${target} not found",
            commandSetLangFailPerm:"You do not have permission to change the language of other players.",
            commandSetLangSuccess:"Successfully Set ${target}'s language to ${lang}.",
            commandSetLangLanguageChanged:"Your language has been forcfully set to ${lang}"
        }
    },
    {
        info:{
            name_en:"Pig Latin",
            name_native:"igpay atinlay",
            code:"PL", // not up to ISO 639, but I do not really care :/
            maintainer:"JurorNo9",
            quickfox:"ethay uickqay ownbray oxfay umpsjay overyay ethay azylay ogday"
        },
        definitions:{
        }
    }
] as const;

type LocalesType = typeof Locales;
export const validLanguageCodes = Locales.map(l => l.info.code);
export type LanguageCode = typeof validLanguageCodes[number];
type Definitions = NonNullable<LocalesType[number]["definitions"]>;
type DefinitionKey = LocalesType[number]["definitions"] extends infer D ? D extends object ? keyof D : never : never;
const localeMap: Record<LanguageCode, TranslationBundle> = Object.fromEntries(Locales.map((l) => [l.info.code, l])) as Record<LanguageCode, TranslationBundle>;



export function isLanguageCode(str:string): str is LanguageCode{
    return validLanguageCodes.includes(str as LanguageCode);
}

export function localize( code: LanguageCode, key: DefinitionKey ): string {
    let locale = localeMap[code];
    if (locale) return locale?.definitions?.[key];
    locale = localeMap["EN"]
    if (locale) return locale?.definitions?.[key];
    crash(`Missing Language Definition : ${key}.`)
}
export function localizef( code: LanguageCode, key: DefinitionKey, params: Record<string, string | number> = {}): string{
    const template = localize(code, key);
    return template.replace(/\$\{(.*?)\}/g, (_, match) =>
    params[match] !== undefined ? String(params[match]) : `[missing:${match}]`
  );
}

export const commands = commandList({
    language:{
        args: ['language:string?'],
        description: "View or set language preferences",
        perm: Perm.none,
        handler:(({args, sender}) =>{
            if(args.language){
                if(!isLanguageCode(args.language)) fail(localizef(sender.lang, "commandLangNoLangCodeFound", {lang:sender.lang}),)
                sender.lang = args.language;
                return;
            } else {
                outputMessage(localizef(sender.lang, "commandLangInfo", {lang:sender.lang}), sender);
                return;
            }
        }),
    },
    setlanguage:{
        args: ['target:player', "language:string"],
        description: "Set the language of another fish player",
        perm: Perm.none,
        handler({sender, args}){
            if(sender.ranksAtLeast(Rank.mod) && sender.canModerate(args.target,true)){
                if(!isLanguageCode(args.language)) fail(localizef(sender.lang, "commandSetLangNoLangCodeFound", {lang:sender.lang}),)
                args.target.lang = args.language;
                outputSuccess(localizef(sender.lang,"commandSetLangSuccess",{target:args.target.name, lang:args.language}), sender)
                outputMessage(localizef(sender.lang,"commandSetLangLanguageChanged", {lang:args.language}), args.target)
            }
            fail(localizef(sender.lang,"commandSetLangFailPerm"))
        }
    }
})
