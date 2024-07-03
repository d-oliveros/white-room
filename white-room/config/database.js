const {
  POSTGRES_HOST = '127.0.0.1',
  POSTGRES_PORT = '5432',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_DATABASE,
  NODE_ENV,
  REDIS_DB = '0',
  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = '6379',
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
