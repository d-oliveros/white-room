import typeCheck from 'common/util/typeCheck';
import knex from 'server/db/knex';
import { summaryFieldgroup } from 'server/models/User/fieldgroups';

export default async function trackUserVisit({ id, increaseSessionCount }) {
  typeCheck('id::PositiveNumber', id);
  typeCheck('increaseSessionCount::Boolean', increaseSessionCount);

  const userUpdates = {
    lastVisitDate: new Date().toISOString(),
  };

  if (increaseSessionCount) {
    userUpdates.sessionCount = knex.raw('"sessionCount" + 1');
  }

  const [user] = await knex('users')
    .update(userUpdates)
    .where({ id })
    .returning(summaryFieldgroup);

  return user;
}
