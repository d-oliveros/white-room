import { dirname } from 'path';
import { fileURLToPath } from 'url';
import startServices from '#whiteroom/startServices.js';
import loadModules from '#whiteroom/loader/loadModules.js';
import runMigrations from '#whiteroom/server/db/runMigrations.js';
import logger from '#whiteroom/logger.js';

const {
  NODE_ENV,
  SEGMENT_LIB_PROXY_URL,
  COMMIT_HASH,
  APP_PORT,
  QUEUE_ID,
  RENDERER_PORT,
  RENDERER_ENDPOINT,
  ENABLE_SERVER,
  ENABLE_RENDERER,
  ENABLE_CRON,
  ENABLE_QUEUE,
  ENABLE_STORYBOOK,
  ENABLE_MIGRATIONS,
} = process.env;

// Initialize function
const init = async ({ modulesDir, config }) => {
  try {
    const modules = await loadModules(modulesDir);

    if (config.enableMigrations) {
      const { dataSource } = await import('./dataSource.js');
      await runMigrations(dataSource);
    }

    return startServices({
      modules,
      config,
    });
  }
  catch (error) {
    logger.error(error);
    process.exit(0);
  }
};

// Initialize with environment variables and __dirname
init({
  modulesDir: dirname(fileURLToPath(import.meta.url)),
  config: {
    useHelmet: NODE_ENV !== 'development',
    segmentLibProxyUrl: SEGMENT_LIB_PROXY_URL || null,
    commitHash: COMMIT_HASH || null,
    port: APP_PORT || '3000',
    rendererPort: RENDERER_PORT,
    rendererEndpoint: RENDERER_ENDPOINT,
    queueId: QUEUE_ID,
    enableServer: ENABLE_SERVER === 'true',
    enableRenderer: ENABLE_RENDERER === 'true',
    enableCron: ENABLE_CRON === 'true',
    enableQueue: ENABLE_QUEUE === 'true',
    enableStorybook: ENABLE_STORYBOOK === 'true',
    enableMigrations: ENABLE_MIGRATIONS === 'true',
  },
});
