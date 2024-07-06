import { promisify } from 'util';

export const getRoutesFromModules = (modules) => {
  const allRoutes = [];

  // Collect all routes from the modules
  for (const moduleName of Object.keys(modules)) {
    const module = modules[moduleName];

    if (module.view && Array.isArray(module.view.routes)) {
      allRoutes.push(...module.view.routes);
    }
  }

  // Sort routes, '/' at the top and '*' at the bottom
  allRoutes.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    if (a.path === '*') return 1;
    if (b.path === '*') return -1;
    return 0;
  });

  // Check for duplicate paths
  const paths = new Set();
  for (const route of allRoutes) {
    if (paths.has(route.path)) {
      throw new Error(`Duplicate route path found: ${route.path}. Paths: ${paths}`);
    }
    paths.add(route.path);
  }

  return allRoutes;
};

export const getAppStateFromModules = (modules) => {
  const initialState = {};

  for (const moduleName of Object.keys(modules)) {
    const module = modules[moduleName];

    if (module.view && typeof module.view.makeInitialState === 'function') {
      const moduleInitialState = module.view.makeInitialState();

      for (const key in moduleInitialState) {
        if (key in initialState) {
          throw new Error(`Duplicate initial state key found: ${key}`);
        }
        initialState[key] = moduleInitialState[key];
      }
    }
  }

  return initialState;
};

/**
 * Starts the renderer service.
 * Loads the renderer server module and begins listening on the configured port.
 */
const startRenderer = async ({ routes, getAppState, config }) => {
  const logger = (await import('../logger.js')).default;
  logger.info('Starting renderer service.');

  const { createRendererServer } = await import('../renderer/rendererServer.js');

  const rendererServer = createRendererServer({
    routes,
    getAppState
  });
  const listen = promisify(rendererServer.listen).bind(rendererServer);
  await listen(config.port);

  logger.info(`Renderer service listening on port: ${config.port}`);
};

export default startRenderer;
