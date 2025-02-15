'use strict'

import {
  map,
  join,
  pipe,
  slice,
  curry,
  flip,
  dropLast,
  isEmpty,
  takeLast
} from 'rambda'

// Compliment an array
const _not = (x) => ~x

// Slice a buffer
const buffSlice = (x, y, z = x.length) => pipe(byarr, slice(y, z), toBuffer)(x)

// Concatenate buffers
const concatBuff = Buffer.concat

// convert byte array to buffer
const toBuffer = Buffer.from

// convert buffer to byte array
const byarr = (x) => Uint8Array.from(x) // Cannot be point-free since Uint8Array.from() needs to be bound to its prototype

// Number to Binary String conversion
const nTobin = (x) => x.toString(2)

// Convert to byte array and apply complement

const compliment = (x) => byarr(x).map(_not)

// Map in steps
const stepMap = curry((callback, step, array) => {
  return array
    .map((d, i, array) => {
      if (i % step === 0) {
        return callback(d, i, array)
      }
    })
    .filter((d, i) => i % step === 0)
})

// Pad with zeroes to get required length
const zeroPad = curry((x, num) => {
  let zero = ''
  for (let i = 0; i < x; i++) {
    zero += '0'
  }
  return zero.slice(String(num).length) + num
})

// Byte array to Binary String conversion
const byteToBin = pipe(Array.from, map(nTobin), map(zeroPad(8)), join(''))

// Binary String to Byte Array conversion
const binToByte = (str) => {
  const arr = []
  for (let i = 0; i < str.length; i += 8) {
    arr.push(pipe(slice(i, i + 8), flip(parseInt)(2))(str))
  }
  return new Uint8Array(arr)
}

const iterativeReplace = (data, patternArray, replaceArray) => {
  let currentData = data;
  const regexes = patternArray.map(pattern => new RegExp(pattern, 'g')); // Pre-compile regexes

  for (let i = patternArray.length - 1; i >= 0; i--) {
    currentData = currentData.replace(regexes[i], replaceArray[i]);
  }
  return currentData;
};

export {
  toBuffer,
  byarr,
  compliment,
  byteToBin,
  nTobin,
  zeroPad,
  binToByte,
  concatBuff,
  buffSlice,
  stepMap,
  iterativeReplace
}
