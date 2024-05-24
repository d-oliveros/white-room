exports.up = async (knex) => {
  // user table
  await knex.schema.createTable('users', (t) => {
    t.increments('id').unsigned().primary();

    t.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    t.timestamp('updatedAt').nullable();
    t.timestamp('deletedAt').nullable();

    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
    t.string('email').unique().notNullable();
    t.string('slug').notNullable();
    t.string('password').notNullable();
    t.specificType('roles', 'text[]').notNullable();

    t.string('phone').nullable().unique();
    t.string('profileImage').nullable();

    t.string('signupIp').notNullable();
    t.string('signupAnalyticsSessionId').notNullable();
    t.string('signupUtmSource').nullable();
    t.string('signupProvider').notNullable();

    t.timestamp('lastVisitAt').nullable();
    t.integer('sessionCount').unsigned().notNullable().defaultTo(1);
    t.jsonb('experimentActiveVariants').notNullable().defaultTo('{}');
    t.boolean('shouldRefreshRoles').notNullable().defaultTo(false);

    t.index('slug');
    t.index('createdAt');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users');
};
