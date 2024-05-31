import typeCheck from '#common/util/typeCheck.js';
import knex from '#server/db/knex.js';

export default async function getList({ where, fieldgroup } = {}) {
  typeCheck('where::Maybe NonEmptyObject', where);

  const queryChain = knex('users')
    .select(fieldgroup || '*');

  if (where?.role) {
    queryChain.whereRaw(`'${where.role}' = ANY(roles)`);
  }

  if (where?.excludeRoles) {
    queryChain.whereRaw(`NOT roles && '{${where.excludeRoles.join(', ')}}'::text[]`);
  }

  return queryChain;
}
