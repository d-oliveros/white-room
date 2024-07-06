import { promisify } from 'util';
import lodashValues from 'lodash/fp/values.js';

const {
  NODE_ENV,
  COMMIT_HASH,
  RENDERER_ENDPOINT,
  APP_PORT,
} = process.env;

export const getServices = (modules) => {
  return lodashValues(modules)
    .reduce((memo, { service }) => [ ...memo, ...service ], []);
};

/**
 * Starts the API server.
 * Loads necessary modules and begins listening on the configured port.
 */
const startServer = async ({ services }) => {
  const logger = (await import(`../logger.js`)).default;
  logger.info('Starting server.');

  const { createServer } = await import(`../server/createServer.js`);

  const server = createServer({
    services,
    config: {
      useHelmet:  NODE_ENV !== 'development',
      commitHash: COMMIT_HASH,
      rendererEndpoint: RENDERER_ENDPOINT,
      middleware: (app) => app.use((req, res, next) => { console.log('w00t!!'); next(); }),
    },
  });
  const listen = promisify(server.listen).bind(server);
  await listen(APP_PORT);

  logger.info(`Server listening on port: ${APP_PORT}`);
};

export default startServer;
