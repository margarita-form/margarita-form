export type CommonRecord<TYPE = unknown> = Record<PropertyKey, TYPE>;
export type IsUnion<T, U extends T = T> = T extends unknown ? ([U] extends [T] ? false : true) : false;
export type IsSpecifiedString<T> = T extends string ? (string extends T ? false : true) : false;
export type NeverObj = Record<never, never>;
export type OrAny = any & NeverObj;
export type NotFunction = string | number | boolean | object | null | undefined | CommonRecord;
export type OrT<T> = T & NeverObj;
export type OrString = OrT<string>;
export type OrNumber = OrT<number>;
export type BothTrue<T, U> = T extends true ? (U extends true ? true : false) : false;
export type EitherTrue<T, U> = T extends true ? true : U extends true ? true : false;
