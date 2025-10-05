/*
Copyright © BalaM314, 2025. All Rights Reserved.
Script to remap imports from '/filename' to './filename.js'.
*/

import fs from 'node:fs/promises';
import path from 'node:path';

//haha script goes brrrrr
(async function main(){
  process.chdir(path.join(__dirname, '..'));
  await fs.rm('spec/plugin', { recursive: true, force: true });
  await fs.mkdir('spec/plugin', { recursive: true });
  const allFiles = await fs.readdir('build/scripts');
  const jsFilesToRemap = allFiles.filter(f => f.endsWith('.js'));
  const dtsFilesToRemap = allFiles.filter(f => f.endsWith('.d.ts'));
  await Promise.all([...jsFilesToRemap.map(async f => {
    const data = await fs.readFile(path.join('build/scripts', f), 'utf-8');
    //why bother with a JS parser when you can just commit regex?
    const replacedData = data.replace(/ require\(["']\/(\w+)["']\)/g, ` require("./$1.js")`);
    await fs.writeFile(path.join('spec/plugin', f), replacedData, 'utf-8');
  }), ...dtsFilesToRemap.map(async f => {
    const data = await fs.readFile(path.join('build/scripts', f), 'utf-8');
    //why bother with a TS parser when you can just commit regex?
    const replacedData = data
      .replace(/^(import (?:type )?{\w*?} from) ['"]\/(\w+)['"]/gm, `$1 "./$2"`)
      .replace(/import\(["']\/(\w+)["']\)/g, `import("./$1")`);
    await fs.writeFile(path.join('spec/plugin', f), replacedData, 'utf-8');
  })]);
})();



