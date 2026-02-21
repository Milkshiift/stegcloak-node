export declare class StegCloak {
    encrypt: boolean;
    integrity: boolean;
    constructor(_encrypt?: boolean, _integrity?: boolean);
    static get zwc(): string[];
    hide(message: string, password?: string, cover?: string): string;
    reveal(secret: string, password?: string): string;
}
export default StegCloak;
