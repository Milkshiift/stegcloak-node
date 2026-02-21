export interface ConcealedData {
    data: Uint8Array;
}
export declare const zwcOperations: (zwc: readonly string[]) => Readonly<{
    detach: (str: string) => string;
    concealToData: (str: string) => ConcealedData;
    toConceal: (binaryStr: string) => string;
}>;
/**
 * Embed invisible stream into cover text at a random position
 * The secret is prepended to a word in the first half of the text
 */
export declare const embed: (cover: string, secret: string) => string;
