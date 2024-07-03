import logger from '#common/logger.js';
import knex from '#server/db/knex.js';
import makePasswordHash from '#models/User/makePasswordHash.js';

const debug = logger.createDebug('models:User:updatePassword');

export default async function updatePassword(userId, password) {
  const passwordHash = await makePasswordHash(password);

  const [user] = await knex('users')
    .update({ password: passwordHash })
    .where({ id: userId })
    .returning('*');

  debug('User password updated', userId);

  return user;
}
