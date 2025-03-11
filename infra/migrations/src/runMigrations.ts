import { MigrationExecutor } from 'typeorm';
import { createLogger } from '@namespace/logger';
import dataSource from './dataSource';

const logger = createLogger('runMigrations');

export type RunMigrationsOptions = {
  dryRun?: boolean;
};

export async function runMigrations(options: RunMigrationsOptions = {}): Promise<void> {
  const { dryRun } = options;

  if (process.env.CORE_DB_SYNCHRONIZE === 'true') {
    throw new Error('CORE_DB_SYNCHRONIZE must be false');
  }

  try {
    // Initialize the data source
    await dataSource.initialize();

    // Create a migration executor
    const migrationExecutor = new MigrationExecutor(dataSource);

    // Get pending migrations
    const pendingMigrations = await migrationExecutor.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations to run.');
      return;
    }

    if (dryRun) {
      logger.info(`Dry run: ${pendingMigrations.length} migration(s) would be executed.`);
      pendingMigrations.forEach((migration) => {
        logger.info(`- ${migration.name}`);
      });
      return;
    }

    // Run pending migrations
    await migrationExecutor.executePendingMigrations();

    logger.info(`Successfully ran ${pendingMigrations.length} migration(s).`);
  } catch (error) {
    logger.error(error, 'Error running migration');
    throw error;
  } finally {
    // Close the data source connection
    await dataSource.destroy();
  }
}
