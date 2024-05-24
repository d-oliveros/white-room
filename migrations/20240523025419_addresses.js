exports.up = async (knex) => {
  // enables postgis extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;');

  // addresses table
  await knex.schema.createTable('addresses', (t) => {
    t.increments('id').unsigned().primary();

    t.string('googlePlaceId').nullable();
    t.string('streetName').nullable();
    t.string('streetNumber').nullable();
    t.string('streetSuffix').nullable();
    t.string('streetDisplay').nullable();
    t.string('zip').nullable();
    t.string('city').nullable();
    t.string('countryCode').nullable();
    t.string('stateCode').nullable();
    t.string('unitNumber').nullable();
    t.float('longitude').notNullable();
    t.float('latitude').notNullable();
    t.specificType('locationPoint', 'geometry(point, 4326)').nullable();

    t.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));

    t.unique('googlePlaceId');
    t.unique(['streetNumber', 'streetName', 'unitNumber']);

    t.index('googlePlaceId');
    t.index('locationPoint');
  });

};

exports.down = async (knex) => {
  await knex.schema.dropTable('addresses');
  await knex.raw('DROP EXTENSION IF EXISTS postgis;');
};
