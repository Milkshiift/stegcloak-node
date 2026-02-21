export interface ConcealedData {
    encrypt: boolean;
    integrity: boolean;
    data: Uint8Array;
}
export declare const zwcOperations: (zwc: string[]) => {
    detach: (str: string) => string;
    concealToData: (str: string) => ConcealedData;
    toConcealHmac: (str: string) => string;
    toConceal: (str: string) => string;
    noCrypt: (str: string) => string;
};
export declare const embed: (cover: string, secret: string) => string;
