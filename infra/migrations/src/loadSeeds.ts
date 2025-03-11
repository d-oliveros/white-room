import { useSeeders, useDataSource } from '@jorgebodega/typeorm-seeding';
import { createLogger } from '@namespace/logger';
import dataSource from './dataSource';
import * as seeders from '@domain/test/seeds';

const logger = createLogger('loadSeeds');

type SeederOptions = {
  names?: string[];
};

/**
 * Gets available seeder names from the index exports
 */
function getAvailableSeeders(): string[] {
  return Object.keys(seeders).map((name) => name.replace('Seeder', ''));
}

/**
 * Loads and executes database seeders.
 * @param options - Configuration options for seeding
 * @param options.names - Optional array of seeder names to run (e.g., ['Address', 'Project'])
 */
export async function loadSeeds(options: SeederOptions = {}): Promise<void> {
  try {
    await useDataSource(dataSource, true);

    const availableSeeders = getAvailableSeeders();

    if (options.names) {
      const invalidSeeders = options.names.filter((name) => !availableSeeders.includes(name));
      if (invalidSeeders.length > 0) {
        logger.warn(`Invalid seeder names: ${invalidSeeders.join(', ')}`);
        logger.info(`Available seeders: ${availableSeeders.join(', ')}`);
        return;
      }
    }

    const seedersToRun = options.names
      ? Object.entries(seeders)
          .filter(([name]) => options.names?.includes(name.replace('Seeder', '')))
          .map(([, seeder]) => seeder)
      : Object.values(seeders);

    if (seedersToRun.length === 0) {
      logger.warn('No matching seeders found');
      logger.info(`Available seeders: ${availableSeeders.join(', ')}`);
      return;
    }

    await useSeeders(seedersToRun);
    logger.info(`Seeding completed successfully. Ran ${seedersToRun.length} seeder(s)`);
  } catch (error) {
    logger.error(error, 'Error running seeders');
    throw error;
  } finally {
    await dataSource.destroy();
  }
}
