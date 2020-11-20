import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import util from 'util';

import { ConfigService } from '@app/shared/config.service';
import { Provider } from '@nestjs/common';
import { PRIVATE_KEY, PUBLIC_KEY } from './auth.constants';

const existsAsync = util.promisify(fs.exists);
const readFileAsync = util.promisify(fs.readFile);

export const privateKeyProvider: Provider = {
  inject: [ConfigService],
  useFactory: getPrivateKey,
  provide: PRIVATE_KEY,
}
Object.freeze(privateKeyProvider);

export const publicKeyProvider: Provider = {
  inject: [ConfigService],
  useFactory: getPublicKey,
  provide: PUBLIC_KEY,
}
Object.freeze(publicKeyProvider);

/**
 * Read the private key file, and return the KeyObject that represents it
 */
export async function getPrivateKey(conf: ConfigService): Promise<crypto.KeyObject> {
  const filePath = conf.get('AUTH_PRIVATE_KEY') || 'keys/rsa_private.pem';

  const fullPath = path.join(process.cwd(), filePath);
  const exists = await existsAsync(fullPath);

  if (!exists) {
    throw new Error(`Private key does not exist at provided path: \n ${fullPath}`)
  }

  const contents: Buffer = await readFileAsync(fullPath);
  return crypto.createPrivateKey(contents);
}

/**
 * Read the public key file, and return the KeyObject that represents it
 */
export async function getPublicKey(conf: ConfigService): Promise<crypto.KeyObject> {
  const filePath = conf.get('AUTH_PUBLIC_KEY') || 'keys/rsa_public.pem';

  const fullPath = path.join(process.cwd(), filePath);
  const exists = await existsAsync(fullPath);

  if (!exists) {
    throw new Error(`Public key does not exist at provided path: \n ${fullPath}`)
  }

  const contents: Buffer = await readFileAsync(fullPath);
  return crypto.createPublicKey(contents);
}
