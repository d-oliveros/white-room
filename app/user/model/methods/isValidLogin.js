import assert from 'assert';
import bcrypt from 'bcrypt';
import { promisify } from 'util';

import knex from '#white-room/server/db/knex.js';
import {
  loginFieldgroup,
} from '#user/model/userFieldgroups.js';

const compareAsync = promisify(bcrypt.compare);

export default async function isValidUserLogin({ phone, password }) {
  assert(phone, 'Phone is required.');
  assert(password, 'Password is required.');

  const [user] = await knex('users')
    .select(...loginFieldgroup)
    .where({
      phone,
    });

  if (!user) {
    return {
      success: false,
      reason: 'User not found.',
      fields: {
        phone: true,
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
        phone: false,
        password: true,
      },
      userId: null,
    };
  }

  return {
    success: true,
    reason: 'Ok.',
    field: {
      phone: false,
      password: false,
    },
    userId: user.id,
  };
}
