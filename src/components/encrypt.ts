import crypto from 'node:crypto';
import { toBuffer, concatBuff, buffSlice } from './util';

// ============================================================================
// Constants
// ============================================================================

const SALT_LENGTH = 8;
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 10000;
const PBKDF2_DIGEST = 'sha512';
const CIPHER_ALGORITHM = 'aes-256-ctr';

// ============================================================================
// Types
// ============================================================================

export interface CryptoConfig {
  password?: string;
  data: Uint8Array | Buffer;
}

interface CryptoPayload {
  iv: Buffer;
  key: Buffer;
  secret: Buffer;
}

// ============================================================================
// Private Functions
// ============================================================================

const _genKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      IV_LENGTH + KEY_LENGTH,
      PBKDF2_DIGEST
  );
};

const _extractEncrypt = (config: CryptoConfig, salt: Buffer): CryptoPayload => {
  const data = toBuffer(config.data);
  const password = config.password ?? '';
  const ivKey = _genKey(password, salt);

  return {
    secret: data,
    iv: buffSlice(ivKey, 0, IV_LENGTH),
    key: buffSlice(ivKey, IV_LENGTH, IV_LENGTH + KEY_LENGTH)
  };
};

const _extractDecrypt = (config: CryptoConfig): CryptoPayload => {
  const data = toBuffer(config.data);
  const minLength = SALT_LENGTH + 1;

  if (data.length < minLength) {
    throw new Error('Invalid encrypted data: payload too short');
  }

  const salt = buffSlice(data, 0, SALT_LENGTH);
  const secret = buffSlice(data, SALT_LENGTH);

  const password = config.password ?? '';
  const ivKey = _genKey(password, salt);

  return {
    secret,
    iv: buffSlice(ivKey, 0, IV_LENGTH),
    key: buffSlice(ivKey, IV_LENGTH, IV_LENGTH + KEY_LENGTH)
  };
};

// ============================================================================
// Public Functions
// ============================================================================

export const encrypt = (config: CryptoConfig): Buffer => {
  if (!config.data || config.data.length === 0) {
    throw new Error('Cannot encrypt empty data');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const { iv, key, secret } = _extractEncrypt(config, salt);

  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
  return concatBuff([salt, cipher.update(secret), cipher.final()]);
};

export const decrypt = (config: CryptoConfig): Buffer => {
  if (!config.data || config.data.length === 0) {
    throw new Error('Cannot decrypt empty data');
  }

  const { iv, key, secret } = _extractDecrypt(config);

  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);
  return concatBuff([decipher.update(secret), decipher.final()]);
};