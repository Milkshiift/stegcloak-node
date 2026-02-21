export interface CryptoConfig {
    password?: string;
    data: Uint8Array | Buffer;
}
/**
 * Encrypt data using AES-256-CTR with random salt
 *
 * Output format: [salt (8 bytes)][ciphertext]
 *
 * @param config - Encryption configuration
 * @throws {Error} If data is empty
 */
export declare const encrypt: (config: CryptoConfig) => Buffer;
/**
 * Decrypt data encrypted with the encrypt function
 *
 * @param config - Decryption configuration
 * @throws {Error} If data is empty or too short
 */
export declare const decrypt: (config: CryptoConfig) => Buffer;
