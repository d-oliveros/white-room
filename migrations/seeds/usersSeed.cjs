const usersFixture = require('./usersFixture.json');

exports.seed = async function usersSeed(knex) {
  await knex('users').del();
  await knex('users').insert(usersFixture).returning('*');
};
