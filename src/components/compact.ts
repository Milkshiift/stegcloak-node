import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { ensureBuffer, IntegrityError } from './util';

const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

const BROTLI_OPTIONS: zlib.BrotliOptions = Object.freeze({
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
  }
});

export const compress = async (data: string | Uint8Array | Buffer): Promise<Buffer> => {
  const buf = ensureBuffer(data);
  if (buf.length === 0) throw new Error('Cannot compress empty data');
  return await brotliCompress(buf, BROTLI_OPTIONS);
};

export const decompress = async (data: Uint8Array | Buffer): Promise<Buffer> => {
  const buf = ensureBuffer(data);
  if (buf.length === 0) throw new Error('Cannot decompress empty data');

  try {
    return await brotliDecompress(buf);
  } catch (error) {
    throw new IntegrityError();
  }
};