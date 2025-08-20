"use strict";
/*
Copyright © BalaM314, 2025. All Rights Reserved.
Script to remap imports from '/filename' to './filename.js'.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
(async function main() {
    process.chdir(node_path_1.default.join(__dirname, '..'));
    await promises_1.default.rm('spec/plugin', { recursive: true, force: true });
    await promises_1.default.mkdir('spec/plugin', { recursive: true });
    const allFiles = await promises_1.default.readdir('build/scripts');
    const jsFilesToRemap = allFiles.filter(f => f.endsWith('.js'));
    const dtsFilesToRemap = allFiles.filter(f => f.endsWith('.d.ts'));
    await Promise.all([...jsFilesToRemap.map(async (f) => {
            const data = await promises_1.default.readFile(node_path_1.default.join('build/scripts', f), 'utf-8');
            //why bother with a JS parser when you can just commit regex?
            const replacedData = data.replace(/ require\(["']\/(\w+)["']\)/g, ` require("./$1.js")`);
            await promises_1.default.writeFile(node_path_1.default.join('spec/plugin', f), replacedData, 'utf-8');
        }), ...dtsFilesToRemap.map(async (f) => {
            const data = await promises_1.default.readFile(node_path_1.default.join('build/scripts', f), 'utf-8');
            //why bother with a TS parser when you can just commit regex?
            const replacedData = data
                .replace(/^(import (?:type )?{\w*?} from) ['"]\/(\w+)['"]/gm, `$1 "./$2"`)
                .replace(/import\(["']\/(\w+)["']\)/g, `import("./$1")`);
            await promises_1.default.writeFile(node_path_1.default.join('spec/plugin', f), replacedData, 'utf-8');
        })]);
})();
