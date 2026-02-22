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
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    return zlib.brotliDecompressSync(buffer).toString('utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Decompression failed: ${message}`);
  }
};

export const findOptimal = (secret: string, characters: readonly string[]): string[] => {
  if (characters.length < 2) {
    throw new Error('Need at least 2 characters to find optimal pair');
  }

  if (secret.length < 2) {
    return [characters[0]!, characters[1]!].sort();
  }

  const savingsMap = new Map<string, number>();
  const charSet = new Set(characters);

  for (const char of characters) {
    savingsMap.set(char, 0);
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
      const numGroups = Math.floor(runLength / 2);
      savingsMap.set(char, savingsMap.get(char)! + numGroups);
    }

    i += runLength;
  }

  const rankings: Array<[string, number]> = [];
  for (const [char, savings] of savingsMap) {
    rankings.push([char, savings]);
  }

  rankings.sort((a, b) => b[1] - a[1]);

  return [rankings[0]![0], rankings[1]![0]].sort();
};

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

  const shrink = (secret: string): string => {
    if (!secret || secret.length === 0) {
      throw new Error('Cannot shrink empty string');
    }

    const repeatChars = findOptimal(secret, zwc.slice(0, 4));
    const flag = _getCompressFlag(repeatChars[0]!, repeatChars[1]!);

    const compressed = iterativeReplace(
        secret,
        [repeatChars[0]! + repeatChars[0]!, repeatChars[1]! + repeatChars[1]!],
        [z4, z5]
    );

    return flag + compressed;
  };

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
        [repeatChars[0]! + repeatChars[0]!, repeatChars[1]! + repeatChars[1]!]
    );
  };

  return Object.freeze({ shrink, expand });
};