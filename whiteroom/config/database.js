import path from 'path';

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

const getSeedsDirectory = async () => {
  if (NODE_ENV !== 'production') {
    const { globSync } = await import('glob');
    return globSync('./app/**/*.seed.js')
      .map((filepath) => path.dirname(filepath))
      .reduce((memo, dir) => (memo.includes(dir) ? memo : [...memo, dir]), []);
  }
  return null;
};

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
    seeds: NODE_ENV === 'production'
      ? null
      : await getSeedsDirectory(),
  },
  redis: {
    db: REDIS_DB,
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
};

export default config;
