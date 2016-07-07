import { pick } from 'lodash';
import jwt from 'jsonwebtoken';

const { JWT_KEY, JWT_TMP_EXPIRATION } = process.env;
const options = {
  expiresIn: JWT_TMP_EXPIRATION
};

export function generateToken(user) {
  user = pick(user, '_id', 'roles');
  const token = jwt.sign(user, JWT_KEY);
  return token;
}

export function signTmpToken(user) {
  user = pick(user, '_id', 'roles');
  const token = jwt.sign(user, JWT_KEY, options);
  return token;
}

export async function verify(token) {
  return jwt.verify(token, JWT_KEY);
}
