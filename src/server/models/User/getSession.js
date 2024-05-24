import typeCheck from 'common/util/typeCheck';
import knex from 'server/db/knex';

import {
  summaryFieldgroup,
} from 'server/models/User/fieldgroups';

export default async function getSession(userId) {
  typeCheck('userId::PositiveNumber', userId);

  const user = await knex('users')
    .first(summaryFieldgroup)
    .where({ id: userId });

  return user;
}
