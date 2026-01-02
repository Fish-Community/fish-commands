export declare class DataClass<T extends Serializable> {
    _brand: symbol;
    constructor(data: T);
}
export declare function dataClass<T extends Serializable>(): new (data: T) => (DataClass<T> & T);
export type NumberRepresentation = "i8" | "i16" | "i32" | "i64" | "u8" | "u16" | "u32" | "f32" | "f64";
export type SerializablePrimitive = string | number | boolean | Team;
export type SerializableDataClassConstructor<ClassInstance extends {}> = new (data: SerializableData<ClassInstance>) => ClassInstance;
export type Serializable = SerializablePrimitive | Serializable[] | {
    [index: string]: Serializable;
} | DataClass<Serializable>;
export type PrimitiveSchema<T extends SerializablePrimitive> = T extends string ? ["string"] : T extends number ? ["number", bytes: NumberRepresentation] : T extends boolean ? ["boolean"] : T extends Team ? ["team"] : never;
export type ArraySchema<T extends Serializable[]> = [
    "array",
    length: number extends T["length"] ? NumberRepresentation & `u${string}` | number : T["length"],
    element: Schema<T[number]>
];
export type ObjectSchema<T extends Record<string, Serializable>> = [
    "object",
    children: Array<keyof T extends infer KT extends keyof T ? KT extends unknown ? [KT, Schema<T[KT]>] : never : never>
];
export type DataClassSchema<ClassInstance extends {}> = [
    "class",
    clazz: new (data: any) => ClassInstance,
    children: Array<SerializableData<ClassInstance> extends infer Data extends Record<string, Serializable> ? keyof Data extends infer KU extends keyof Data ? KU extends unknown ? [KU, Schema<Data[KU]>] : never : never : never>
];
export type VersionSchema<T extends Serializable> = ["version", number: number, rest: Schema<T, false>];
export type Schema<T extends Serializable, AllowVersion = true> = (T extends SerializablePrimitive ? PrimitiveSchema<T> : T extends Serializable[] ? ArraySchema<T> : T extends infer ClassInstance extends DataClass<Serializable> ? DataClassSchema<ClassInstance> : T extends Record<string, Serializable> ? ObjectSchema<T> : never) | (AllowVersion extends true ? VersionSchema<T> : never);
export type SerializableData<T extends {}> = {
    [K in keyof T extends infer KT extends keyof T ? KT extends unknown ? T[KT] extends Serializable ? KT : never : never : never]: T[K];
};
export declare class Serializer<T extends Serializable> {
    schema: Schema<T>;
    oldSchema?: Schema<T> | undefined;
    constructor(schema: Schema<T>, oldSchema?: Schema<T> | undefined);
    write(object: T, output: DataOutputStream): void;
    read(input: DataInputStream): T;
    /** SAFETY: Data must not be a union */
    static writeNode<Data extends Serializable>(schema: Schema<Data>, object: Data, output: DataOutputStream): void;
    /** SAFETY: Data must not be a union */
    static readNode<Data extends Serializable>(schema: Schema<Data>, input: DataInputStream): Data;
}
export declare class SettingsSerializer<T extends Serializable> extends Serializer<T> {
    readonly settingsKey: string;
    readonly schema: Schema<T>;
    readonly oldSchema?: Schema<T> | undefined;
    constructor(settingsKey: string, schema: Schema<T>, oldSchema?: Schema<T> | undefined);
    writeSettings(object: T): void;
    readSettings(): T | null;
}
export declare function serialize<T extends Serializable>(settingsKey: string, schema: () => Schema<T>, oldSchema?: () => Schema<T>, fixer?: (raw: T) => T): <This extends Record<Name, T>, Name extends string | symbol>(_: unknown, { addInitializer, access, name }: ClassFieldDecoratorContext<This, T> & {
    name: Name;
    static: true;
}) => void;
