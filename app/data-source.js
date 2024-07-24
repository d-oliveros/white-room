import 'reflect-metadata';
import { glob } from 'glob';
import { DataSource, EntitySchema } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';

const {
  POSTGRES_HOST = '127.0.0.1',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_DATABASE = 'whiteroom_dev',
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.dirname(__dirname);

const entityFiles = await glob('./**/model/*.model.js');

const entitySchemas = (await Promise.all(entityFiles.map(async (filepath) => {
  const model = (await import(path.resolve(__root, filepath))).default;
  if (typeof model === 'object' && model.name && model.tableName && model.columns) {
    return new EntitySchema(model);
  }
  return null;
}))).filter(Boolean);

export const dataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST,
  port: 5432,
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  synchronize: false,
  logging: true,
  entities: entitySchemas,
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  subscribers: [],
});
