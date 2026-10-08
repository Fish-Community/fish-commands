import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "yopta";
import { runtimeToYopta, yoptaToRuntime } from "./yopta-dictionary.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(rootDirectory, "src");
const outputDirectory = path.join(rootDirectory, "build", "scripts");
const compile = globalThis.yopta;

if(typeof compile !== "function") throw new Error("The YoptaScript compiler did not load.");

function protectStrings(source) {
	const values = [];
	let output = "";
	let index = 0;
	let previousToken = "";
	while(index < source.length){
		const quote = source[index];
		if(quote === "\"" || quote === "'" || quote === "`"){
			const start = index++;
			while(index < source.length){
				if(source[index] === "\\"){
					index += 2;
					continue;
				}
				if(source[index] === quote){
					index++;
					break;
				}
				index++;
			}
			const token = `__YOPTA_LITERAL_${values.length}__`;
			values.push([token, source.slice(start, index)]);
			output += token;
			previousToken = "literal";
		} else if(quote === "/" && source[index + 1] !== "/" && source[index + 1] !== "*" && startsRegularExpression(previousToken)){
			const start = index++;
			let inCharacterClass = false;
			while(index < source.length){
				if(source[index] === "\\"){
					index += 2;
					continue;
				}
				if(source[index] === "[") inCharacterClass = true;
				if(source[index] === "]") inCharacterClass = false;
				if(source[index] === "/" && !inCharacterClass){
					index++;
					while(/[a-z]/i.test(source[index] || "")) index++;
					break;
				}
				index++;
			}
			const token = `__YOPTA_LITERAL_${values.length}__`;
			values.push([token, source.slice(start, index)]);
			output += token;
			previousToken = "literal";
		} else {
			const character = source[index++];
			output += character;
			if(!/\s/.test(character)){
				if(/[A-Za-z_$\p{L}]/u.test(character)){
					let word = character;
					while(/[\w$\p{L}\p{M}]/u.test(source[index] || "")) word += source[index++], output += source[index - 1];
					previousToken = word;
				} else previousToken = character;
			}
		}
	}
	return [output, values];
}

function startsRegularExpression(previousToken) {
	return !previousToken || /^(?:[({[,:;=!?&|+\-*%^~<>]|return|case|throw|delete|typeof|void|in|of|yield|await|отвечаю|чобля|пнх|ёбнуть|ебнуть|эквалио|ичо|иличо|внатуре)$/.test(previousToken);
}

function compileSafely(source) {
	const [protectedSource, values] = protectStrings(source);
	let output = compile(protectedSource, "ys");
	for(const [token, value] of values){
		output = output.replaceAll(token, () => value);
	}
	return output;
}

function replaceIdentifiers(source, replacements) {
	const [protectedSource, values] = protectStrings(source);
	const identifiers = /(?<![\w$\p{L}\p{M}])([\w$\p{L}][\w$\p{L}\p{M}]*)(?![\w$\p{L}\p{M}])/gu;
	let output = protectedSource.replace(identifiers, (identifier, name) => {
		if(Object.hasOwn(replacements, name)) return replacements[name];
		if(name.startsWith("чобля") && Object.hasOwn(replacements, name.slice("чобля".length))){
			return `чобля${replacements[name.slice("чобля".length)]}`;
		}
		return identifier;
	});
	for(const [token, value] of values){
		output = output.replaceAll(token, () => value);
	}
	return output;
}

async function findYoptaFiles(directory) {
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const files = await Promise.all(entries.map(async entry => {
		const file = path.join(directory, entry.name);
		return entry.isDirectory() ? findYoptaFiles(file) : entry.name.endsWith(".yopta") ? [file] : [];
	}));
	return files.flat();
}

await fs.rm(outputDirectory, { recursive: true, force: true });
await fs.mkdir(outputDirectory, { recursive: true });
await fs.copyFile(path.join(sourceDirectory, "main.js"), path.join(outputDirectory, "main.js"));

const sourceFiles = (await findYoptaFiles(sourceDirectory)).sort();
for(const sourceFile of sourceFiles){
	const relativePath = path.relative(sourceDirectory, sourceFile).replace(/\.yopta$/, ".js");
	const outputPath = path.join(outputDirectory, relativePath);
	const yoptaSource = await fs.readFile(sourceFile, "utf8");
	const sourceWithCustomNames = replaceIdentifiers(yoptaSource, runtimeToYopta);
	const compiled = compileSafely(sourceWithCustomNames);
	const javascript = replaceIdentifiers(compiled, yoptaToRuntime);
	await fs.mkdir(path.dirname(outputPath), { recursive: true });
	await fs.writeFile(outputPath, javascript);
}

console.log(`Compiled ${sourceFiles.length} YoptaScript modules into build/scripts.`);
