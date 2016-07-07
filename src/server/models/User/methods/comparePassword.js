import bcrypt from 'bcrypt';
import { promisify } from 'bluebird';

const compare = promisify(bcrypt.compare);

export default async function comparePassword(candidatePassword) {
  return await compare(candidatePassword, this.password);
}
