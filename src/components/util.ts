export const ensureBuffer = (data: Uint8Array | Buffer | string): Buffer => {
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === 'string') return Buffer.from(data, 'utf8');
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
};

export class StegError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Thrown when no zero-width characters are found in the string. */
export class PayloadNotFoundError extends StegError {
  constructor() {
    super('No hidden payload found in the cover text.');
  }
}

/** Thrown when authentication fails. */
export class DecryptionError extends StegError {
  constructor() {
    super('Decryption failed. Wrong password or salt.');
  }
}

/** Thrown when data is decrypted but cannot be decompressed. */
export class IntegrityError extends StegError {
  constructor() {
    super('Data integrity check failed. The payload may be corrupted.');
  }
}