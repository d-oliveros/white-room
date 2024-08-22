import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';

const SALT_SIZE = 16;
const HASH_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

const pbkdf2Async = promisify(pbkdf2);

export default async function makePasswordHash(password) {
  // Generate a random salt
  const salt = randomBytes(SALT_SIZE).toString('hex');

  // Hash the password with the generated salt
  const passwordHash = await pbkdf2Async(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST);

  // Return the hash as a hexadecimal string along with the salt
  return `${salt}:${passwordHash.toString('hex')}`;
}
