import crypto from 'node:crypto';
import { zeroPad, nTobin, binToByte } from './util';

export interface ConcealedData {
  data: Uint8Array;
}

interface ZwcLookup {
  /** Maps 2-bit binary index (0-3) to ZWC character */
  binToZwc: readonly string[];
  /** Maps ZWC character to 2-bit binary string */
  zwcToBin: ReadonlyMap<string, string>;
  /** Set of all ZWC characters for O(1) membership test */
  zwcSet: ReadonlySet<string>;
}



const buildLookup = (zwc: readonly string[]): ZwcLookup => {
  const binToZwc = zwc.slice(0, 4);
  const zwcToBin = new Map<string, string>();
  const zwcSet = new Set<string>(zwc);

  for (let i = 0; i < 4; i++) {
    const char = zwc[i]!;
    zwcToBin.set(char, zeroPad(2, nTobin(i)));
  }

  return Object.freeze({ binToZwc, zwcToBin, zwcSet });
};




export const zwcOperations = (zwc: readonly string[]) => {
  if (zwc.length < 4) {
    throw new Error('ZWC array must have at least 4 characters');
  }

  const lookup = buildLookup(zwc);

  /** Format flag - first ZWC character marks encrypted content */
  const FORMAT_FLAG = zwc[0]!;

  /**
   * Map 2-bit binary string to ZWC character
   */
  const _binToZWC = (str: string): string => {
    const index = parseInt(str, 2);
    const result = lookup.binToZwc[index];
    if (result === undefined) {
      throw new Error(`Invalid binary pair: ${str}`);
    }
    return result;
  };

  /**
   * Map ZWC character to 2-bit binary string
   */
  const _ZWCTobin = (char: string): string => {
    const result = lookup.zwcToBin.get(char);
    if (result === undefined) {
      throw new Error(`Invalid ZWC character: U+${char.charCodeAt(0).toString(16).toUpperCase()}`);
    }
    return result;
  };

  /**
   * Convert binary data to ZWC hidden string with format flag
   */
  const toConceal = (binaryStr: string): string => {
    const numPairs = binaryStr.length >>> 1;
    const chunks = new Array<string>(numPairs + 1);
    chunks[0] = FORMAT_FLAG;

    for (let i = 0; i < numPairs; i++) {
      const offset = i << 1;
      chunks[i + 1] = _binToZWC(binaryStr.charAt(offset) + binaryStr.charAt(offset + 1));
    }

    return chunks.join('');
  };

  /**
   * Convert ZWC string back to binary data
   */
  const concealToData = (str: string): ConcealedData => {
    if (!str || str.length < 2) {
      throw new Error('Concealed string too short');
    }

    // Skip the format flag (first character)
    const payload = str.slice(1);

    const len = payload.length;
    const binParts = new Array<string>(len);

    for (let i = 0; i < len; i++) {
      binParts[i] = _ZWCTobin(payload.charAt(i));
    }

    return {
      data: binToByte(binParts.join(''))
    };
  };

  /**
   * Detach ZWC stream from cover text
   * Finds the first word containing ZWC characters and extracts them
   */
  const detach = (str: string): string => {
    if (!str || str.length === 0) {
      throw new Error('Cannot detach from empty string');
    }

    const words = str.split(' ');

    for (const word of words) {
      if (word.length === 0) continue;

      let hasZWC = false;
      for (let i = 0; i < word.length; i++) {
        if (lookup.zwcSet.has(word.charAt(i))) {
          hasZWC = true;
          break;
        }
      }

      if (hasZWC) {
        let endIndex = 0;
        while (endIndex < word.length && lookup.zwcSet.has(word.charAt(endIndex))) {
          endIndex++;
        }
        return endIndex === word.length ? word : word.slice(0, endIndex);
      }
    }

    throw new Error(
        'Invisible stream not detected! Please copy and paste the Stegcloak text sent by the sender.'
    );
  };

  return Object.freeze({
    detach,
    concealToData,
    toConceal
  });
};

/**
 * Embed invisible stream into cover text at a random position
 * The secret is prepended to a word in the first half of the text
 */
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

  const result = words.slice(0, insertPosition);
  result.push(secret + targetWord);

  if (insertPosition + 1 < wordCount) {
    result.push(...words.slice(insertPosition + 1));
  }

  return result.join(' ');
};