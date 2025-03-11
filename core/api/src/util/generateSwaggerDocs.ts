import type { PostgresDatabaseConfig } from '@domain/lib/DataSourceManager';

import { writeFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '@namespace/logger';
import { getDatabasePassword } from '@domain/lib/secretsManager';
import { createPostgresDataSourceManager } from '@domain/lib/DataSourceManager';
import { AppFactory } from '@api/app';

const { CORE_DB_SECRET_ARN, CORE_API_CORS_ORIGIN } = process.env;

const logger = createLogger('generateSwaggerDocs');

export async function generateSwaggerDocs() {
  const dbConfig: Partial<PostgresDatabaseConfig> = {};

  if (CORE_DB_SECRET_ARN) {
    dbConfig.password = await getDatabasePassword(CORE_DB_SECRET_ARN);
  }

  const dataSourceManager = createPostgresDataSourceManager(dbConfig);
  await dataSourceManager.initialize();

  const fastifyApp = AppFactory.create({
    dataSource: dataSourceManager.getDataSource(),
    corsOrigin: CORE_API_CORS_ORIGIN,
  });

  // Generate and save swagger JSON by makin g a request to /docs
  const response = await fastifyApp.inject({
    method: 'GET',
    url: '/docs/json',
  });

  const swaggerJson = JSON.parse(response.payload);
  const swaggerPath = join(__dirname, '..', '..', '..', '..', 'swagger.json');
  writeFileSync(swaggerPath, JSON.stringify(swaggerJson, null, 2));

  logger.info(`Swagger documentation generated at ${swaggerPath}`);

  // Clean up
  await dataSourceManager.destroyDataSource();
  await fastifyApp.close();
}

// Execute if this file is run directly
generateSwaggerDocs()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error(error, 'Error generating Swagger docs');
    process.exit(1);
  });
