import typeCheck from '#common/util/typeCheck.js';
import knex from '#server/db/knex.js';

import {
  summaryFieldgroup,
} from '#models/User/fieldgroups.js';

export default async function getSession(userId) {
  typeCheck('userId::PositiveNumber', userId);

  const user = await knex('users')
    .first(summaryFieldgroup)
    .where({ id: userId });

  return user;
}
