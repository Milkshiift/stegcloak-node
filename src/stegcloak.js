'use strict'

import { pipe } from 'rambda'

import {
  encrypt,
  decrypt
} from './components/encrypt.js'

import {
  compress,
  decompress,
  zwcHuffMan
} from './components/compact.js'

import {
  zwcOperations,
  embed
} from './components/message.js'

import {
  byteToBin,
  compliment
} from './components/util.js'

const zwc = ['‌', '‍', '⁡', '⁢', '⁣', '⁤'] // 200c,200d,2061,2062,2063,2064 Where the magic happens !

const {
  toConceal,
  toConcealHmac,
  concealToData,
  noCrypt,
  detach
} = zwcOperations(zwc)

const {
  shrink,
  expand
} = zwcHuffMan(zwc)

class StegCloak {
  constructor (_encrypt = true, _integrity = false) {
    this.encrypt = _encrypt

    this.integrity = _integrity
  }

  static get zwc () {
    return zwc
  }

  hide (message, password, cover = 'This is a confidential text') {
    if (cover.split(' ').length === 1) {
      throw new Error('Minimum two words required')
    }

    const integrity = this.integrity

    const crypt = this.encrypt

    const secret = pipe(compress, compliment)(message) // Compress and compliment to prepare the secret

    const payload = crypt
      ? encrypt({
        password,
        data: secret,
        integrity
      })
      : secret // Encrypt if needed or proxy secret

    const invisibleStream = pipe(
      byteToBin,
      integrity && crypt ? toConcealHmac : crypt ? toConceal : noCrypt,
      shrink
    )(payload) // Create an optimal invisible stream of secret

    return embed(cover, invisibleStream) // Embed stream  with cover text
  }

  reveal (secret, password) {
    // Detach invisible characters and convert back to visible characters and also returns analysis of if encryption or integrity check was done

    const {
      data,
      integrity,
      encrypt
    } = pipe(
      detach,
      expand,
      concealToData
    )(secret)

    const decryptStream = encrypt
      ? decrypt({
        password,
        data,
        integrity
      })
      : data // Decrypt if needed or proxy secret

    return decompress(compliment(decryptStream)) // Receive the secret
  }
}

export default StegCloak
