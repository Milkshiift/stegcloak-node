export const buffSlice = (x: Uint8Array | Buffer, start: number, end: number = x.length): Buffer => {
  if (start < 0 || end > x.length || start > end) {
    throw new RangeError(`Invalid slice range: [${start}, ${end}] for length ${x.length}`);
  }
  return Buffer.from(x.slice(start, end));
};

export const concatBuff: typeof Buffer.concat = Buffer.concat;

export const toBuffer = (data: Uint8Array | number[]): Buffer => Buffer.from(data);

export const byarr = (x: Buffer | Uint8Array | number[]): Uint8Array => new Uint8Array(x);

export const nTobin = (x: number): string => {
  return (x & 0xFF).toString(2);
};

export const compliment = (x: Uint8Array | Buffer): Uint8Array => {
  const len = x.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = ~x[i]! & 0xFF;
  }
  return arr;
};

export const zeroPad = (padLength: number, num: string | number): string => {
  return String(num).padStart(padLength, '0');
};

export const byteToBin = (arr: Uint8Array | Buffer): string => {
  const len = arr.length;
  const result = new Array<string>(len);
  for (let i = 0; i < len; i++) {
    result[i] = (arr[i]! >>> 0).toString(2).padStart(8, '0');
  }
  return result.join('');
};

export const binToByte = (str: string): Uint8Array => {
  const len = str.length;
  if (len === 0) {
    return new Uint8Array(0);
  }
  if (len % 8 !== 0) {
    throw new Error(`Binary string length must be divisible by 8, got ${len}`);
  }

  const byteLen = len >>> 3;
  const arr = new Uint8Array(byteLen);

  for (let i = 0; i < byteLen; i++) {
    const offset = i << 3;
    arr[i] = parseInt(str.slice(offset, offset + 8), 2);
  }
  return arr;
};

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const regexCache = new Map<string, RegExp>();

const getCachedRegex = (pattern: string): RegExp => {
  let regex = regexCache.get(pattern);
  if (!regex) {
    regex = new RegExp(escapeRegExp(pattern), 'g');
    if (regexCache.size > 100) {
      const firstKey = regexCache.keys().next().value;
      if (firstKey) regexCache.delete(firstKey);
    }
    regexCache.set(pattern, regex);
  }
  return regex;
};

export const iterativeReplace = (
    data: string,
    patternArray: readonly string[],
    replaceArray: readonly string[]
): string => {
  if (patternArray.length !== replaceArray.length) {
    throw new Error('Pattern and replacement arrays must have equal length');
  }

  let currentData = data;

  for (let i = patternArray.length - 1; i >= 0; i--) {
    const pattern = patternArray[i]!;
    const replacement = replaceArray[i]!;

    const regex = getCachedRegex(pattern);
    regex.lastIndex = 0;
    currentData = currentData.replace(regex, replacement);
  }
  return currentData;
};