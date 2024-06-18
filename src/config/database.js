const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  NODE_ENV,
  REDIS_DB,
  REDIS_HOST,
  REDIS_PORT,
} = process.env;

const config = {
  knex: {
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
  },
  redis: {
    db: REDIS_DB,
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
};

export default config;
