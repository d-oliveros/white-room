import { promisify } from 'util';
import lodashValues from 'lodash/fp/values.js';
import typeCheck from '#white-room/util/typeCheck.js';

export const getServicesFromModules = (modules) => {
  return lodashValues(modules)
    .reduce((memo, { service }) => [ ...memo, ...service ], []);
};

export const getMiddlewareFromModules = (modules) => {
  const modulesMiddleware = lodashValues(modules)
    .map(({ middleware }) => middleware)
    .filter((middleware) => typeof middleware === 'function');

  for (const middleware of modulesMiddleware) {
    typeCheck('middleware::Function', middleware);
  }

  return async (app) => {
    for (const middleware of modulesMiddleware) {
      console.log(middleware);
      middleware(app);
    }
  }
}

/**
 * Starts the API server.
 * Loads necessary modules and begins listening on the configured port.
 */
const startServer = async ({ services, port, sitemapGenerator, middleware, config = {} }) => {
  const logger = (await import(`../logger.js`)).default;
  logger.info('Starting server.');

  const { createServer } = await import(`../server/createServer.js`);

  const server = createServer({
    services,
    middleware,
    sitemapGenerator,
    config,
  });

  const listen = promisify(server.listen).bind(server);
  await listen(port);

  logger.info(`Server listening on port: ${port}`);
};

export default startServer;
