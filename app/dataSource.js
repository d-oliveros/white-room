import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import getEntitySchemas from '#white-room/loader/getEntitySchemas.js';

const {
  POSTGRES_HOST = '127.0.0.1',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_DATABASE = 'whiteroom_dev',
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST,
  port: 5432,
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  synchronize: false,
  logging: true,
  entities: await getEntitySchemas('./**/model/*model.js'),
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  subscribers: [],
});
