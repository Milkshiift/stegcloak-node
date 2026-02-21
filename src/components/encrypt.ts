import crypto from 'node:crypto';
import { toBuffer, concatBuff, buffSlice } from './util';

// ============================================================================
// Constants
// ============================================================================

/** Salt length in bytes */
const SALT_LENGTH = 8;

/** Initialization vector length in bytes */
const IV_LENGTH = 16;

/** AES-256 key length in bytes */
const KEY_LENGTH = 32;

/** PBKDF2 iteration count */
const PBKDF2_ITERATIONS = 10000;

/** PBKDF2 hash algorithm */
const PBKDF2_DIGEST = 'sha512';

/** Cipher algorithm */
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

/**
 * Derive key material from password using PBKDF2
 * @returns Buffer containing IV (16 bytes) + Key (32 bytes)
 */
const _genKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      IV_LENGTH + KEY_LENGTH,
      PBKDF2_DIGEST
  );
};

/**
 * Extract encryption parameters from config
 */
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

/**
 * Extract decryption parameters from encrypted data
 * @throws {Error} If data is too short to be valid
 */
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

/**
 * Encrypt data using AES-256-CTR with random salt
 *
 * Output format: [salt (8 bytes)][ciphertext]
 *
 * @param config - Encryption configuration
 * @throws {Error} If data is empty
 */
export const encrypt = (config: CryptoConfig): Buffer => {
  if (!config.data || config.data.length === 0) {
    throw new Error('Cannot encrypt empty data');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const { iv, key, secret } = _extractEncrypt(config, salt);

  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
  const ciphertext = concatBuff([cipher.update(secret), cipher.final()]);

  return concatBuff([salt, ciphertext]);
};

/**
 * Decrypt data encrypted with the encrypt function
 *
 * @param config - Decryption configuration
 * @throws {Error} If data is empty or too short
 */
export const decrypt = (config: CryptoConfig): Buffer => {
  if (!config.data || config.data.length === 0) {
    throw new Error('Cannot decrypt empty data');
  }

  const { iv, key, secret } = _extractDecrypt(config);

  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);
  return concatBuff([decipher.update(secret), decipher.final()]);
};