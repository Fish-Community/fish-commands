/*
Copyright © BalaM314, 2026. All Rights Reserved.
This is a special file which is automatically loaded by the game server.
It only contains polyfills, and requires index.js.
*/
//WARNING: changes to this file must be manually copied to /build/scripts/main.js

importPackage(Packages.arc);
importClass(Packages.arc.util.CommandHandler);
importPackage(Packages.mindustry.type);
importClass(Packages.mindustry.server.ServerControl);
importPackage(Packages.java.util.regex);
importClass(Packages.java.lang.Runtime);
importClass(Packages.java.lang.ProcessBuilder);
importClass(Packages.java.nio.file.Paths);
importClass(Packages.java.io.ByteArrayOutputStream);
importClass(Packages.java.io.DataOutputStream);
importClass(Packages.java.io.ByteArrayInputStream);
importClass(Packages.java.io.DataInputStream);

//Polyfills
Object.entries = o => Object.keys(o).map(k => [k, o[k]]);
Object.values = o => Object.keys(o).map(k => o[k]);
Object.fromEntries = a => a.reduce((o, [k, v]) => { o[k] = v; return o; }, {});
//Arrow functions do not bind to "this"
Array.prototype.at = function(i){
	return this[i < 0 ? this.length + i : i];
};
String.prototype.at = function(i){
	return this[i < 0 ? this.length + i : i];
};
Array.prototype.flat = function(depth){
	depth = (depth == undefined) ? 1 : depth;
	return depth > 0 ? this.reduce((acc, item) =>
		acc.concat(Array.isArray(item) ? item.flat(depth - 1) : item)
	, []) : this;
};
String.raw = function(callSite){
	const substitutions = Array.prototype.slice.call(arguments, 1);
	return Array.from(callSite.raw).map((chunk, i) => {
		if (callSite.raw.length <= i) {
			return chunk;
		}
		return substitutions[i - 1] ? substitutions[i - 1] + chunk : chunk;
	}).join('');
};
const Arrayfrom = Array.from;
Array.from = function(iterable, mapfn){
	if(mapfn) throw new Error(`Array.from does not work with mapfn due to incorrectly generating sparse arrays. Please use Array(length).fill().map() instead.`);
	return Arrayfrom(iterable);
};
//Fix rhino regex
if(/ae?a/.test("aeea")){
	RegExp.prototype.test = function(input){
		//overwrite with java regex
		return java.util.regex.Pattern.compile(this.source).matcher(input).find();
	};
}
//Fix rhino Number.prototype.toFixed
if(12.34.toFixed(1) !== '12.3'){
	const toFixed = Number.prototype.toFixed;
	Number.prototype.toFixed = function(fractionDigits){
		const floorLog = Math.floor(Math.log10(this));
		const output = toFixed.call(this, Math.max(floorLog, -1) + 1 + fractionDigits);
		return output.toString().slice(0, Math.max(floorLog, 0) + 2 + fractionDigits);
	};
}

this.ArcReflect = Reflect;
this.Promise = require('/promise').Promise;
require("index");
