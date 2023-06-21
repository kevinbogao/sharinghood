import { randomBytes } from "crypto";

export function words(str: string): Array<string> {
  // eslint-disable-next-line no-control-regex, require-unicode-regexp
  return str.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

export function titleCase(str: string): string {
  return words(str).reduce((acc, word, idx) => acc + (idx > 0 ? " " : "") + capitalise(word), "");
}

export function lowerCase(str: string): string {
  return words(str).reduce((acc, word, idx) => acc + (idx > 0 ? " " : "") + word.toLowerCase(), "");
}

export function upperCase(str: string): string {
  return words(str).reduce((acc, word, idx) => acc + (idx > 0 ? " " : "") + word.toUpperCase(), "");
}

export function camelCase(str: string): string {
  return words(str).reduce((acc, word, idx) => {
    const lowerCaseWord = word.toLowerCase();
    return acc + (idx > 0 ? capitalise(lowerCaseWord) : lowerCaseWord);
  }, "");
}

export function kebabCase(str: string): string {
  return words(str).reduce((acc, word, idx) => acc + (idx > 0 ? "-" : "") + word.toLowerCase(), "");
}

export function snakeCase(str: string): string {
  return words(str).reduce((acc, word, idx) => acc + (idx > 0 ? "_" : "") + word.toLowerCase(), "");
}

export function generateAlphanumericString(length: number): string {
  return Array.from(Array(length), () => Math.floor(Math.random() * 36).toString(36)).join("");
}

export function generateUnsubscribeToken(): string {
  return randomBytes(36).toString("hex");
}
