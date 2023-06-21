export type TObject = Record<string, any>;

type TCamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${TCamelCase<P3>}`
  : Lowercase<S>;

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type TKeysToCamelCase<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as TCamelCase<K & string>]: T[K] extends {} ? TKeysToCamelCase<T[K]> : T[K];
};
