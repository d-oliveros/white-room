import bcrypt from 'bcrypt';
import { promisify } from 'util';

import logger from '#whiteroom/logger.js';
import knex, { getAvailableSlug } from '#whiteroom/server/db/knex.js';
import slugify from '#whiteroom/util/slugify.js';

const debug = logger.createDebug('models:User:signup');

const SALT_WORK_FACTOR = 8;
const genSaltAsync = promisify(bcrypt.genSalt.bind(bcrypt));
const hashAsync = promisify(bcrypt.hash.bind(bcrypt));

export default async function signup(userData) {
  const existingUserQuery = knex('users')
    .first(['id', 'email', 'phone'])
    .where({ email: userData.email });

  if (userData.phone) {
    existingUserQuery.orWhere({ phone: userData.phone });
  }

  const existingUser = await existingUserQuery;

  if (existingUser) {
    const message = existingUser.email === userData.email
      ? `email "${existingUser.email}`
      : `phone "${existingUser.phone}`;

    return {
      user: null,
      error: `User with ${message} already exists.`,
    };
  }

  const salt = await genSaltAsync(SALT_WORK_FACTOR);
  const passwordHash = await hashAsync(userData.password, salt);

  const [newUser] = await knex('users')
    .insert({
      ...userData,
      email: userData.email ? userData.email.toLowerCase() : null,
      password: passwordHash,
      roles: userData.roles || [],
      slug: await getAvailableSlug({
        table: 'users',
        field: 'slug',
        value: slugify(`${userData.firstName} ${userData.lastName}`),
      }),
    })
    .returning('*');

  debug('Created new user', newUser);

  return {
    user: newUser,
    error: null,
  };
}
