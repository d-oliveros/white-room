import 'reflect-metadata';
import { DataSource } from 'typeorm';

const {
  POSTGRES_HOST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
} = process.env;

export const dataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST || 'localhost',
  port: 5432,
  username: POSTGRES_USER || 'test',
  password: POSTGRES_PASSWORD || 'test',
  database: POSTGRES_DATABASE || 'test',
  synchronize: true,
  logging: false,
  entities: ['./**/model/*.js'],
  migrations: [],
  subscribers: [],
});