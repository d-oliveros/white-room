import typeCheck from 'common/util/typeCheck';
import knex from 'server/db/knex';

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
