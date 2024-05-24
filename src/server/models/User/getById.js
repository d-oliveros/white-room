import typeCheck from 'common/util/typeCheck';

import knex from 'server/db/knex';

const debug = __log.debug('models:User:getById');

export default async function getById(userId, fieldgroup = '*') {
  typeCheck('userId::Maybe PositiveNumber', userId);

  if (userId === null) {
    return null;
  }

  debug(`Getting user for ${userId}`);

  const user = await knex
    .first(fieldgroup)
    .from('users')
    .where({ id: userId });

  return user;
}
