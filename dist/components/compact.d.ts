export declare const compress: (x: string | Buffer) => Buffer;
export declare const decompress: (x: Buffer | Uint8Array) => string;
export declare const findOptimal: (secret: string, characters: string[]) => string[];
export declare const zwcHuffMan: (zwc: string[]) => {
    shrink: (secret: string) => string;
    expand: (secret: string) => string;
};
