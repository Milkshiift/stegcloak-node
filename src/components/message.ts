import { ensureBuffer, PayloadNotFoundError } from './util';

const ZWC = Object.freeze([
  '\u200B', '\u200C', '\u200D', '\u200E', '\u200F',
  '\u2060', '\u2062', '\u2063',
  '\uFE00', '\uFE01', '\uFE02', '\uFE03', '\uFE04', '\uFE05',
  '\uFE0F', '\uFEFF'
]);

const ZWC_MAP = new Map<string, number>(ZWC.map((char, index) => [char, index]));
const ZWC_REGEX = new RegExp(`[${ZWC.join('')}]+`, 'g');

export const getZWCCharacters = () => ZWC;

export const hasPayload = (text: string): boolean => {
  if (!text) return false;
  return text.search(ZWC_REGEX) !== -1;
};

export const embed = (cover: string, secretStream: string): string => {
  const words = cover.split(/(\s+)/);

  const spaces = words.filter((_, i) => i % 2 !== 0);
  const textBlocks = words.filter((_, i) => i % 2 === 0);

  const spacesCount = spaces.length;

  // Fallback: If there are no spaces (single word) or cover is empty,
  // we cannot interleave. We simply append the invisible stream to the end.
  if (spacesCount === 0) {
    return cover + secretStream;
  }

  const charsCount = secretStream.length;
  let result = textBlocks[0];
  let payloadIndex = 0;

  for (let i = 0; i < spacesCount; i++) {
    const charsForThisSpace = Math.floor(charsCount / spacesCount) + (i < charsCount % spacesCount ? 1 : 0);
    const chunk = secretStream.slice(payloadIndex, payloadIndex + charsForThisSpace);
    payloadIndex += charsForThisSpace;

    result += chunk + spaces[i] + textBlocks[i + 1];
  }

  return result!;
};

export const extract = (cover: string): string => {
  if (!cover) throw new PayloadNotFoundError();

  const matches = cover.match(ZWC_REGEX);

  if (!matches || matches.length === 0) {
    throw new PayloadNotFoundError();
  }

  return matches.join('');
};

export const conceal = (data: Uint8Array | Buffer): string => {
  const buf = ensureBuffer(data);
  const output = new Array(buf.length * 2);

  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i]!;
    output[i * 2]     = ZWC[byte >> 4];       // Top 4 bits
    output[i * 2 + 1] = ZWC[byte & 0x0F];     // Bottom 4 bits
  }

  return output.join('');
};

export const reveal = (stream: string): Buffer => {
  const buf = Buffer.alloc(Math.floor(stream.length / 2));

  for (let i = 0; i < buf.length; i++) {
    const high = ZWC_MAP.get(stream[i * 2]!) || 0;
    const low = ZWC_MAP.get(stream[i * 2 + 1]!) || 0;
    buf[i] = (high << 4) | low;
  }

  return buf;
};