import type { TObject } from "./types";

export function isObject(object?: unknown): object is object {
  return Boolean(object) && typeof object === "object";
}

export function isEmptyObject(object?: unknown): boolean {
  return isObject(object) && Object.keys(object).length === 0;
}

export function compactObject(object: object): object {
  Object.entries(object).forEach(([k, v]) => {
    if (isObject(v)) {
      compactObject(v);
    }

    if (isEmptyObject(v) || (v !== 0 && !v)) {
      if (Array.isArray(object)) {
        object.splice(Number(k), 1);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete object[k];
    }
  });

  return object;
}

export function deepMergeObjects(...objects: Array<TObject>): TObject {
  return objects.reduce((result, object) => {
    Object.entries(object).forEach(([key, value]) => {
      const resultValue = result[key];

      if (Array.isArray(resultValue) && Array.isArray(value)) {
        result[key] = resultValue.concat(...value);
      } else if (isObject(resultValue) && isObject(value)) {
        result[key] = deepMergeObjects(resultValue, value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }, {});
}
