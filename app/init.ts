import { dirname } from 'path';
import { fileURLToPath } from 'url';
import startServices from '#white-room/startServices.js';
import loadModules from '#white-room/loadModules.js';
console.log('HERE');
const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  NODE_ENV,
  SEGMENT_LIB_PROXY_URL,
  COMMIT_HASH,
  APP_PORT,
  QUEUE_ID,
  RENDERER_PORT,
  RENDERER_ENDPOINT,
  ENABLE_KNEX_MIGRATIONS,
  ENABLE_SERVER,
  ENABLE_RENDERER,
  ENABLE_CRON,
  ENABLE_QUEUE,
  ENABLE_STORYBOOK,
} = process.env;

const init = async ({ modulesDir, config }) => {
  const modules = await loadModules(modulesDir);

  return startServices({
    modules,
    config,
  });
};

init({
  modulesDir: __dirname,
  config: {
    useHelmet: NODE_ENV !== 'development',
    segmentLibProxyUrl: SEGMENT_LIB_PROXY_URL,
    commitHash: COMMIT_HASH,
    port: APP_PORT,
    rendererPort: RENDERER_PORT,
    rendererEndpoint: RENDERER_ENDPOINT,
    queueId: QUEUE_ID,
    enableKnexMigrations: ENABLE_KNEX_MIGRATIONS === 'true',
    enableServer: ENABLE_SERVER === 'true',
    enableRenderer: ENABLE_RENDERER === 'true',
    enableCron: ENABLE_CRON === 'true',
    enableQueue: ENABLE_QUEUE === 'true',
    enableStorybook: ENABLE_STORYBOOK === 'true',
  },
});
