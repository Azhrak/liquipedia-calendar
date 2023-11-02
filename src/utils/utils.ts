import { config } from "../config";

export const getPageFile = (page: string) => page.replace(/[^\w\d_-]/g, "-");

export const getPageUrl = (page: string) =>
  page.replace(config.wikiRootUrl + "/", "");

export const flattenArrayRecursive = (arr: string | string[]): string[] => {
  if (arr instanceof Array) {
    return arr.length === 0
      ? []
      : flattenArrayRecursive(arr[0]).concat(
          flattenArrayRecursive(arr.slice(1))
        );
  }
  return [arr];
};

export const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

export const removeTrailingSlash = (url: string) => url.replace(/\/\s*$/, "");

export const ucFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const findMatches = (
  regex: RegExp,
  str: string,
  matches: RegExpExecArray[] = []
) => {
  const res = regex.exec(str);
  res && matches.push(res) && findMatches(regex, str, matches);
  return matches;
};

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
