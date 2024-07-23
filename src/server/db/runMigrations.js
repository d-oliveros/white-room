import logger from '#white-room/logger.js';

const runMigrations = async (dataSource) => {
  try {
    logger.info('[runMigrations] Checking if schema migration is needed.');
    await dataSource.initialize();
    const migrationsRan = await dataSource.runMigrations({
      transaction: true,
    });
    const migrationNamesRan = migrationsRan.map(({ name }) => name);
    logger.info(migrationNamesRan.length > 0
      ? `[runMigrations] Migration scripts run: \n${migrationNamesRan.join('\n')}`
      : '[runMigrations] Schema migration not needed.'
    );

    await dataSource.destroy();
  }
  catch (error) {
    logger.error(new Error(`[runMigrations] Error while running DB migrations: ${error.message}`, { cause: error }));
    process.exit(1);
  }
};

export default runMigrations;
