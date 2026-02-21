import crypto from 'node:crypto';
import { zeroPad, nTobin, binToByte } from './util';

export interface ConcealedData {
  encrypt: boolean;
  integrity: boolean;
  data: Uint8Array;
}

export const zwcOperations = (zwc: string[]) => {
  // Map binary to ZWC
  const _binToZWC = (str: string): string => zwc[parseInt(str, 2)]!;

  // Map ZWC to binary
  const _ZWCTobin = (x: string): string => zeroPad(2, nTobin(zwc.indexOf(x)));

  // Data to ZWC hidden string (Using optimal single-pass mapping)
  const _dataToZWC = (integrity: boolean, crypt: boolean, str: string): string => {
    const flag = integrity && crypt ? zwc[0]! : crypt ? zwc[1]! : zwc[2]!;
    let mapped = '';
    for (let i = 0; i < str.length; i += 2) {
      mapped += _binToZWC(str.charAt(i) + str.charAt(i + 1));
    }
    return flag + mapped;
  };

  // Check if encryption or hmac integrity check was performed during encryption
  const flagDetector = (x: string) => {
    const i = zwc.indexOf(x.charAt(0));
    if (i === 0) return { encrypt: true, integrity: true };
    if (i === 1) return { encrypt: true, integrity: false };
    if (i === 2) return { encrypt: false, integrity: false };
    throw new Error('Unknown ZWC flag detected');
  };

  const toConcealHmac = (str: string) => _dataToZWC(true, true, str);
  const toConceal = (str: string) => _dataToZWC(false, true, str);
  const noCrypt = (str: string) => _dataToZWC(false, false, str);

  // ZWC string to data
  const concealToData = (str: string): ConcealedData => {
    const { encrypt, integrity } = flagDetector(str);
    const sliced = str.slice(1);
    let joined = '';

    for (let i = 0; i < sliced.length; i++) {
      joined += _ZWCTobin(sliced.charAt(i));
    }

    return {
      encrypt,
      integrity,
      data: binToByte(joined)
    };
  };

  const detach = (str: string): string => {
    const eachWords = str.split(' ');

    for (const word of eachWords) {
      const zwcBound = word.split('');
      const hasZWC = zwcBound.some(char => zwc.includes(char));

      if (hasZWC) {
        // limit logic returns the index of the first character that IS NOT a ZWC character
        const limit = zwcBound.findIndex((x) => !zwc.includes(x));
        return limit === -1 ? word : word.slice(0, limit);
      }
    }

    throw new Error('Invisible stream not detected! Please copy and paste the Stegcloak text sent by the sender.');
  };

  return {
    detach,
    concealToData,
    toConcealHmac,
    toConceal,
    noCrypt
  };
};

// Embed invisible stream to cover text
export const embed = (cover: string, secret: string): string => {
  const arr = cover.split(' ');
  const targetIndex = crypto.randomInt(0, Math.floor(arr.length / 2));
  const firstPart = arr.slice(0, targetIndex + 1);
  const secondPart = arr.slice(targetIndex + 2, arr.length);

  return [...firstPart, secret + arr[targetIndex + 1], ...secondPart].join(' ');
};
