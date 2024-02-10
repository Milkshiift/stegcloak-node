'use strict'

const crypto = require('crypto')
const { createCipheriv, createDecipheriv } = crypto
const randomBytes = crypto.randomBytes
const pbkdf2Sync = crypto.pbkdf2Sync
const createHmac = crypto.createHmac
const timeSafeCheck = crypto.timingSafeEqual
const { toBuffer, concatBuff, buffSlice } = require('./util.js')

// Key generation from a password

const _genKey = (password, salt) =>
  pbkdf2Sync(password, salt, 10000, 48, 'sha512')

// Aes stream cipher with random salt and iv -> encrypt an array -- input {password,data,integrity:bool}

const encrypt = (config) => {
  // Impure function Side-effects!
  const salt = randomBytes(8)
  const { iv, key, secret } = _extract('encrypt', config, salt)
  const cipher = createCipheriv('aes-256-ctr', key, iv)
  const payload = concatBuff([cipher.update(secret, 'utf8'), cipher.final()])
  if (config.integrity) {
    const hmac = createHmac('sha256', key).update(secret).digest()
    return concatBuff([salt, hmac, payload])
  }
  return concatBuff([salt, payload])
}

const decrypt = (config) => {
  const { iv, key, secret, hmacData } = _extract('decrypt', config, null)
  const decipher = createDecipheriv('aes-256-ctr', key, iv)
  const decrypted = concatBuff([
    decipher.update(secret, 'utf8'),
    decipher.final()
  ])
  if (config.integrity) {
    const vHmac = createHmac('sha256', key).update(decrypted).digest()
    if (!timeSafeCheck(hmacData, vHmac)) {
      throw new Error(
        'Wrong password or Wrong payload (Hmac Integrity failure) '
      )
    }
  }
  return decrypted
}

// Extracting parameters for encrypt/decrypt from provided input

const _extract = (mode, config, salt) => {
  const data = toBuffer(config.data)
  const output = {}
  if (mode === 'encrypt') {
    output.secret = data
  } else if (mode === 'decrypt') {
    salt = buffSlice(data, 0, 8)
    if (config.integrity) {
      output.hmacData = buffSlice(data, 8, 40)
      output.secret = buffSlice(data, 40)
    } else {
      output.secret = buffSlice(data, 8)
    }
  }

  const ivKey = _genKey(config.password, salt)
  output.iv = buffSlice(ivKey, 0, 16)
  output.key = buffSlice(ivKey, 16)
  return output
}

module.exports = {
  encrypt,
  decrypt
}
