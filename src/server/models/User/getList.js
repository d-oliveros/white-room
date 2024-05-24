import typeCheck from 'common/util/typeCheck';
import knex from 'server/db/knex';

export default async function getList({ filters, fieldgroup } = {}) {
  typeCheck('filters::NonEmptyObject', filters);

  const queryChain = knex('users')
    .select(fieldgroup || '*');

  if (filters.role) {
    queryChain.whereRaw(`'${filters.role}' = ANY(roles)`);
  }

  if (filters.excludeRoles) {
    queryChain.whereRaw(`NOT roles && '{${filters.excludeRoles.join(', ')}}'::text[]`);
  }

  return queryChain;
}
