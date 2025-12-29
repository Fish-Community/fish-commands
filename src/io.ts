import { crash, lazy } from "/funcs";
import { FishEvents } from "/globals";


export class DataClass<T extends Serializable> {
	_brand!: symbol;
	constructor(data:T){
		Object.assign(this, data);
	}
}
export function dataClass<T extends Serializable>(){
	return DataClass as new (data:T) => (DataClass<T> & T);
}

//Java does not support u64
export type NumberRepresentation = "i8" | "i16" | "i32" | "i64" | "u8" | "u16" | "u32" | "f32" | "f64";

export type SerializablePrimitive = string | number | boolean | Team;
export type SerializableDataClassConstructor<ClassInstance extends {}> = new (data:SerializableData<ClassInstance>) => ClassInstance;

export type Serializable = SerializablePrimitive | Serializable[] | {
	[index: string]: Serializable;
} | DataClass<Serializable>;

export type PrimitiveSchema<T extends SerializablePrimitive> =
	T extends string ? ["string"] :
	T extends number ? ["number", bytes:NumberRepresentation] :
	T extends boolean ? ["boolean"] :
	T extends Team ? ["team"] :
never;
export type ArraySchema<T extends Serializable[]> =
	["array", length:number extends T["length"] ? NumberRepresentation & `u${string}` | number : T["length"], element:Schema<T[number]>];
export type ObjectSchema<T extends Record<string, Serializable>> =
	["object", children:Array<keyof T extends infer KT extends keyof T ? KT extends unknown ? [KT, Schema<T[KT]>] : never : never>];
export type DataClassSchema<ClassInstance extends {}> =
	["class", clazz: new (data:any) => ClassInstance, children:Array<
		SerializableData<ClassInstance> extends infer Data extends Record<string, Serializable> ?
			keyof Data extends infer KU extends keyof Data ? KU extends unknown ? [KU, Schema<Data[KU]>] : never : never
		: never
	>];
export type VersionSchema<T extends Serializable> = ["version", number:number, rest:Schema<T, false>];

export type Schema<T extends Serializable, AllowVersion = true> = (
	T extends SerializablePrimitive ? PrimitiveSchema<T> :
	T extends Serializable[] ? ArraySchema<T> :
	T extends infer ClassInstance extends DataClass<Serializable> ? DataClassSchema<ClassInstance> :
	T extends Record<string, Serializable> ? ObjectSchema<T> :
never) | (AllowVersion extends true ? VersionSchema<T> : never);



export type SerializableData<T extends {}> = {
	[K in keyof T extends infer KT extends keyof T ? KT extends unknown ?
		T[KT] extends Serializable ? KT : never
	: never : never]: T[K];
};

function checkBounds(type:NumberRepresentation, value:number, min:number, max:number){
	if(value < min){
		Log.warn(`Integer underflow when serializing ${type}: value ${value} was less than ${min}`);
		return min;
	}
	if(value >= max){
		Log.warn(`Integer overflow when serializing ${type}: value ${value} was greater than ${max}`);
		return max;
	}
	return value;
}

