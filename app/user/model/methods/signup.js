import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';

import logger from '#whiteroom/logger.js';
import knex, { getAvailableSlug } from '#whiteroom/server/db/knex.js';
import slugify from '#whiteroom/util/slugify.js';

const debug = logger.createDebug('models:User:signup');

const SALT_SIZE = 16;
const HASH_ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

const pbkdf2Async = promisify(pbkdf2);

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

  // Generate a random salt
  const salt = randomBytes(SALT_SIZE).toString('hex');

  // Hash the password with the generated salt
  const passwordHash = await pbkdf2Async(userData.password, salt, HASH_ITERATIONS, KEY_LENGTH, DIGEST);

  const [newUser] = await knex('users')
    .insert({
      ...userData,
      email: userData.email ? userData.email.toLowerCase() : null,
      password: `${salt}:${passwordHash.toString('hex')}`, // Store salt and hash together
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
