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

    if (!cover.includes(' ')) {
      throw new Error('Cover text must have at least two words');
    }

    const compressed = compress(message);
    const complemented = compliment(compressed);

    const payload = encrypt({
      password,
      data: complemented
    });

    const binaryString = byteToBin(payload);
    const flaggedStream = zwcOps.toConceal(binaryString);
    const compressedStream = huffman.shrink(flaggedStream);

    return embed(cover, compressedStream);
  }

  /**
   * Reveal a hidden message from text
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

    const detached = zwcOps.detach(secret);
    const expanded = huffman.expand(detached);
    const { data } = zwcOps.concealToData(expanded);

    const decrypted = decrypt({
      password,
      data
    });

    const uncomplemented = compliment(decrypted);

    return decompress(uncomplemented);
  }
}

export default StegCloak;