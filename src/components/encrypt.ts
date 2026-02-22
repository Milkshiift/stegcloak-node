import crypto from 'node:crypto';
import {DecryptionError} from './util';
import argon2 from "argon2";

const ALGORITHM = 'chacha20-poly1305';
export const IV_LENGTH = 12;
export const KEY_LENGTH = 32;
export const AUTH_TAG_LENGTH = 16;

export const deriveKey = async (password: string, salt: Buffer): Promise<Buffer> => {
  // TODO: Switch to crypto.argon2 when Electron updates to node 25
  return await argon2.hash(password, {
    salt: salt,
    parallelism: 4,
    hashLength: KEY_LENGTH,
    memoryCost: 65536,
    timeCost: 3,
    raw: true
  });
};

export const encryptWithKey = (key: Buffer, data: Buffer): Buffer => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, ciphertext]);
};

export const decryptWithKey = (key: Buffer, payload: Buffer): Buffer => {
  const minOverhead = IV_LENGTH + AUTH_TAG_LENGTH;
  if (payload.length < minOverhead) {
    throw new DecryptionError();
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(minOverhead);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH } as any);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (e) {
    throw new DecryptionError();
  }
};