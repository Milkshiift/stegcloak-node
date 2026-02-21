import { encrypt, decrypt } from './components/encrypt';
import { compress, decompress, zwcHuffMan } from './components/compact';
import { zwcOperations, embed } from './components/message';
import { byteToBin, compliment } from './components/util';

const zwc = ['‌', '‍', '⁡', '⁢', '⁣', '⁤']; // 200c,200d,2061,2062,2063,2064 Where the magic happens !

const {
  toConceal,
  toConcealHmac,
  concealToData,
  noCrypt,
  detach
} = zwcOperations(zwc);

const { shrink, expand } = zwcHuffMan(zwc);

export class StegCloak {
  public encrypt: boolean;
  public integrity: boolean;

  constructor(_encrypt: boolean = true, _integrity: boolean = false) {
    this.encrypt = _encrypt;
    this.integrity = _integrity;
  }

  static get zwc(): string[] {
    return zwc;
  }

  hide(message: string, password?: string, cover: string = 'This is a confidential text'): string {
    if (cover.split(' ').length === 1) {
      throw new Error('Minimum two words required');
    }

    const compressed = compress(message);
    const secret = compliment(compressed); // Compress and compliment to prepare the secret

    const payload = this.encrypt
        ? encrypt({
          password,
          data: secret,
          integrity: this.integrity
        })
        : secret; // Encrypt if needed or proxy secret

    // Create an optimal invisible stream of secret
    const binString = byteToBin(payload);

    let streamFlagged: string;
    if (this.integrity && this.encrypt) {
      streamFlagged = toConcealHmac(binString);
    } else if (this.encrypt) {
      streamFlagged = toConceal(binString);
    } else {
      streamFlagged = noCrypt(binString);
    }

    const invisibleStream = shrink(streamFlagged);

    return embed(cover, invisibleStream); // Embed stream with cover text
  }

  reveal(secret: string, password?: string): string {
    // Detach invisible characters and convert back to visible characters
    // and also returns analysis of if encryption or integrity check was done

    const detached = detach(secret);
    const expanded = expand(detached);

    const { data, integrity, encrypt: isEncrypted } = concealToData(expanded);

    const decryptStream = isEncrypted
        ? decrypt({
          password,
          data,
          integrity
        })
        : data; // Decrypt if needed or proxy secret

    const uncomplimented = compliment(decryptStream);

    return decompress(uncomplimented); // Receive the secret
  }
}

export default StegCloak;