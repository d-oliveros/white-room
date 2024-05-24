import bcrypt from 'bcrypt';
import { promisify } from 'util';

import {
  ERROR_USER_ALREADY_EXISTS,
} from 'common/errorCodes';
import knex from 'server/db/knex';

const debug = __log.debug('models:User:signup');

const SALT_WORK_FACTOR = 8;
const genSaltAsync = promisify(bcrypt.genSalt.bind(bcrypt));
const hashAsync = promisify(bcrypt.hash.bind(bcrypt));

export default async function userSignup(userSignupData) {
  const existingUser = knex('users')
    .first(['id', 'status'])
    .where({ phone: userSignupData.phone });

  if (existingUser) {
    const error = new Error('This user already exists.');
    error.name = ERROR_USER_ALREADY_EXISTS;
    error.details = {
      phone: userSignupData.phone,
    };
    __log.warn(error);
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

    await trx
      .into('userMoveInDates')
      .insert({
        userId: createdUser.id,
        moveInDate: createdUser.moveInDate,
        createdDate: createdUser.moveInDateUpdatedDate,
        moveInInstance: 1,
      });

    return trx.commit(createdUser);
  });

  debug('Created new user', user);

  return user;
}
