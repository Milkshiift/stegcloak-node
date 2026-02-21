export interface CryptoConfig {
    password?: string;
    data: Uint8Array | Buffer;
    integrity: boolean;
}
export declare const encrypt: (config: CryptoConfig) => Buffer;
export declare const decrypt: (config: CryptoConfig) => Buffer;
