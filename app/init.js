import { dirname } from 'path';
import { fileURLToPath } from 'url';
import run from '#whiteroom/runner/run.js';
import loadModules from '#whiteroom/loader/loadModules.js';
import runMigrations from '#whiteroom/server/db/runMigrations.js';
import logger from '#whiteroom/logger.js';

const env = process.env;
const modulesDir = dirname(fileURLToPath(import.meta.url));
const enableMigrations = env.ENABLE_MIGRATIONS === 'true';

try {
  const modules = await loadModules(modulesDir);

  if (enableMigrations) {
    const { dataSource } = await import('./dataSource.js');
    await runMigrations(dataSource);
  }

  await run({
    modules,
    config: {
      useHelmet: env.NODE_ENV !== 'development',
      segmentLibProxyUrl: env.SEGMENT_LIB_PROXY_URL || null,
      commitHash: env.COMMIT_HASH || null,
      port: env.APP_PORT || '3000',
      rendererPort: env.RENDERER_PORT,
      rendererEndpoint: env.RENDERER_ENDPOINT,
      queueId: env.QUEUE_ID,
      enableServer: env.ENABLE_SERVER === 'true',
      enableRenderer: env.ENABLE_RENDERER === 'true',
      enableCron: env.ENABLE_CRON === 'true',
      enableQueue: env.ENABLE_QUEUE === 'true',
      enableStorybook: env.ENABLE_STORYBOOK === 'true',
    },
  });
}
catch (error) {
  logger.error(error);
  process.exit(0);
}
