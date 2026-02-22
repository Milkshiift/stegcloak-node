export declare const IV_LENGTH = 12;
export declare const KEY_LENGTH = 32;
export declare const AUTH_TAG_LENGTH = 16;
export declare const deriveKey: (password: string, salt: Buffer) => Promise<Buffer>;
export declare const encryptWithKey: (key: Buffer, data: Buffer) => Buffer;
export declare const decryptWithKey: (key: Buffer, payload: Buffer) => Buffer;
