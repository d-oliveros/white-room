import type { RunMigrationsOptions } from './runMigrations';

import { createLogger } from '@namespace/logger';
import { runMigrations } from './runMigrations';
import { generateMigration } from './generateMigration';
import { loadSeeds } from './loadSeeds';
import { resetData } from './resetData';

const logger = createLogger('migrations');

const args = process.argv.slice(2);

enum Command {
  Generate = 'generate',
  Run = 'run',
  ResetData = 'resetData',
  Seed = 'seed',
}

async function main() {
  if (args.length === 0) {
    logger.warn('Usage:');
    logger.warn('  generate [migrationname] - Generate a new migration');
    logger.warn('  run [--dry-run] - Run pending migrations');
    logger.warn('  reset - Reset the database');
    process.exit(1);
  }

  const command = args[0] as Command;

  switch (command) {
    case Command.Generate: {
      const migrationName = args[1] || 'migration';
      try {
        logger.info('Generating migration...');
        await generateMigration({ migrationName });
        logger.info('Migration generation completed successfully.');
      } catch (error) {
        logger.error(error, 'Failed to generate migration:');
        process.exit(1);
      }
      break;
    }
    case Command.Run: {
      const options: RunMigrationsOptions = {
        dryRun: args.includes('--dry-run'),
      };
      try {
        logger.info('Running migrations...');
        await runMigrations(options);
        logger.info('Migration execution completed successfully.');
      } catch (error) {
        logger.error(error, 'Failed to run migrations:');
        process.exit(1);
      }
      break;
    }
    case Command.ResetData: {
      try {
        logger.warn('Clearing the database. This will delete all data!');
        await resetData();
        logger.info('Data erased successfully.');
      } catch (error) {
        logger.error(error, 'Failed to erase data:');
        process.exit(1);
      }
      break;
    }
    case Command.Seed: {
      try {
        const seedArg = args.find((arg) => arg.startsWith('--seed='));
        const seedName = seedArg ? seedArg.split('=')[1] : undefined;

        logger.info(`Seeding database${seedName ? ` with ${seedName} data` : ''}...`);

        const loadSeedsOptions = seedName ? { names: [seedName] } : {};
        await loadSeeds(loadSeedsOptions);

        logger.info('Database seeding completed successfully.');
      } catch (error) {
        logger.error(error, 'Failed to seed database:');
        process.exit(1);
      }
      break;
    }
    default: {
      logger.warn(
        `Invalid command. Use "${Command.Generate}", "${Command.Run}", or "${Command.ResetData}".`,
      );
      process.exit(1);
    }
  }
}

main();
