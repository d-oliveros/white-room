import bcrypt from 'bcrypt';
import { promisify } from 'util';

const SALT_WORK_FACTOR = 8;
const genSaltAsync = promisify(bcrypt.genSalt.bind(bcrypt));
const hashAsync = promisify(bcrypt.hash.bind(bcrypt));

export default async function makePasswordHash(password) {
  const salt = await genSaltAsync(SALT_WORK_FACTOR);
  const passwordHash = await hashAsync(password, salt);
  return passwordHash;
}
