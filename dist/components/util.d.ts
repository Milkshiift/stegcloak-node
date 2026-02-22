export declare const ensureBuffer: (data: Uint8Array | Buffer | string) => Buffer;
export declare class StegError extends Error {
    constructor(message: string);
}
/** Thrown when no zero-width characters are found in the string. */
export declare class PayloadNotFoundError extends StegError {
    constructor();
}
/** Thrown when authentication fails. */
export declare class DecryptionError extends StegError {
    constructor();
}
/** Thrown when data is decrypted but cannot be decompressed. */
export declare class IntegrityError extends StegError {
    constructor();
}
