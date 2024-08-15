import logger from '#whiteroom/logger.js';
import knex from '#whiteroom/server/db/knex.js';

import makePasswordHash from '#user/model/methods/makePasswordHash.js';

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
