/**
 * Utility functions for Stegcloak
 */

export const buffSlice = (x: Uint8Array | Buffer, y: number, z: number = x.length): Buffer => {
  return Buffer.from(x.slice(y, z));
};

export const concatBuff = Buffer.concat;

export const toBuffer = (data: Uint8Array | number[]): Buffer => Buffer.from(data);

export const byarr = (x: Buffer | Uint8Array | number[]): Uint8Array => new Uint8Array(x);

export const nTobin = (x: number): string => x.toString(2);

// Apply bitwise NOT complement to a byte array efficiently
export const compliment = (x: Uint8Array | Buffer): Uint8Array => {
  const arr = new Uint8Array(x.length);
  for (let i = 0; i < x.length; i++) {
    arr[i] = ~x[i]!; // Bitwise NOT; implicitly cast to 0-255 in Uint8Array
  }
  return arr;
};

// Pad with zeroes to get required length
export const zeroPad = (padLength: number, num: string | number): string => {
  const str = String(num);
  if (str.length >= padLength) return str;
  return '0'.repeat(padLength - str.length) + str;
};

// Byte array to Binary String conversion
export const byteToBin = (arr: Uint8Array | Buffer): string => {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    result += zeroPad(8, nTobin(arr[i]!));
  }
  return result;
};

// Binary String to Byte Array conversion
export const binToByte = (str: string): Uint8Array => {
  const arr = new Uint8Array(str.length / 8);
  for (let i = 0; i < str.length; i += 8) {
    arr[i / 8] = parseInt(str.slice(i, i + 8), 2);
  }
  return arr;
};

export const iterativeReplace = (data: string, patternArray: string[], replaceArray: string[]): string => {
  let currentData = data;
  const regexes = patternArray.map(pattern => new RegExp(pattern, 'g')); // Pre-compile regexes

  for (let i = patternArray.length - 1; i >= 0; i--) {
    currentData = currentData.replace(regexes[i]!, replaceArray[i]!);
  }
  return currentData;
};
