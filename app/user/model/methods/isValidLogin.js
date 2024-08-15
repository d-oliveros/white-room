import bcrypt from 'bcrypt';
import { promisify } from 'util';

import typeCheck from '#whiteroom/util/typeCheck.js';
import knex from '#whiteroom/server/db/knex.js';
import {
  loginFieldgroup,
} from '#user/model/userModel.js';

const compareAsync = promisify(bcrypt.compare);

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
  const passwordIsValid = await compareAsync(password, user.password);

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
