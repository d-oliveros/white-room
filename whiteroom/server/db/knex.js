import assert from 'assert';
import createKnex from 'knex';
import dayjs from 'dayjs';
import knexPostgis from 'knex-postgis';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

import logger from '#whiteroom/logger.js';
import slugify from '#whiteroom/util/slugify.js';

const {
  POSTGRES_HOST = '127.0.0.1',
  POSTGRES_PORT = '5432',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_DATABASE,
  NODE_ENV,
} = process.env;

const dbConfig = {
  client: 'pg',
  connection: {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    charset: 'utf8',
  },
  seeds: NODE_ENV === 'production' ? null : {
    directory: './migrations/seeds',
  },
  migrations: {
    stub: './config/migrations.stub',
  },
};

pg.types.setTypeParser(pg.types.builtins.DATE, (val) => {
  return val === null ? null : dayjs(val).format('YYYY-MM-DD');
});

const knex = createKnex(dbConfig);

// Install postgis functions in knex.postgis.
// https://github.com/jfgodoy/knex-postgis
export const st = knexPostgis(knex);

/**
 * Migrate to latest schema, if needed.
 *
 * @return {Promise}
 */
export async function postgresMigrateToLatestSchema(/* { modules } */) {
  // TODO: How to modularize modules model schemas?
  // https://chatgpt.com/share/8c0f01c7-0bd4-49a6-b538-94e85e7b55e0
  logger.info('Checking if schema migration is needed.');
  // TODO
  // const result = await knex.migrate.latest([dbConfig]);
  // logger.info(`Migration needed? ${result}`);
}

/**
 * Converts a longitude:latitude pair to a string representation of a geometry field's value.
 *
 * @param  {number} longitude Longitude value.
 * @param  {number} latitude  Latitude value.
 * @return {string}           String representation of the database value for the geometry point.
 */
export async function convertToGeometryString(longitude, latitude) {
  assert(
    !isNaN(longitude) && !isNaN(latitude),
    `longitude/latitude is invalid. Lon: "${longitude}" Lat: "${latitude}"`
  );
  const result = await knex.raw(`SELECT ST_GeomFromText('Point(${longitude} ${latitude})', 4326);`);
  const geometryText = result.rows[0].st_geomfromtext;
  return geometryText;
}

/**
 * Transforms a string to a st.geomFromText object.
 *
 * @param  {string} locationPointString Location point string, like 'Point(15,2)'.
 * @return {Object}
 */
export function transformLocationPointStringToGeomFromTextPoint(locationPointString) {
  return (
    locationPointString
    && typeof locationPointString === 'string'
    && locationPointString.indexOf('Point(') === 0
      ? st.geomFromText(locationPointString, 4326)
      : locationPointString
  );
}

export function transformPointsToSTGeometry(points) {
  return st.geomFromText(`Polygon((${points.map((point) => point.join(' ')).join(', ')}))`, 4326);
}

/**
 * Queries the db to get all the columns in a table.
 *
 * @param  {string} tableName Table name.
 * @return {Array}  Table field names.
 */
export async function getTableFieldNames(tableName) {
  assert(typeof tableName === 'string', '`tableName` is required.');
  const tableFieldNamesQueryResult = await knex
    .select('column_name')
    .from('information_schema.columns')
    .where({ table_name: tableName });

  return tableFieldNamesQueryResult.map((row) => row.column_name);
}

export async function getAvailableSlug({ table, field, value, iteration = 0 }) {
  if (!value) {
    return null;
  }
  const slug = iteration === 0
    ? slugify(value)
    : slugify(`${value}-${iteration}`);

  if (iteration >= 100) {
    logger.warn(`[knex:getAvailableSlug] Maximum iterations reached for: ${table}:${field}-${value}`);
    return slugify(`${value}-${uuidv4()}`);
  }

  const slugExists = await knex(table)
    .first('id')
    .where(field, slug);

  if (slugExists) {
    return getAvailableSlug({
      table,
      field,
      value,
      iteration: iteration + 1,
    });
  }
  return slug;
}

export default knex;
