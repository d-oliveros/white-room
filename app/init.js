import { dirname } from 'path';
import { fileURLToPath } from 'url';
import startServices from '#white-room/startServices.js';
import loadModules from '#white-room/loadModules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  ENABLE_KNEX_MIGRATIONS,
  ENABLE_SERVER,
  ENABLE_RENDERER,
  ENABLE_CRON,
  ENABLE_QUEUE,
} = process.env;

const init = async ({ modulesDir, config }) => {
  const modules = await loadModules(modulesDir);
  console.log(modules.auth.service);

  return startServices({
    modules,
    config,
  });
};

init({
  modulesDir: __dirname,
  config: {
    enableKnexMigrations: ENABLE_KNEX_MIGRATIONS === 'true',
    enableServer: ENABLE_SERVER === 'true',
    enableRenderer: ENABLE_RENDERER === 'true',
    enableCron: ENABLE_CRON === 'true',
    enableQueue: ENABLE_QUEUE === 'true',
  },
});
