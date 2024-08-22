import { pbkdf2 } from 'crypto';
import { promisify } from 'util';

import typeCheck from '#whiteroom/util/typeCheck.js';
import knex from '#whiteroom/server/db/knex.js';
import {
  loginFieldgroup,
} from '#user/model/userModel.js';

const pbkdf2Async = promisify(pbkdf2);

const HASH_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export default async function isValidUserLogin({ email, password }) {
  typeCheck('email::Email', email);
  typeCheck('password::NonEmptyString', password);

  const user = await knex('users')
    .first(loginFieldgroup)
    .where({
      email,
    });

  if (!user) {
    return {
      success: false,
      reason: 'User not found.',
      fields: {
        email: true,
        password: false,
      },
      userId: null,
    };
  }

  // Extract the salt and hash from the stored password
  const [salt, storedHash] = user.password.split(':');

  // Hash the provided password using the extracted salt
  const derivedHash = await pbkdf2Async(password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST);

  // Convert derived hash to hex and compare with the stored hash
  const passwordIsValid = derivedHash.toString('hex') === storedHash;

  if (!passwordIsValid) {
    return {
      success: false,
      reason: 'Invalid password.',
      fields: {
        email: false,
        password: true,
      },
      userId: null,
    };
  }

  return {
    success: true,
    reason: 'Ok.',
    field: {
      email: false,
      password: false,
    },
    userId: user.id,
  };
}
