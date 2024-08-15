import typeCheck from '#whiteroom/util/typeCheck.js';
import knex from '#whiteroom/server/db/knex.js';

import {
  summaryFieldgroup,
} from '#user/model/userModel.js';

export default async function getSession(userId) {
  typeCheck('userId::PositiveNumber', userId);

  const user = await knex('users')
    .first(summaryFieldgroup)
    .where({ id: userId });

  return user;
}
