export function isNonEmptyArray<T>(arg?: unknown): arg is Array<T> {
  return Boolean(arg) && Array.isArray(arg) && arg.length > 0;
}
