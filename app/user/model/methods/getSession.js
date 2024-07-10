import typeCheck from '#white-room/util/typeCheck.js';
import knex from '#white-room/server/db/knex.js';

import {
  summaryFieldgroup,
} from '#user/model/user.js';

export default async function getSession(userId) {
  typeCheck('userId::PositiveNumber', userId);

  const user = await knex('users')
    .first(summaryFieldgroup)
    .where({ id: userId });

  return user;
}
