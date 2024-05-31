const env = process.env;

const config = {
  knex: {
    client: 'pg',
    connection: {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DATABASE,
      charset: 'utf8',
    },
    seeds: env.NODE_ENV === 'production' ? undefined : {
      directory: './migrations/seeds',
    },
    migrations: {
      stub: './config/migrations.stub',
    },
  },
  redis: {
    db: env.REDIS_DB,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
};

export default config;
