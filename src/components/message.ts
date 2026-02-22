import crypto from 'node:crypto';
import { zeroPad, nTobin, binToByte } from './util';

export interface ConcealedData {
  data: Uint8Array;
}

interface ZwcLookup {
  binToZwc: readonly string[];
  zwcToBin: ReadonlyMap<string, string>;
  zwcToInt: ReadonlyMap<string, number>;
  zwcSet: ReadonlySet<string>;
}

const buildLookup = (zwc: readonly string[]): ZwcLookup => {
  const binToZwc = zwc.slice(0, 4);
  const zwcToBin = new Map<string, string>();
  const zwcToInt = new Map<string, number>();
  const zwcSet = new Set<string>(zwc);

  for (let i = 0; i < 4; i++) {
    const char = zwc[i]!;
    zwcToBin.set(char, zeroPad(2, nTobin(i)));
    zwcToInt.set(char, i);
  }

  return Object.freeze({ binToZwc, zwcToBin, zwcToInt, zwcSet });
};

export const zwcOperations = (zwc: readonly string[]) => {
  if (zwc.length < 4) {
    throw new Error('ZWC array must have at least 4 characters');
  }

  const lookup = buildLookup(zwc);
  const FORMAT_FLAG = zwc[0]!;

  const _ZWCTobin = (char: string): string => {
    const result = lookup.zwcToBin.get(char);
    if (result === undefined) {
      throw new Error(`Invalid ZWC character: U+${char.charCodeAt(0).toString(16).toUpperCase()}`);
    }
    return result;
  };

  const toConceal = (binaryStr: string): string => {
    const numPairs = binaryStr.length >>> 1;
    const chunks = new Array<string>(numPairs + 1);
    chunks[0] = FORMAT_FLAG;

    for (let i = 0; i < numPairs; i++) {
      const offset = i << 1;
      const c1 = binaryStr.charCodeAt(offset);
      const c2 = binaryStr.charCodeAt(offset + 1);

      const isC1Valid = c1 === 48 || c1 === 49;
      const isC2Valid = c2 === 48 || c2 === 49;

      if (!isC1Valid || !isC2Valid) {
        throw new Error(`Invalid binary pair: ${binaryStr.slice(offset, offset + 2)}`);
      }

      const index = ((c1 & 1) << 1) | (c2 & 1);
      chunks[i + 1] = lookup.binToZwc[index]!;
    }

    return chunks.join('');
  };

  const concealToData = (str: string): ConcealedData => {
    if (!str || str.length < 2) {
      throw new Error('Concealed string too short');
    }

    const payload = str.slice(1);
    const len = payload.length;

    if (len % 4 !== 0) {
      // Backwards compatible parsing payload
      const binParts = new Array<string>(len);
      for (let i = 0; i < len; i++) {
        binParts[i] = _ZWCTobin(payload.charAt(i));
      }
      return { data: binToByte(binParts.join('')) };
    }

    const byteLen = len >>> 2;
    const arr = new Uint8Array(byteLen);

    for (let i = 0; i < byteLen; i++) {
      const offset = i << 2;
      const c1 = payload.charAt(offset);
      const c2 = payload.charAt(offset + 1);
      const c3 = payload.charAt(offset + 2);
      const c4 = payload.charAt(offset + 3);

      const n1 = lookup.zwcToInt.get(c1);
      const n2 = lookup.zwcToInt.get(c2);
      const n3 = lookup.zwcToInt.get(c3);
      const n4 = lookup.zwcToInt.get(c4);

      if (n1 === undefined || n2 === undefined || n3 === undefined || n4 === undefined) {
        _ZWCTobin(n1 === undefined ? c1 : n2 === undefined ? c2 : n3 === undefined ? c3 : c4);
      }

      arr[i] = (n1! << 6) | (n2! << 4) | (n3! << 2) | n4!;
    }

    return { data: arr };
  };

  const zwcPattern = zwc.join('');
  const zwcRegex = new RegExp(`[${zwcPattern}]+`, 'g')

  const detach = (str: string): string => {
    if (!str || str.length === 0) {
      throw new Error('Cannot detach from empty string');
    }

    const matches = str.match(zwcRegex);
    if (!matches) {
      throw new Error(
          'Invisible stream not detected! Please copy and paste the Stegcloak text sent by the sender.'
      );
    }

    return matches.reduce((a, b) => a.length > b.length ? a : b);
  };

  return Object.freeze({
    detach,
    concealToData,
    toConceal
  });
};

export const embed = (cover: string, secret: string): string => {
  const words = cover.split(' ');
  const wordCount = words.length;

  if (wordCount < 2) {
    throw new Error('Cover text must have at least two words');
  }

  const maxTargetIndex = Math.floor(wordCount / 2);

  const targetIndex = maxTargetIndex > 0
      ? crypto.randomInt(0, maxTargetIndex)
      : 0;

  const insertPosition = targetIndex + 1;
  const targetWord = words[insertPosition];

  if (targetWord === undefined) {
    throw new Error('Invalid insertion position calculated');
  }

  words[insertPosition] = secret + targetWord;
  return words.join(' ');
};