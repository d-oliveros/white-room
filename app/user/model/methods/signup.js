import bcrypt from 'bcrypt';
import { promisify } from 'util';

import logger from '#white-room/logger.js';
import knex from '#white-room/server/db/knex.js';

const debug = logger.createDebug('models:User:signup');

const SALT_WORK_FACTOR = 8;
const genSaltAsync = promisify(bcrypt.genSalt.bind(bcrypt));
const hashAsync = promisify(bcrypt.hash.bind(bcrypt));

export default async function userSignup(userSignupData) {
  const existingUser = await knex('users')
    .first(['id'])
    .where({ phone: userSignupData.phone });

  if (existingUser) {
    const error = new Error('This user already exists.');
    error.details = {
      phone: userSignupData.phone,
    };
    logger.warn(error);
    return null;
  }

  const salt = await genSaltAsync(SALT_WORK_FACTOR);
  const passwordHash = await hashAsync(userSignupData.password, salt);

  const userRoles = userSignupData.roles || [];

  const userData = {
    ...userSignupData,
    email: userSignupData.email
      ? userSignupData.email.toLowerCase()
      : undefined,
    password: passwordHash,
    roles: userRoles,
  };

  const user = await knex.transaction(async (trx) => {
    let createdUser;

    if (existingUser) {
      [createdUser] = await trx('users')
        .update(userData)
        .where('phone', userSignupData.phone)
        .returning('*');
    }
    else {
      [createdUser] = await trx('users')
        .insert(userData)
        .returning('*');
    }
    return trx.commit(createdUser);
  });

  debug('Created new user', user);

  return user;
}
