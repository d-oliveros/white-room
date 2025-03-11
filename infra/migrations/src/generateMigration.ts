import { MigrationExecutor } from 'typeorm';
import { MigrationGenerateCommand } from 'typeorm/commands/MigrationGenerateCommand';
import { createLogger } from '@namespace/logger';
import dataSource, { dataSourcePath } from './migrationsDataSource';

const logger = createLogger('generateMigration');

export async function generateMigration({
  migrationName = 'migration',
  dryRun = false,
}): Promise<void> {
  try {
    await dataSource.initialize();

    const migrationExecutor = new MigrationExecutor(dataSource);
    const pendingMigrations = await migrationExecutor.getPendingMigrations();
    if (pendingMigrations.length > 0) {
      logger.info('Running pending migrations');
      await migrationExecutor.executePendingMigrations();
      logger.info('Pending migrations executed successfully');
    } else {
      logger.info('No pending migrations to run');
    }

    await dataSource.destroy();

    logger.info('Generating migration');
    const command = new MigrationGenerateCommand();

    await command.handler({
      path: `./infra/migrations/list/${migrationName}`,
      dataSource: dataSourcePath,
      pretty: true,
      dryrun: dryRun,
      outputJs: true,
    });
  } catch (error) {
    logger.error(error, 'Error generating migration');
    throw error;
  }
}
