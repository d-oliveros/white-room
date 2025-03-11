import { join, resolve, extname } from 'path';
import { createPostgresDataSourceManager } from '@domain/lib/DataSourceManager';

export const dataSourcePath = join(__dirname, `migrationsDataSource${extname(__filename)}`);
export const migrationsDir = resolve(__dirname, '..', 'list');

const dataSourceManager = createPostgresDataSourceManager({
  database: 'namespace_migrations',
  migrations: [`${migrationsDir}/*.{ts,js}`],
  synchronize: false,
  migrationsDir,
});

export default dataSourceManager.getDataSource();
