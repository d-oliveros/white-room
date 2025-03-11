import { join, resolve, extname } from 'path';
import { createPostgresDataSourceManager } from '@domain/lib/DataSourceManager';

export const dataSourcePath = join(__dirname, `dataSource${extname(__filename)}`);
export const migrationsDir = resolve(__dirname, '..', 'list');

const dataSourceManager = createPostgresDataSourceManager({
  migrations: [`${migrationsDir}/*.{ts,js}`],
  migrationsDir,
});

export default dataSourceManager.getDataSource();
