import knex from 'server/db/knex';
import makePasswordHash from './makePasswordHash';

const debug = __log.debug('models:User:updatePassword');

export default async function updatePassword(userId, password) {
  const passwordHash = await makePasswordHash(password);

  const [user] = await knex('users')
    .update({ password: passwordHash })
    .where({ id: userId })
    .returning('*');

  debug('User password updated', userId);

  return user;
}
