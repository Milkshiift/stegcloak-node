export declare const getZWCCharacters: () => readonly string[];
export declare const hasPayload: (text: string) => boolean;
export declare const embed: (cover: string, secretStream: string) => string;
export declare const extract: (cover: string) => string;
export declare const conceal: (data: Uint8Array | Buffer) => string;
export declare const reveal: (stream: string) => Buffer;
