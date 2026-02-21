import { encrypt, decrypt } from './components/encrypt';
import { compress, decompress, zwcHuffMan } from './components/compact';
import { zwcOperations, embed } from './components/message';
import { byteToBin, compliment } from './components/util';

const ZWC_CHARACTERS: readonly string[] = Object.freeze([
  '\u200C', // Zero-Width Non-Joiner
  '\u200D', // Zero-Width Joiner
  '\u2061', // Function Application
  '\u2062', // Invisible Times
  '\u2063', // Invisible Separator
  '\u2064'  // Invisible Plus
]);

const zwcOps = zwcOperations(ZWC_CHARACTERS);
const huffman = zwcHuffMan(ZWC_CHARACTERS);

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
export class StegCloak {
  static get zwc(): readonly string[] {
    return ZWC_CHARACTERS;
  }

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
  hide(
      message: string,
      password?: string,
      cover: string = 'This is a confidential text'
  ): string {
    if (!message || message.length === 0) {
      throw new Error('Message cannot be empty');
    }

    const wordCount = cover.split(' ').length;
    if (wordCount < 2) {
      throw new Error('Cover text must have at least two words');
    }

    // Step 1: Compress the message
    const compressed = compress(message);

    // Step 2: Apply bitwise complement (simple obfuscation layer)
    const complemented = compliment(compressed);

    // Step 3: Encrypt with AES-256-CTR
    const payload = encrypt({
      password,
      data: complemented
    });

    // Step 4: Convert to binary string
    const binaryString = byteToBin(payload);

    // Step 5: Encode as ZWC
    const flaggedStream = zwcOps.toConceal(binaryString);

    // Step 6: Apply run-length compression to ZWC stream
    const compressedStream = huffman.shrink(flaggedStream);

    // Step 7: Embed in cover text
    return embed(cover, compressedStream);
  }

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
  reveal(secret: string, password?: string): string {
    if (!secret || secret.length === 0) {
      throw new Error('Input cannot be empty');
    }

    // Step 1: Extract hidden ZWC characters
    const detached = zwcOps.detach(secret);

    // Step 2: Expand run-length encoding
    const expanded = huffman.expand(detached);

    // Step 3: Decode ZWC to binary data
    const { data } = zwcOps.concealToData(expanded);

    // Step 4: Decrypt
    const decrypted = decrypt({
      password,
      data
    });

    // Step 5: Reverse bit-complement
    const uncomplemented = compliment(decrypted);

    // Step 6: Decompress and return
    return decompress(uncomplemented);
  }
}

export default StegCloak;