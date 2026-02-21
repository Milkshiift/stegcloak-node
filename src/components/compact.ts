import zlib from 'node:zlib';
import { iterativeReplace } from './util';

const BROTLI_COMPRESS_OPTIONS: zlib.BrotliOptions = Object.freeze({
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY
  }
});

export const compress = (data: string | Buffer): Buffer => {
  if ((typeof data === 'string' && data.length === 0) ||
      (Buffer.isBuffer(data) && data.length === 0)) {
    throw new Error('Cannot compress empty data');
  }
  return zlib.brotliCompressSync(data, BROTLI_COMPRESS_OPTIONS);
};

export const decompress = (data: Buffer | Uint8Array): string => {
  if (data.length === 0) {
    throw new Error('Cannot decompress empty data');
  }

  try {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    return zlib.brotliDecompressSync(buffer).toString('utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Decompression failed: ${message}`);
  }
};

// Run-Length Optimization

/**
 * Analyze text to find optimal characters for run-length compression
 * Returns two characters that have the most consecutive pair occurrences
 */
export const findOptimal = (secret: string, characters: readonly string[]): string[] => {
  if (characters.length < 2) {
    throw new Error('Need at least 2 characters to find optimal pair');
  }

  if (secret.length < 2) {
    return [characters[0]!, characters[1]!].sort();
  }

  const runStats = new Map<string, Map<number, number>>();
  const charSet = new Set(characters);

  for (const char of characters) {
    runStats.set(char, new Map());
  }

  const len = secret.length;
  let i = 0;

  while (i < len) {
    const char = secret.charAt(i);

    if (!charSet.has(char)) {
      i++;
      continue;
    }

    let runLength = 1;
    while (i + runLength < len && secret.charAt(i + runLength) === char) {
      runLength++;
    }

    if (runLength >= 2) {
      const charMap = runStats.get(char);
      if (charMap) {
        for (let groupSize = 2; groupSize <= runLength; groupSize++) {
          const numGroups = Math.floor(runLength / groupSize);
          const savings = numGroups * (groupSize - 1);
          const current = charMap.get(groupSize) ?? 0;
          charMap.set(groupSize, current + savings);
        }
      }
    }

    i += runLength;
  }

  const rankings: Array<[string, number]> = [];
  for (const [char, innerMap] of runStats) {
    for (const [runLength, savings] of innerMap) {
      rankings.push([`${char}${runLength}`, savings]);
    }
  }

  rankings.sort((a, b) => b[1] - a[1]);

  const selectedChars = new Set<string>();
  const result: string[] = [];

  for (const [key] of rankings) {
    if (key.length >= 2 && key.charAt(key.length - 1) === '2') {
      const char = key.slice(0, -1);
      if (!selectedChars.has(char)) {
        selectedChars.add(char);
        result.push(char);
        if (result.length === 2) break;
      }
    }
  }

  if (result.length < 2) {
    for (const char of characters) {
      if (!selectedChars.has(char)) {
        result.push(char);
        if (result.length === 2) break;
      }
    }
  }

  return result.sort();
};


// ZWC Huffman Encoding

/**
 * Create Huffman-like encoding functions for ZWC character pairs
 * Uses 2 additional ZWC characters to represent pairs of repeated characters
 */
export const zwcHuffMan = (zwc: readonly string[]) => {
  if (zwc.length < 6) {
    throw new Error('ZWC array must have at least 6 characters for Huffman encoding');
  }

  const [z0, z1, z2, z3, z4, z5] = zwc as readonly [string, string, string, string, string, string];

  const pairToFlag = new Map<string, string>([
    [`${z0}${z1}`, z0],
    [`${z0}${z2}`, z1],
    [`${z0}${z3}`, z2],
    [`${z1}${z2}`, z3],
    [`${z1}${z3}`, z4],
    [`${z2}${z3}`, z5]
  ]);

  const flagToPair = new Map<string, readonly [string, string]>([
    [z0, [z0, z1]],
    [z1, [z0, z2]],
    [z2, [z0, z3]],
    [z3, [z1, z2]],
    [z4, [z1, z3]],
    [z5, [z2, z3]]
  ]);

  const _getCompressFlag = (zwc1: string, zwc2: string): string => {
    const flag = pairToFlag.get(`${zwc1}${zwc2}`);
    if (flag === undefined) {
      throw new Error(`Invalid ZWC pair for compression: ${zwc1}, ${zwc2}`);
    }
    return flag;
  };

  const _extractCompressFlag = (flag: string): readonly [string, string] => {
    const pair = flagToPair.get(flag);
    if (pair === undefined) {
      throw new Error(`Invalid compression flag: U+${flag.charCodeAt(0).toString(16).toUpperCase()}`);
    }
    return pair;
  };

  /**
   * Compress consecutive pairs of identical ZWC characters
   */
  const shrink = (secret: string): string => {
    if (!secret || secret.length === 0) {
      throw new Error('Cannot shrink empty string');
    }

    const repeatChars = findOptimal(secret, zwc.slice(0, 4));
    const flag = _getCompressFlag(repeatChars[0]!, repeatChars[1]!);

    const compressed = iterativeReplace(
        secret,
        repeatChars.map(char => char + char),
        [z4, z5]
    );

    return flag + compressed;
  };

  /**
   * Expand compressed ZWC string back to original
   */
  const expand = (secret: string): string => {
    if (!secret || secret.length === 0) {
      throw new Error('Cannot expand empty string');
    }

    const flag = secret.charAt(0);
    const compressed = secret.slice(1);
    const repeatChars = _extractCompressFlag(flag);

    return iterativeReplace(
        compressed,
        [z4, z5],
        [repeatChars[0] + repeatChars[0], repeatChars[1] + repeatChars[1]]
    );
  };

  return Object.freeze({ shrink, expand });
};