'use strict'

const {
  intersection,
  indexOf,
  curry,
  slice,
  split,
  join,
  map
} = require('rambda')

const { zeroPad, nTobin, stepMap, binToByte } = require('./util.js')

const zwcOperations = (zwc) => {
  // Map binary to ZWC

  const _binToZWC = (str) => zwc[parseInt(str, 2)]

  // Map ZWC to binary
  const _ZWCTobin = (x) => zeroPad(2)(nTobin(indexOf(x, zwc)))

  // Data to ZWC hidden string

  const _dataToZWC = (integrity, crypt, str) => {
    const flag = integrity && crypt ? zwc[0] : crypt ? zwc[1] : zwc[2]
    const mapped = stepMap((x, i) => _binToZWC(str[i] + str[i + 1]))(
      2,
      new Array(str.length).fill()
    )
    return flag + mapped.join('')
  }

  // Check if encryption or hmac integrity check was performed during encryption

  const flagDetector = (x) => {
    const i = zwc.indexOf(x[0])
    if (i === 0) {
      return {
        encrypt: true,
        integrity: true
      }
    } else if (i === 1) {
      return {
        encrypt: true,
        integrity: false
      }
    } else if (i === 2) {
      return {
        encrypt: false,
        integrity: false
      }
    }
  }

  // Message curried functions

  const toConcealHmac = curry(_dataToZWC)(true)(true)

  const toConceal = curry(_dataToZWC)(false)(true)

  const noCrypt = curry(_dataToZWC)(false)(false)

  // ZWC string to data
  const concealToData = (str) => {
    const { encrypt, integrity } = flagDetector(str)
    const sliced = slice(1, Infinity)(str)
    const splitted = split('')(sliced)
    const mapped = map(_ZWCTobin)(splitted)
    const joined = join('')(mapped)
    return {
      encrypt,
      integrity,
      data: binToByte(joined)
    }
  }

  const detach = (str) => {
    const eachWords = str.split(' ')
    const detached = eachWords.reduce((acc, word) => {
      const zwcBound = word.split('')
      const intersected = intersection(zwc, zwcBound)
      if (intersected.length !== 0) {
        const limit = zwcBound.findIndex((x, i) => !~zwc.indexOf(x))
        return word.slice(0, limit)
      }
      return acc
    }, '')
    if (!detached) {
      throw new Error(
        'Invisible stream not detected! Please copy and paste the StegCloak text sent by the sender.'
      )
    }
    return detached
  }

  return {
    detach,
    concealToData,
    toConcealHmac,
    toConceal,
    noCrypt
  }
}

// Embed invisble stream to cover text

const embed = (cover, secret) => {
  const arr = cover.split(' ')
  const targetIndex = Math.floor(Math.random() * Math.floor(arr.length / 2))
  const firstPart = arr.slice(0, targetIndex + 1)
  const secondPart = arr.slice(targetIndex + 2, arr.length)
  return [...firstPart, secret + arr[targetIndex + 1], ...secondPart].join(' ')
}

module.exports = {
  zwcOperations,
  embed
}
