import assert from 'assert';
import knex from '#white-room/server/db/knex.js';

const {
  NODE_ENV,
} = process.env;

const ignoreTables = [
  'spatial_ref_sys',
];

export default async function clearDb() {
  assert(NODE_ENV !== 'production', 'Not enabled in production mode.');
  const result = await knex.raw(
    `select 'drop table if exists "' || tablename || '" cascade;'
    from pg_tables
    where schemaname = 'public';
  `);
  const deleteAllTablesSqlCommand = result.rows
    .map((row) => row['?column?'])
    .filter((row) => {
      return ignoreTables.every((ignoreTable) => !row.includes(ignoreTable));
    })
    .join(' ');
  return knex.raw(deleteAllTablesSqlCommand);
}
