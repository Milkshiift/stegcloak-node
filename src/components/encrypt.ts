import crypto from 'node:crypto';
import { toBuffer, concatBuff, buffSlice } from './util';

export interface CryptoConfig {
  password?: string;
  data: Uint8Array | Buffer;
  integrity: boolean;
}

interface EncryptPayload {
  iv: Buffer;
  key: Buffer;
  secret: Buffer;
}

interface DecryptPayload extends EncryptPayload {
  hmacData?: Buffer;
}

// Key generation from a password
const _genKey = (password: string = '', salt: Buffer): Buffer =>
    crypto.pbkdf2Sync(password, salt, 10000, 48, 'sha512');

// Extracting parameters for encryption
const _extractEncrypt = (config: CryptoConfig, salt: Buffer): EncryptPayload => {
  const data = toBuffer(config.data);
  const ivKey = _genKey(config.password, salt);
  return {
    secret: data,
    iv: buffSlice(ivKey, 0, 16),
    key: buffSlice(ivKey, 16)
  };
};

// Extracting parameters for decryption
const _extractDecrypt = (config: CryptoConfig): DecryptPayload => {
  const data = toBuffer(config.data);
  const salt = buffSlice(data, 0, 8);
  let hmacData: Buffer | undefined;
  let secret: Buffer;

  if (config.integrity) {
    hmacData = buffSlice(data, 8, 40);
    secret = buffSlice(data, 40);
  } else {
    secret = buffSlice(data, 8);
  }

  const ivKey = _genKey(config.password, salt);
  return {
    secret,
    hmacData,
    iv: buffSlice(ivKey, 0, 16),
    key: buffSlice(ivKey, 16)
  };
};

// Aes stream cipher with random salt and iv -> encrypt an array
export const encrypt = (config: CryptoConfig): Buffer => {
  const salt = crypto.randomBytes(8);
  const { iv, key, secret } = _extractEncrypt(config, salt);
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);

  const payload = concatBuff([cipher.update(secret), cipher.final()]);

  if (config.integrity) {
    const hmac = crypto.createHmac('sha256', key).update(secret).digest();
    return concatBuff([salt, hmac, payload]);
  }
  return concatBuff([salt, payload]);
};

export const decrypt = (config: CryptoConfig): Buffer => {
  const { iv, key, secret, hmacData } = _extractDecrypt(config);
  const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);

  const decrypted = concatBuff([decipher.update(secret), decipher.final()]);

  if (config.integrity && hmacData) {
    const vHmac = crypto.createHmac('sha256', key).update(decrypted).digest();
    if (!crypto.timingSafeEqual(hmacData, vHmac)) {
      throw new Error('Wrong password or Wrong payload (Hmac Integrity failure)');
    }
  }
  return decrypted;
};