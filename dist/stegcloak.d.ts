export { PayloadNotFoundError, DecryptionError, IntegrityError } from './components/util';
export declare class StegCloak {
    private keyCache;
    constructor();
    static get zwc(): readonly string[];
    private getKey;
    hide(message: string, password: string, salt: string, cover: string): Promise<string>;
    reveal(secret: string, password: string, salt: string): Promise<string>;
    static isCloaked(text: string): boolean;
}
export default StegCloak;
