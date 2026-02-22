import { deriveKey, encryptWithKey, decryptWithKey } from './components/encrypt';
import { compress, decompress } from './components/compact';
import {conceal, reveal, embed, extract, getZWCCharacters, hasPayload} from './components/message';
export { PayloadNotFoundError, DecryptionError, IntegrityError } from './components/util';

export class StegCloak {
  private keyCache: Map<string, Buffer>;

  constructor() {
    this.keyCache = new Map();
  }

  static get zwc(): readonly string[] {
    return getZWCCharacters();
  }

  private async getKey(password: string, salt: string): Promise<Buffer> {
    const cacheKey = `${salt}::${password}`;

    let key = this.keyCache.get(cacheKey);
    if (!key) {
      key = await deriveKey(password, Buffer.from(salt, 'utf8'));
      this.keyCache.set(cacheKey, key);
    }
    return key;
  }

  async hide(message: string, password: string, salt: string, cover: string): Promise<string> {
    if (!password) throw new Error('Password is required');
    if (!message) throw new Error('Message cannot be empty');
    if (!salt) throw new Error('Salt is required');

    const key = await this.getKey(password, salt);
    const inputBuf = Buffer.from(message, 'utf8');

    const compressed = await compress(inputBuf);

    const encrypted = encryptWithKey(key, compressed);
    const hiddenPayload = conceal(encrypted);

    return embed(cover, hiddenPayload);
  }

  async reveal(secret: string, password: string, salt: string): Promise<string> {
    if (!password) throw new Error('Password is required');
    if (!secret) throw new Error('Input cannot be empty');
    if (!salt) throw new Error('Salt (e.g., Chatroom ID) is required');

    const hiddenPayload = extract(secret);
    const encryptedData = reveal(hiddenPayload);

    const key = await this.getKey(password, salt);

    const decryptedData = decryptWithKey(key, encryptedData);

    const decompressed = await decompress(decryptedData);

    return decompressed.toString('utf8');
  }

  static isCloaked(text: string): boolean {
    return hasPayload(text);
  }
}

export default StegCloak;