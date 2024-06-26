import typeCheck from '#common/util/typeCheck.js';
import knex from '#server/db/knex.js';
import { summaryFieldgroup } from '#models/User/fieldgroups.js';

export default async function trackUserVisit({ id, increaseSessionCount }) {
  typeCheck('id::PositiveNumber', id);
  typeCheck('increaseSessionCount::Boolean', increaseSessionCount);

  const userUpdates = {
    lastVisitAt: new Date().toISOString(),
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
