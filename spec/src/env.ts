/// <reference types="../../build/scripts/mindustryTypes.d.ts" />;

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
  constructor(public items:T[]){}
}

class Fi {
  constructor(public path:string){}
  exists(){
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

const Packages = {
  java: {
    net: { NetworkInterface, Inet4Address },
    util: { Collections }
  }
};


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
  ...zeroDataEvents.map(name => Object.defineProperty(class {}, 'name', { value: name })),
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

Object.assign(globalThis, {Pattern, ObjectIntMap, Seq, Fi, Packages, Events, Trigger, EventType, Timer, EffectCallPacket2, LabelReliableCallPacket});
