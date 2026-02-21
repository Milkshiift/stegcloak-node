export declare const compress: (data: string | Buffer) => Buffer;
export declare const decompress: (data: Buffer | Uint8Array) => string;
/**
 * Analyze text to find optimal characters for run-length compression
 * Returns two characters that have the most consecutive pair occurrences
 */
export declare const findOptimal: (secret: string, characters: readonly string[]) => string[];
/**
 * Create Huffman-like encoding functions for ZWC character pairs
 * Uses 2 additional ZWC characters to represent pairs of repeated characters
 */
export declare const zwcHuffMan: (zwc: readonly string[]) => Readonly<{
    shrink: (secret: string) => string;
    expand: (secret: string) => string;
}>;
