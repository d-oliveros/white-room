import { createLogger } from '@namespace/logger';
import { resetData as resetDataHelper } from '@domain/test/lib/resetData';
import dataSource from './dataSource';

const { NODE_ENV } = process.env;

const logger = createLogger('resetData');

export async function resetData(): Promise<void> {
  if (NODE_ENV !== 'development') {
    logger.warn('Resetting database is only allowed in development environment.');
    return;
  }

  try {
    await dataSource.initialize();

    await resetDataHelper(dataSource);

    logger.info(`Successfully reset the database.`);
  } catch (error) {
    logger.error(error, 'Error running migration');
    throw error;
  } finally {
    await dataSource.destroy();
  }
}
