/// <reference types="../../build/scripts/mindustryTypes.d.ts" />;

import * as path from "node:path";

class Pattern {
  private constructor(public string:string){}
  regex = new RegExp(this.string);
  static compile(regex:string){
    return new this(`^${regex}$`);
  }
  static matches(regex:string, target:string):boolean {
    return new RegExp(`^${regex}$`).test(target);
  }
  matcher(text:string){
    return {
      replaceAll: (replacement:string) => {
        return text.replaceAll(this.regex, replacement);
      },
      matches: () => {
        return this.regex.test(text);
      },
      group: () => {
        throw new Error("not implemented");
      }
    }
  }
}

class ObjectIntMap<K> {
  map = new Map<K, number>;
  get(key:K){ return this.map.get(key); }
  set(key:K, value:number){ return this.map.set(key, value); }
  get size(){ return this.map.size; }
  clear(){ this.map.clear(); }
	put(key:K, value:number){ this.map.set(key, value); }
	increment(key:K){
    this.map.set(key, (this.map.get(key) ?? 0) + 1);
  }
	entries(){
    const entries = this.map.entries();
    return Object.assign(entries, {
      toArray(){
        return new Seq([...entries].map(e => ({ key: e[0], value: e[1] })));
      }
    });
  }
}

class Seq<T> {
  constructor(public items:T[] = []){}
  add(item:T){
    this.items.push(item);
    return this;
  }
  get size(){
    return this.items.length;
  }
  contains(item:T):boolean;
	contains(pred:(item:T) => boolean):boolean;
  contains(search:T | ((item:T) => boolean)){
    if(typeof search === 'function') return this.items.some(x => (search as (item:T) => boolean)(x));
    else return this.items.includes(search);
  }
	count(pred:(item:T) => boolean){
    return this.items.filter(pred).length;
  }
	retainAll(pred:(item:T) => boolean):Seq<T> {
    this.items = this.items.filter(pred);
    return this;
  }
	/** @returns whether an item was removed */
	remove(pred:(item:T) => boolean):boolean {
    const index = this.items.findIndex(i => pred(i));
    if(index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
	/** @returns whether any item was removed */
	removeAll(pred:(item:T) => boolean):Seq<T> {
    return this.retainAll(item => !pred(item));
  }
	select(pred:(item:T) => boolean):Seq<T> {
    return new Seq(this.items.filter(i => pred(i)))
  }
	find(pred:(item:T) => boolean):T | null {
    return this.items.find(i => pred(i)) ?? null;
  }
	each(func:(item:T) => unknown):void;
	each(pred:(item:T) => boolean, func:(item:T) => unknown):void;
  each(func1:(item:T) => boolean, func2?:(item:T) => unknown):void {
    this.items.forEach(i => func1(i) && func2?.(i));
  }
	isEmpty(){
    return this.items.length == 0;
  }
	map<R>(mapFunc:(item:T) => R):Seq<R> {
    return new Seq(this.items.map(i => mapFunc(i)));
  }
	toString(separator = ', ', stringifier:(item:T) => string = String):string {
    return `[${this.items.map(stringifier).join(separator)}]`;
  }
	toArray(){
    return this.items;
  }
	copy(){
    return new Seq(this.items.slice());
  }
	// sort(comparator?:(item:T) => number):Seq<T>;
	// max(comparator?:(item:T) => number):T;
	random():T | null {
    if(this.isEmpty()) return null;
    return this.items[Math.floor(Math.random() * this.size)];
  }
	get(index:number):T {
    if(index >= this.items.length) throw new Error(`ArrayIndexOutOfBoundsException: index ${index} is too high`);
    return this.items[index]!;
  }
	first():T {
    if(this.isEmpty()) throw new Error(`IllegalStateException: Array is empty.`);
    return this.items[0];
  }
  firstOpt():T | null {
    if(this.isEmpty()) return null;
    return this.items[0];
  }
	clear(){
    this.items.length = 0;
  }
}

const Directory = Symbol('Directory');
const FakeFilesystem: Record<string, string | typeof Directory> = Object.setPrototypeOf({
  "/mods/fish-commands": Directory,
}, null);

class Fi {
  constructor(public path:string){}
  exists(){
    return this.path in FakeFilesystem;
  }
  child(name:string){
    return new Fi(path.join(this.path, name));
  }
  absolutePath(){
    return this.path;
  }
  file(){
    return new JavaFile(this.path);
  }
}
const Paths = {
  get(path:string):Path {
    return new Path(path);
  }
};
class Path {
  constructor(public path:string){}
}
class JavaFile {
  constructor(public path:string){}
}
const Files = {
  isSymbolicLink(path:Path){
    return false;
  }
}

const Collections = {
  list<T>(e:Enumeration<T>){
    return new ArrayList(e.items);
  }
};
class Enumeration<T> {
  constructor(public items:T[]){}
}
class ArrayList<T> {
  constructor(public items:T[]){}
  stream(){
    return new Stream(this.items);
  }
}
class NetworkInterface {
  constructor(
    public interfaceAddresses: InterfaceAddress[],
    public loopback = false,
    public up = true,
  ){}
  getInterfaceAddresses(){ return new ArrayList(this.interfaceAddresses); }
  isUp(){ return this.up; }
  isLoopback(){ return this.loopback; }
  static getNetworkInterfaces(){
    return new Enumeration([
      new NetworkInterface([new InterfaceAddress(new Inet6Address("0:0:0:0:0:0:0:1")), new InterfaceAddress(new Inet4Address("127.0.0.1"))], true), //loopback
      new NetworkInterface([new InterfaceAddress(new Inet6Address("fe80:0:0:0:216:3eff:feaa:b35c")), new InterfaceAddress(new Inet4Address("1.2.3.4"))]), //eth0
    ]);
  }
}
class Stream<T> {
  iterator: IteratorObject<T, undefined>;
  constructor(items:T[]){
    this.iterator = items.values();
  }
  map<U>(operation:(item:T) => U){
    (this as never as Stream<U>).iterator = this.iterator.map(operation);
    return this as never as Stream<U>;
  }
  filter(operation:(item:T) => boolean){
    this.iterator = this.iterator.filter(operation);
    return this;
  }
  findFirst(){
    return new Optional<T>(this.iterator.next()?.value ?? null);
  }
}
class Optional<T> {
  constructor(public item:T | null){}
  orElse<U>(value:U){
    return this.item ?? value;
  }
}
class InterfaceAddress {
  constructor(public address: InetAddress){}
  getAddress(){ return this.address; }
}
class InetAddress {
  constructor(public hostAddress: string){}
  getHostAddress(){ return this.hostAddress; }
}
class Inet4Address extends InetAddress {}
class Inet6Address extends InetAddress {}

class InputStream {}
class OutputStream {
  write(b:number[], offset?:number, length?:number):void {
    throw new Error("not implemented");
  }
}
class DataOutputStream extends OutputStream {
	constructor(public stream:OutputStream){
    super();
  }
	writeByte(v:number):void {
    this.stream.write([v]);
  }
  writeBoolean(v:boolean):void {
    this.stream.write([Number(v)]);
  }
	writeBytes(s:string):void {
    throw new Error("unimplemented");
  }
	writeChar(v:number):void {
    throw new Error("unimplemented");
  }
	writeChars(s:string):void {
    throw new Error("unimplemented");
  }
	writeDouble(v:number):void {
    
  }
	writeFloat(v:number):void {

  }
	writeInt(v:number):void {

  }
	writeLong(v:number):void {

  }
	writeShort(v:number):void {

  }
	writeUTF(s:String):void {

  }
}
class DataInputStream extends InputStream {
	constructor(stream:InputStream){
    super();
  }
	readBoolean():boolean {
    throw new Error("not implemented");
  }
	readByte():number {
    throw new Error("not implemented");
  }
	readChar():number {
    throw new Error("not implemented");
  }
	readDouble():number {
    throw new Error("not implemented");
  }
	readFloat():number {
    throw new Error("not implemented");
  }
	readFully(b:number[], off?:number, len?:number):void {
    throw new Error("not implemented");
  }
	readInt():number {
    throw new Error("not implemented");
  }
	readLine():String {
    throw new Error("not implemented");
  }
	readLong():number {
    throw new Error("not implemented");
  }
	readShort():number {
    throw new Error("not implemented");
  }
	readUnsignedByte():number {
    throw new Error("not implemented");
  }
	readUnsignedShort():number {
    throw new Error("not implemented");
  }
	readUTF():String {
    throw new Error("not implemented");
  }
	skipBytes(n:number):number {
    throw new Error("not implemented");
  }
}
class ByteArrayInputStream extends InputStream {
  constructor(public bytes:number[]){
    super();
  }
}
class ByteArrayOutputStream extends OutputStream {
  bytes:number[] = [];
  constructor(){
    super();
  }
  write(b: number[], offset?: number, length?: number):void {
    this.bytes.push(...b);
  }
}


const triggerNames = ["shock", "cannotUpgrade", "openConsole", "blastFreeze", "impactPower", "blastGenerator", "shockwaveTowerUse", "forceProjectorBreak", "thoriumReactorOverheat", "neoplasmReact", "fireExtinguish", "acceleratorUse", "newGame", "tutorialComplete", "flameAmmo", "resupplyTurret", "turretCool", "enablePixelation", "exclusionDeath", "suicideBomb", "openWiki", "teamCoreDamage", "socketConfigChanged", "update", "beforeGameUpdate", "afterGameUpdate", "unitCommandChange", "unitCommandPosition", "unitCommandAttack", "importMod", "draw", "drawOver", "preDraw", "postDraw", "uiDrawBegin", "uiDrawEnd", "universeDrawBegin", "universeDraw", "universeDrawEnd"];
const Trigger = Object.fromEntries(triggerNames.map(k => [k, {__brand: 'trigger'} as Trigger]));

class Events {
	static events = new Map<{}, Array<(...args:any[]) => void>>();

	/** Handle an event by FooEvent. */
	static on<T extends {}>(type:T, listener: (obj:T) => void):void {
    const array = this.events.get(type) ?? (() => {
      const array: Array<(obj:any) => void> = [];
      this.events.set(type, array);
      return array;
    })();
		array.push(listener);
	}

	/** Handle an event by Trigger. */
	static run(type: Trigger, listener: () => {}):void {
    const array = this.events.get(type) ?? (() => {
      const array: Array<(obj:any) => void> = [];
      this.events.set(type, array);
      return array;
    })();
		array.push(listener);
	}

	static remove<T extends {}>(type:T, listener: (obj:T) => void):void {
    const array = this.events.get(type);
    if(array){
      this.events.set(type, array.filter(l => l !== listener));
    }
	}

	static fire(type:Trigger | Event):void {
    if('__brand' in type && type.__brand === 'trigger') this.events.get(type)?.forEach(l => l());
    else this.events.get(type.constructor)?.forEach(l => l(type));
	}

	static clear():void {
		this.events.clear();
	}
}

const zeroDataEvents = ['WinEvent', 'LoseEvent', 'ResizeEvent', 'MapMakeEvent', 'MapPublishEvent', 'SaveWriteEvent', 'ClientCreateEvent', 'ServerLoadEvent', 'DisposeEvent', 'PlayEvent', 'ResetEvent', 'HostEvent', 'WaveEvent', 'TurnEvent', 'LineConfirmEvent', 'TurretAmmoDeliverEvent', 'CoreItemDeliverEvent', 'BlockInfoEvent', 'ContentInitEvent', 'AtlasPackEvent', 'ModContentLoadEvent', 'ClientLoadEvent', 'MusicRegisterEvent', 'FileTreeInitEvent', 'WorldLoadEvent', 'WorldLoadBeginEvent', 'WorldLoadEndEvent'];
const EventType = {
  ...Object.fromEntries(zeroDataEvents.map(name => [name, Object.defineProperty(class {}, 'name', { value: name })])),
  ConnectionEvent: class {
    constructor(public connection: NetConnection){}
  },
  ConnectPacketEvent: class {
    constructor(public connection: NetConnection, public packet: ConnectPacket){}
  },
  PlayerConnect: class {
    constructor(public player: Player){}
  },
  PlayerJoin: class {
    constructor(public player: Player){}
  },
  PlayerLeave: class {
    constructor(public player: Player){}
  },
  UnitChangeEvent: class {
    constructor(public player: Player, public unit: Unit){}
  },
  PlayerChatEvent: class {
    constructor(public player: Player, public message: string){}
  },
  TapEvent: class {
    constructor(public player: Player, public tile: Tile){}
  },
  GameOverEvent: class {
    constructor(public team: Team){}
  },
  SaveLoadEvent: class {
    constructor(public isMap: boolean){}
  },
};

const Timer = {
  schedule(func:() => unknown, delaySeconds:number, intervalSeconds?:number, repeatCount?:number):TimerTask {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout = setTimeout(() => {
      if(intervalSeconds){
        let repeats = 0;
        interval = setInterval(() => {
          if(repeatCount != undefined && repeats < repeatCount){
            clearInterval(interval!);
            return;
          }
          repeats ++;
          func();
        }, intervalSeconds * 1000);
      } else {
        func();
      }
    }, delaySeconds * 1000);
    return {cancel(){
      if(interval != null) clearInterval(interval);
      clearTimeout(timeout);
    }};
  }
};

class EffectCallPacket2 {
	effect:Effect | null = null;
	x:number = 0;
	y:number = 0;
	rotation:number = 0;
	color:Color | null = null;
	data:any = null;
}
class LabelReliableCallPacket {
	message:string | null = null;
	duration:number = 0;
	worldx:number = 0;
	worldy:number = 0;
}
class CommandRunner<T> {
  constructor(public accept: (args:string[], parameter: T) => void){}
}
class CommandHandler {
  commands = new Map<string, Command>();
  constructor(public prefix: string){}
  removeCommand(name:string){
    this.commands.delete(name);
  }
  register<T>(text:string, params:string, description:string, runner:CommandRunner<T>){

  }
  static CommandRunner = CommandRunner;
}
class Gamemode {
  static all: Gamemode[] = [];
  
  static survival = new Gamemode("survival");
  static sandbox = new Gamemode("sandbox");
  static attack = new Gamemode("attack");
  static pvp = new Gamemode("pvp");
  static editor = new Gamemode("editor", true);
  
  constructor(
    public _name: string,
    public hidden = false,
    private rules: ((rules:Rules) => void) | null = null,
    private validator: ((map:MMap) => boolean) | null = null,
  ){
    Gamemode.all.push(this);
  }
  name(){
    return this._name;
  }
}
class Rules {
	constructor(){}
	mode(){
    if(this.pvp){
      return Gamemode.pvp;
    }else if(this.editor){
      return Gamemode.editor;
    }else if(this.attackMode){
      return Gamemode.attack;
    }else if(this.infiniteResources){
      return Gamemode.sandbox;
    }else{
      return Gamemode.survival;
    }
  }
	getClass(){
    return Rules;
  }
	defaultTeam = Team.derelict;
	waveTeam = Team.crux;
	waves = true;
	waitEnemies = false;
	env = 233;
	fog = false
	pvpAutoPause = true;
	placeRangeCheck = false;
	onlyDepositCore = false;
	attackMode = true;
	pvp = false;
  infiniteResources = false;
  editor = false;
}
class Color {
	constructor(public r:number, public g:number, public b:number, public a:number = 1){}
  static valueOf(hexCodes:string){
    if(hexCodes.startsWith('#')) hexCodes = hexCodes.slice(1);
    return new Color(...(hexCodes.split(/(?<=^(?:.{2}|.{4}|.{6}))/g).map(x => parseInt(x, 16)) as [number, number, number, number?]));
  }
  cpy(){
    return new Color(this.r, this.g, this.b, this.a);
  }
}
const Pal = {
  accent: Color.valueOf("ffd37f"),
};
class Team {
	static all = new Array<Team>();
	static baseTeams = new Array<Team>();

	static derelict = new Team(0, "derelict", Color.valueOf("4d4e58"));
  static sharded = new Team(1, "sharded", Pal.accent.cpy());
  static crux = new Team(2, "crux", Color.valueOf("f25555"));
  static malis = new Team(3, "malis", Color.valueOf("a27ce5"));
  static green = new Team(4, "green", Color.valueOf("54d67d"));
  static blue = new Team(5, "blue", Color.valueOf("6c87fd"));
  static neoplastic = new Team(6, "neoplastic", Color.valueOf("e05438"));
  constructor(public id: number, public name: string, public color: Color){
    Team.all.push(this);
    Team.baseTeams[id] = this;
  }
	active(){
    return true;
  }
	data(){
    return {};
  }
	coloredName():string {
    return `[#${this.color.toString()}]${this.name}`;
  }
	static get(index:number){
    return Team.all[index] ?? (() => {
      throw new Error('array index out of bounds');
    });
  }
	cores(){
    return new Seq();
  }
}
type ChatFilter = (player:Player, message:string) => string | null;
type ActionFilter = (action:PlayerAction) => boolean;
class Administration {
  chatFilters = new Seq<ChatFilter>();
  actionFilters = new Seq<ActionFilter>();
  addChatFilter(filter:ChatFilter){
    this.chatFilters.add(filter);
  }
  addActionFilter(filter:ActionFilter){
    this.actionFilters.add(filter);
  }
}
class MMap {
  
}
class ServerControl {
  static instance = new ServerControl();

  handler = new CommandHandler("");
}
const Vars = {
	logic: {
		skipWave(){}
	},
	netServer: {
		admins: new Administration(),
		clientCommands: new CommandHandler("/"),
		kickAll(kickReason:any){},
		addPacketHandler(name:string, handler:(player:mindustryPlayer, content:string) => unknown){},
		currentlyKicking: null,
		votesRequired(){
      return 2 + (Groups.player.size() > 4 ? 1 : 0);
    },
	},
	net: {
		send(object:any, reliable:boolean){},
	},
	mods: {
		getScripts(){
      return {};
    },
	},
	maps: {
    setNextMapOverride(map:MMap){},
    all():Seq<MMap> {
      return new Seq();
    },
    customMaps():Seq<MMap> {
      return new Seq();
    },
    byName(name:string):MMap | null {
      return new MMap();
    },
    reload(){},
    saveMap(baseTags:MapTags):MMap {
      return new MMap();
    },
  },
	state: {
		rules: new Rules(),
		set(state:State){},
		gameOver: false,
		wave: 0,
		map: new MMap(),
		isMenu(){
      return false;
    },
		wavetime: 0,
		enemies: 1,
		/** Time in ticks, 60/s */
		tick: 0,
	},
	saveExtension: "msav",
	saveDirectory: new Fi('/saves'),
	modDirectory: new Fi('/mods'),
	customMapDirectory: new Fi('/maps'),
	content: {

  },
	tilesize: 8,
	world: {

  },
};
class Settings {
  values = Object.create(null) as Record<string, unknown>;
  getString(key:string){
    const value = this.values[key];
    if(value != null && typeof value !== 'string') throw new Error('ClassCastException: cannot convert value to string');
    return value;
  }
  get(key:string, defaultValue:string | null = null):unknown {
    return this.values[key] ?? defaultValue;
  }
  getBytes(key:string, defaultValue:number[] | null = null):number[] | null {
    const value = this.values[key] ?? defaultValue;
    if(value != null && !Array.isArray(value)) throw new Error('ClassCastException: cannot convert value to byte[]');
    return value;
  }
  has(key:string){
    return key in this.values;
  }
  put(key:string, value:unknown){
    this.values[key] = value;
  }
}
const Core = {
  app: {
    post: queueMicrotask,
    listeners: Array<ApplicationListener>(),
    addListener(listener:ApplicationListener){
      this.listeners.push(listener);
    },
    dispose(){
      this.listeners.forEach(l => {
        l.pause?.();
        l.dispose?.();
      });
    }
  },
  settings: new Settings(),
};
const Log = {
  info(...args:unknown[]){
    console.log('[I] ', ...args);
  },
  warn(...args:unknown[]){
    console.log('[W] ', ...args);
  },
  err(...args:unknown[]){
    console.error('[E] ', ...args);
  },
};
const Menus = {
  menuListeners: new Seq<BuiltinMenuListener>(),
  registerMenu(listener:BuiltinMenuListener){
    this.menuListeners.add(listener);
    return this.menuListeners.size - 1;
  }
};
const programStart = Date.now();
const Time = {
	millis(){
    return Date.now() - programStart;
  },
	setDeltaProvider(provider: () => number){},
}
class Effect {}
const Fx = {
  pointBeam: new Effect(),
  dynamicSpikes: new Effect(),
  dynamicExplosion: new Effect(),
};
class Vec2 {
	constructor(public x:number, public y:number){}
	set(v:Vec2):Vec2;
	set(x:number, y:number):Vec2;
  set(arg0:Vec2 | number, y?:number):Vec2 {
    if(arg0 instanceof Vec2){
      this.x = arg0.x;
      this.y = arg0.y;
    } else {
      this.x = arg0;
      this.y = y!;
    }
    return this;
  }
}
const Tmp = {
  c1: new Color(0, 0, 0),
  v1: new Vec2(0, 0),
};
const Threads = {
  //Cannot be accurately implemented in JS
  daemon(runnable:() => {}){
    queueMicrotask(runnable);
  }
};



const Packages = {
  java: {
    net: { NetworkInterface, Inet4Address },
    util: { Collections },
    nio: {
      file: { Path, Paths, File: JavaFile, Files },
    }
  },
  mindustry: {
    gen: { Map: MMap }
  }
};
Object.assign(globalThis, {Pattern, ObjectIntMap, Seq, Fi, Packages, Events, Trigger, Team, EventType, Timer, EffectCallPacket2, LabelReliableCallPacket, Vars, ServerControl, Core, Log, Menus, Time, CommandHandler, Gamemode, Fx, Effect, Vec2, Tmp, Paths, Path, Threads});
