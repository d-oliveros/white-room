import assert from 'assert';
import faker from 'faker';
import kue from 'kue';
import { getIn } from 'formik';
import lodashOmit from 'lodash/fp/omit';

import parseJSON from 'common/util/parseJSON';
import typeCheck from 'common/util/typeCheck';
import generateRandomPhone from 'common/util/generateRandomPhone';

import queue from 'queue';

import redis from 'server/db/redis';
import knex from 'server/db/knex';
import User from 'server/models/User';

import usersFixture from '../migrations/seeds/usersFixture.json';

const {
  NODE_ENV,
} = process.env;

export async function resetDbData() {
  assert(NODE_ENV !== 'production', 'Not enabled on production mode.');
  await clearDbData();
  await knex.seed.run();
}

export async function clearDbData() {
  assert(NODE_ENV !== 'production', 'Not enabled on production mode.');

  const tablesToReset = [
    'users',
    'addresses',
  ];

  await knex.transaction(async (trx) => {
    for (const tableToReset of tablesToReset) {
      await trx(tableToReset).delete();
      await trx.raw(`ALTER SEQUENCE "${tableToReset}_id_seq" RESTART WITH 1`);
    }
    return trx.commit();
  });

  await redis.flushallAsync();
}

export function generateRandomName() {
  return faker.name.findName();
}

export function generateRandomEmail() {
  return faker.internet.email();
}

export async function createUser(userConfig = {}) {
  const randomName = generateRandomName().replace(/[^a-zA-Z0-9 ]/g, '');

  const testUserSignupData = {
    ...lodashOmit('id', usersFixture[0]),
    firstName: randomName,
    lastName: 'LName',
    phone: generateRandomPhone(),
    email: generateRandomEmail(),
    password: '1234',
    settings: parseJSON(usersFixture[0].settings),
    ...userConfig,
  };

  return User.signup(testUserSignupData);
}

const tableDataTypeToFakerFunctionName = {
  real: 'random.number',
  'timestamp with time zone': 'date.recent',
  'character varying': 'lorem.word',
  boolean: 'random.boolean',
  integer: 'random.number',
  numeric: 'random.number',
  text: 'lorem.sentence',
};

export async function makeTableColumnFakeValues({
  tableName,
  columnNames,
}) {
  const tableColumns = await knex
    .select(['column_name', 'data_type'])
    .from('information_schema.columns')
    .where({
      table_schema: 'public',
      table_name: tableName,
    });

  return tableColumns
    .filter((column) => columnNames.includes(column.column_name))
    .map((column) => {
      const val = getIn(faker, tableDataTypeToFakerFunctionName[column.data_type]);
      return [column.column_name, val()];
    })
    .reduce((memo, [column, value]) => ({
      ...memo,
      [column]: value,
    }), {});
}

export function waitForJobEvents({ count: maxCount, filter, event = 'job complete' }) {
  return new Promise((resolve, reject) => {
    const jobs = [];
    function onJobEvent(id) {
      kue.Job.get(id, (err, job) => {
        if (err) {
          queue.removeListener(event, onJobEvent);
          reject(err);
          return;
        }

        if (!filter || filter(job)) {
          jobs.push(job);
          if (jobs.length >= maxCount) {
            queue.removeListener(event, onJobEvent);
            resolve(jobs);
          }
        }
      });
    }

    // Attach the event listener
    queue.on(event, onJobEvent);
  });
}

export function assertIsRejected(promise) {
  typeCheck('promiseThen::Function', promise?.then);
  typeCheck('promiseCatch::Function', promise?.catch);

  return new Promise((resolve, reject) => {
    let isResolved = false;
    promise
      .then(() => {
        if (isResolved) {
          return;
        }
        isResolved = true;
        const error = new Error('Promise was not rejected.');
        reject(error);
      })
      .catch(() => {
        if (isResolved) {
          return;
        }
        isResolved = true;
        resolve();
      });
  });

}