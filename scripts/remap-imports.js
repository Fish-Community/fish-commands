/*
Copyright © BalaM314, 2026. All Rights Reserved.
Script to remap imports from '/filename' to './filename.js'.
*/
import fs from 'node:fs/promises';
import path from 'node:path';
//haha script goes brrrrr
process.chdir(path.join(import.meta.dirname, '..'));
await fs.rm('spec/plugin', { recursive: true, force: true });
await fs.mkdir('spec/plugin', { recursive: true });
const allFiles = await fs.readdir('build/scripts', { recursive: true });
const jsFilesToRemap = allFiles.filter(f => f.endsWith('.js'));
const dtsFilesToRemap = allFiles.filter(f => f.endsWith('.d.ts'));
await Promise.all([...jsFilesToRemap.map(async (f) => {
        const data = await fs.readFile(path.join('build/scripts', f), 'utf-8');
        //why bother with a JS parser when you can just commit regex?
        const replacedData = data.replace(/require\(["']\/([\w/]+)["']\)/g, (_, path) => `require("${remapPath(path)}.js")`);
        const outPath = path.join('spec/plugin', f);
        const containingDirectory = path.join(outPath, '..');
        await fs.mkdir(containingDirectory, { recursive: true });
        await fs.writeFile(outPath, replacedData, {
            encoding: 'utf-8',
        });
    }), ...dtsFilesToRemap.map(async (f) => {
        const data = await fs.readFile(path.join('build/scripts', f), 'utf-8');
        //why bother with a TS parser when you can just commit regex?
        const replacedData = data
            .replace(/^(import (?:type )?{\w*?} from) ['"]\/([\w/]+)['"]/gm, (_, type, path) => `${type} "${remapPath(path)}"`)
            .replace(/import\(["']\/([\w/]+)["']\)/g, (_, path) => `import("${remapPath(path)}")`);
        const outPath = path.join('spec/plugin', f);
        const containingDirectory = path.join(outPath, '..');
        await fs.mkdir(containingDirectory, { recursive: true });
        await fs.writeFile(outPath, replacedData, 'utf-8');
    })]);
function remapPath(filepath) {
    return path.join(process.cwd(), "spec", "plugin", filepath);
}
