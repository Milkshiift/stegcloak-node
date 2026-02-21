/**
 * StegCloak - Hide secrets in plain text using zero-width characters
 *
 * This class provides methods to hide and reveal secret messages within
 * ordinary text using invisible Unicode characters. All messages are
 * encrypted using AES-256-CTR.
 *
 * @example
 * ```typescript
 * const cloak = new StegCloak();
 *
 * // Hide a secret message
 * const hidden = cloak.hide("secret message", "password123", "Hello World!");
 * // Result: "Hello ‌‍⁡⁢World!" (invisible characters embedded)
 *
 * // Reveal the hidden message
 * const revealed = cloak.reveal(hidden, "password123");
 * // Result: "secret message"
 * ```
 */
export declare class StegCloak {
    static get zwc(): readonly string[];
    /**
     * Hide a secret message within cover text
     *
     * The message is:
     * 1. Compressed using Brotli
     * 2. Bit-complemented (simple obfuscation)
     * 3. Encrypted with AES-256-CTR
     * 4. Encoded as zero-width characters
     * 5. Embedded into the cover text
     *
     * @param message - The secret message to hide (must not be empty)
     * @param password - Encryption password (if omitted, uses empty password)
     * @param cover - Cover text to embed the secret in
     *                Must contain at least 2 space-separated words
     *                Default: "This is a confidential text"
     * @returns Cover text with hidden message embedded
     *
     * @throws {Error} If message is empty
     * @throws {Error} If cover text has fewer than 2 words
     */
    hide(message: string, password?: string, cover?: string): string;
    /**
     * Reveal a hidden message from text
     *
     * Reverses the hide() process:
     * 1. Extract zero-width characters from text
     * 2. Decompress run-length encoding
     * 3. Decode ZWC to binary
     * 4. Decrypt with AES-256-CTR
     * 5. Reverse bit-complement
     * 6. Decompress with Brotli
     *
     * @param secret - Text containing hidden message
     * @param password - Decryption password
     * @returns The revealed secret message
     *
     * @throws {Error} If no hidden message is found
     * @throws {Error} If decryption fails (wrong password or corrupted data)
     */
    reveal(secret: string, password?: string): string;
}
export default StegCloak;