export class Serializer<T extends Serializable> {
	constructor(
		public schema: Schema<T>,
		public oldSchema?: Schema<T>,
	){}
	write(object:T, output:DataOutputStream):void {
		Serializer.writeNode(this.schema, object, output);
	}
	read(input:DataInputStream):T {
		input.mark(0xFFFF); //1MB
		try {
			return Serializer.readNode(this.schema, input);
		} catch(err){
			Log.warn(`Using fallback schema: this message should go away after a restart`);
			input.reset();
			if(this.oldSchema) return Serializer.readNode(this.oldSchema, input);
			else throw err;
		}
	}
	/** SAFETY: Data must not be a union */
	static writeNode<Data extends Serializable>(schema:Schema<Data>, object:Data, output:DataOutputStream):void;
	static writeNode<Data extends Serializable>(schema:Schema<Data>, value:never, output:DataOutputStream){
		const checkNumbers = false;
		switch(schema[0]){
			case 'string':
				output.writeUTF(value);
				break;
			case 'number':
				if(checkNumbers){
					switch(schema[1]){
						case 'u8': output.writeByte(checkBounds(schema[1], value, 0, 2**8)); break;
						case 'u16': output.writeShort(checkBounds(schema[1], value, 0, 2**16)); break;
						case 'u32': output.writeInt(checkBounds(schema[1], value, 0, 2**32) & 0xFFFFFFFF); break;
						case 'i8': output.writeByte(checkBounds(schema[1], value, -(2**7), (2**7))); break;
						case 'i16': output.writeShort(checkBounds(schema[1], value, -(2**15), (2**15))); break;
						case 'i32': output.writeInt(checkBounds(schema[1], value, -(2**31), (2**31))); break;
						case 'i64': output.writeLong(checkBounds(schema[1], value, -(2**63), (2**63))); break;
						case 'f32': output.writeFloat(isNaN(value) || !isFinite(value) ? (Log.warn('Attempted to write a NaN floating-point value, defaulting to 0'), 0) : value); break;
						case 'f64': output.writeDouble(isNaN(value) || !isFinite(value) ? (Log.warn('Attempted to write a NaN floating-point value, defaulting to 0'), 0) : value); break;
					}
				} else {
					switch(schema[1]){
						case 'u8': output.writeByte(value); break;
						case 'u16': output.writeShort(value); break;
						case 'u32': output.writeInt(value & 0xFFFFFFFF); break; //If the value is greater than 0x7FFFFFFF, make it negative so Java writes it correctly
						case 'i8': output.writeByte(value); break;
						case 'i16': output.writeShort(value); break;
						case 'i32': output.writeInt(value); break;
						case 'i64': output.writeLong(value); break;
						case 'f32': output.writeFloat(value); break;
						case 'f64': output.writeDouble(value); break;
					}	
				}
				break;
			case 'boolean':
				output.writeBoolean(value);
				break;
			case 'team':
				if(!value) Log.err(`attempting to serialize a Team, but it was null`); //temporary debug message
				output.writeByte((value as Team).id);
				break;
			case 'object':
				for(const [key, childSchema] of schema[1]){
					//correspondence
					this.writeNode<Serializable[]>(childSchema as ArraySchema<Serializable[]>, value[key], output);
				}
				break;
			case 'class':
				for(const [key, childSchema] of schema[2] as Array<[string, Schema<Serializable>]>){
					//correspondence
					this.writeNode<Serializable[]>(childSchema as ArraySchema<Serializable[]>, value[key], output);
				}
				break;
			case 'array':
				if(typeof schema[1] == "string"){
					this.writeNode(["number", schema[1]], (value as Serializable[]).length, output);
				} else {
					if(schema[1] !== (value as Serializable[]).length){
						Log.err('SERIALIZATION WARNING: received invalid data: array with greater length than specified by schema');
						(value as Serializable[]).length = schema[1];
					}
				}
				// eslint-disable-next-line @typescript-eslint/prefer-for-of
				for(let i = 0; i < (value as Serializable[]).length; i ++){
					this.writeNode(schema[2], (value as Serializable[])[i], output);
				}
				break;
			case 'version':
				output.writeByte(schema[1]);
				this.writeNode<Data>(schema[2], value, output);
				break;
		}
	}
	/** SAFETY: Data must not be a union */
	static readNode<Data extends Serializable>(schema:Schema<Data>, input:DataInputStream):Data;
	static readNode<Data extends Serializable>(schema:Schema<Data>, input:DataInputStream):unknown {
		switch(schema[0]){
			case 'string':
				return input.readUTF();
			case 'number':
				switch(schema[1]){
					case 'u8': return input.readUnsignedByte();
					case 'u16': return input.readUnsignedShort();
					case 'u32': {
						const value = input.readInt(); //Java does not support unsigned ints
						return value < 0 ? value + 2**32 : value;
					}
					case 'i8': return input.readByte();
					case 'i16': return input.readShort();
					case 'i32': return input.readInt();
					case 'i64': return input.readLong();
					case 'f32': return input.readFloat();
					case 'f64': return input.readDouble();
				}
				schema[1] satisfies never;
				break;
			case 'boolean':
				return input.readBoolean();
			case 'team':
				return Team.all[input.readByte()];
			case 'object': {
				const output:Record<string, Serializable> = {};
				for(const [key, childSchema] of schema[1]){
					output[key] = this.readNode<Serializable>(childSchema, input);
				}
				return output;
			}
			case 'class': {
				const classData:Record<string, Serializable> = {};
				for(const [key, childSchema] of schema[2] as Array<[string, Schema<Serializable>]>){
					classData[key] = this.readNode<Serializable>(childSchema, input);
				}
				return new schema[1](classData);
			}
			case 'array': {
				const length = typeof schema[1] === "number" ?
					schema[1]
				: this.readNode<number>(["number", schema[1]], input);
				const array = new Array<Serializable>(length);
				for(let i = 0; i < length; i ++){
					array[i] = this.readNode<Serializable>(schema[2], input);
				}
				return array;
			}
			case 'version': {
				const version = input.readByte();
				if(version !== schema[1]) crash(`Expected version ${schema[1]}, but read ${version}`);
				return this.readNode<Data>(schema[2], input);
			}
		}
	}
}

export class SettingsSerializer<T extends Serializable> extends Serializer<T> {
	constructor(
		public readonly settingsKey: string,
		public readonly schema: Schema<T>,
		public readonly oldSchema?: Schema<T>,
	){
		super(schema, oldSchema);
	}

	writeSettings(object:T):void {
		const output = new ByteArrayOutputStream();
		this.write(object, new DataOutputStream(output));
		Core.settings.put(this.settingsKey, output.toByteArray());
	}
	readSettings():T | null {
		const data = Core.settings.getBytes(this.settingsKey);
		if(data) return this.read(new DataInputStream(new ByteArrayInputStream(data)));
		else return null;
	}
}

if(!Symbol.metadata)
	Object.defineProperty(Symbol, "metadata", {
		writable: false,
		enumerable: false,
		configurable: false,
		value: Symbol("Symbol.metadata")
	});

export function serialize<T extends Serializable>(
	settingsKey: string,
	schema: () => Schema<T>, oldSchema?: () => Schema<T>,
	fixer?: (raw:T) => T,
){
	return function decorate<
		This extends Record<Name, T>, Name extends string | symbol
	// eslint-disable-next-line @typescript-eslint/unbound-method
	>(_: unknown, {addInitializer, access, name}:ClassFieldDecoratorContext<This, T> & {
		name: Name;
		static: true;
	}){
		addInitializer(function(){
			const serializer = lazy(() =>
				new SettingsSerializer<T>(settingsKey, schema(), oldSchema?.())
			);
			FishEvents.on("loadData", () => {
				let value = serializer().readSettings();
				if(value){
					if(fixer) value = fixer(value);
					access.set(this, value);
				}
			});
			FishEvents.on("saveData", () => {
				try {
					serializer().writeSettings(access.get(this));
				} catch(err){
					Log.err(`Error while saving field ${String(name)} on ${String((this as any as Function)?.name)} using settings key ${settingsKey}`);
					Log.info(JSON.stringify(access.get(this)));
					throw err;
				}
			});
		});
	};
}
