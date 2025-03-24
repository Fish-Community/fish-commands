
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

const Packages = {
  java: {
    net: { NetworkInterface, Inet4Address },
    util: { Collections }
  }
};

Object.assign(globalThis, {Pattern, ObjectIntMap, Seq, Fi, Packages});
