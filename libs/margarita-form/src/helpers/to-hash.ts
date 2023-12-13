const toAlphabeticChar = (code: number) => String.fromCharCode(code + (code > 25 ? 39 : 97));

const toAlphabeticName = (code: number) => {
  let name = '';
  let x;

  for (x = Math.abs(code); x > 52; x = (x / 52) | 0) name = toAlphabeticChar(x % 52) + name;

  return toAlphabeticChar(x % 52) + name;
};

const toPhash = (h: number, x: string): number => {
  let i = x.length;
  while (i) h = (h * 33) ^ x.charCodeAt(--i);
  return h;
};

/**
 * Turns any value into a hash string. Useful for generating unique ids that need to stay consistent when value is the same but be always unique when value is different.
 * @returns A hash string.
 */
export const toHash = (value: unknown): string => {
  const numericHash = toPhash(5381, JSON.stringify(value)) >>> 0;
  return toAlphabeticName(numericHash);
};
