'use strict'

import { sort, difference } from 'rambda'
import { recursiveReplace } from './util.js'
import zlib from "node:zlib";
import lzutf8 from 'lzutf8'

// Discord has a limit of 2000 characters
// In an encrypted message, you can fit:
// ~677 chars max with lzutf
// ~1086 chars max with brotli
// 60% improvement with brotli
const compress = (x) => {
  //const start = performance.now();
  const compressed = zlib.brotliCompressSync(x, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } });
  // const compressed = lzutf8.compress(x, {
  //   outputEncoding: 'Buffer'
  // })
  //const end = performance.now();
  //console.log(`Compression took ${end - start} milliseconds.`);
  return compressed;
}

const decompress = (x) => {
  //const start = performance.now();
  let decompressed;
  try {
    decompressed = zlib.brotliDecompressSync(x).toString();
  } catch (err) {
    decompressed = lzutf8.decompress(x, {
      inputEncoding: 'Buffer',
      outputEncoding: 'String'
    });
  }
  //const end = performance.now();
  //console.log(`Decompression took ${end - start} milliseconds.`);
  return decompressed;
}

// Builds a ranking table and filters the two characters that can be compressed that yield good results

const findOptimal = (secret, characters) => {
  const dict = characters.reduce((acc, data) => {
    acc[data] = {}
    return acc
  }, {})
  const size = secret.length
  for (let j = 0; j < size; j++) {
    let count = 1
    while (j < size && secret[j] === secret[j + 1]) {
      count++
      j++
    }
    if (count >= 2) {
      let itr = count
      while (itr >= 2) {
        dict[secret[j]][itr] =
          (dict[secret[j]][itr] || 0) + Math.floor(count / itr) * (itr - 1)
        itr--
      }
    }
  }
  const getOptimal = []
  for (const key in dict) {
    for (const count in dict[key]) {
      getOptimal.push([key + count, dict[key][count]])
    }
  }
  const rankedTable = sort((a, b) => b[1] - a[1], getOptimal)

  let reqZwc = rankedTable
    .filter((val) => val[0][1] === '2')
    .slice(0, 2)
    .map((chars) => chars[0][0])

  if (reqZwc.length !== 2) {
    reqZwc = reqZwc.concat(
      difference(characters, reqZwc).slice(0, 2 - reqZwc.length)
    )
  }

  return reqZwc.slice().sort()
}

const zwcHuffMan = (zwc) => {
  const tableMap = [
    zwc[0] + zwc[1],
    zwc[0] + zwc[2],
    zwc[0] + zwc[3],
    zwc[1] + zwc[2],
    zwc[1] + zwc[3],
    zwc[2] + zwc[3]
  ]

  const _getCompressFlag = (zwc1, zwc2) =>
    zwc[tableMap.indexOf(zwc1 + zwc2)] // zwA,zwB => zwD

  const _extractCompressFlag = (zwc1) => tableMap[zwc.indexOf(zwc1)].split('') // zwcD => zwA,zwcB

  const shrink = (secret) => {
    const repeatChars = findOptimal(secret, zwc.slice(0, 4))
    return (
      _getCompressFlag(...repeatChars) +
      recursiveReplace(
        secret,
        repeatChars.map((x) => x + x),
        [zwc[4], zwc[5]]
      )
    )
  }

  const expand = (secret) => {
    const flag = secret[0]
    const invisibleStream = secret.slice(1)
    const repeatChars = _extractCompressFlag(flag)
    return recursiveReplace(
      invisibleStream,
      [zwc[4], zwc[5]],
      repeatChars.map((x) => x + x)
    )
  }

  return {
    shrink,
    expand
  }
}

export {
  compress,
  decompress,
  zwcHuffMan
}
