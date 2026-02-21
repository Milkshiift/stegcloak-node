/**
 * Utility functions for Stegcloak
 */
export declare const buffSlice: (x: Uint8Array | Buffer, y: number, z?: number) => Buffer;
export declare const concatBuff: (list: readonly Uint8Array[], totalLength?: number) => Buffer<ArrayBuffer>;
export declare const toBuffer: (data: Uint8Array | number[]) => Buffer;
export declare const byarr: (x: Buffer | Uint8Array | number[]) => Uint8Array;
export declare const nTobin: (x: number) => string;
export declare const compliment: (x: Uint8Array | Buffer) => Uint8Array;
export declare const zeroPad: (padLength: number, num: string | number) => string;
export declare const byteToBin: (arr: Uint8Array | Buffer) => string;
export declare const binToByte: (str: string) => Uint8Array;
export declare const iterativeReplace: (data: string, patternArray: string[], replaceArray: string[]) => string;
