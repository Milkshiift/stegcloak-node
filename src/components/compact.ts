import zlib from 'node:zlib';
import lzutf8 from 'lzutf8';
import { iterativeReplace } from './util';

// Discord has a limit of 2000 characters
// In an encrypted message, you can fit:
// ~677 chars max with lzutf
// ~1086 chars max with brotli
// 60% improvement with brotli
export const compress = (x: string | Buffer): Buffer => {
  return zlib.brotliCompressSync(x, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
  });
};

export const decompress = (x: Buffer | Uint8Array): string => {
  try {
    return zlib.brotliDecompressSync(x).toString('utf8');
  } catch (err) {
    // Previous version of the code used lzutf8 for compression, hence the fallback
    return lzutf8.decompress(x, {
      inputEncoding: 'Buffer',
      outputEncoding: 'String'
    });
  }
};

// Builds a ranking table and filters the two characters that can be compressed that yield good results
export const findOptimal = (secret: string, characters: string[]): string[] => {
  const dict = new Map<string, Map<number, number>>(characters.map(char => [char, new Map()]));
  const size = secret.length;

  for (let j = 0; j < size; j++) {
    let count = 1;
    while (j + 1 < size && secret.charAt(j) === secret.charAt(j + 1)) {
      count++;
      j++;
    }

    if (count >= 2) {
      const charMap = dict.get(secret.charAt(j));
      if (charMap) {
        for (let itr = count; itr >= 2; itr--) {
          const existingValue = charMap.get(itr) || 0;
          charMap.set(itr, existingValue + Math.floor(count / itr) * (itr - 1));
        }
      }
    }
  }

  const getOptimal: [string, number][] = [];
  for (const [key, innerMap] of dict) {
    for (const [count, value] of innerMap) {
      getOptimal.push([key + count, value]);
    }
  }

  const rankedTable = getOptimal.sort((a, b) => b[1] - a[1]);

  let reqZwc = rankedTable
      .filter((val) => val[0].charAt(1) === '2')
      .slice(0, 2)
      .map((chars) => chars[0].charAt(0));

  if (reqZwc.length !== 2) {
    reqZwc = reqZwc.concat(
        characters.filter(char => !reqZwc.includes(char)).slice(0, 2 - reqZwc.length)
    );
  }
  return reqZwc.sort();
};

export const zwcHuffMan = (zwc: string[]) => {
  const [z0, z1, z2, z3, z4, z5] = zwc as [string, string, string, string, string, string];
  const tableMap = [
    z0 + z1,
    z0 + z2,
    z0 + z3,
    z1 + z2,
    z1 + z3,
    z2 + z3
  ];

  const _getCompressFlag = (zwc1: string, zwc2: string): string =>
      zwc[tableMap.indexOf(zwc1 + zwc2)]!; // zwA,zwB => zwD

  const _extractCompressFlag = (zwc1: string): string[] =>
      tableMap[zwc.indexOf(zwc1)]!.split(''); // zwcD => zwA,zwcB

  const shrink = (secret: string): string => {
    const repeatChars = findOptimal(secret, zwc.slice(0, 4));
    return (
        _getCompressFlag(repeatChars[0]!, repeatChars[1]!) +
        iterativeReplace(
            secret,
            repeatChars.map((x) => x + x),
            [z4, z5]
        )
    );
  };

  const expand = (secret: string): string => {
    const flag = secret.charAt(0);
    const invisibleStream = secret.slice(1);
    const repeatChars = _extractCompressFlag(flag);
    return iterativeReplace(
        invisibleStream,
        [z4, z5],
        repeatChars.map((x) => x + x)
    );
  };

  return { shrink, expand };
};
