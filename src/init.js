import startServices from '../white-room/startServices.js';
import loadModulesNode from '../white-room/util/loadModulesNode.js';

const {
  ENABLE_KNEX_MIGRATIONS,
  ENABLE_SERVER,
  ENABLE_RENDERER,
  ENABLE_CRON,
} = process.env;

const config = {
  enableKnexMigrations: ENABLE_KNEX_MIGRATIONS === 'true',
  enaleServer: ENABLE_SERVER === 'true',
  enableRenderer: ENABLE_RENDERER === 'true',
  enableCron: ENABLE_CRON === 'true',
};

const init = async () => {
  const modules = await loadModulesNode(import.meta.url);

  const knex = '';

  await startServices({
    modules,
    knex,
    config,
  });
};

await init();
