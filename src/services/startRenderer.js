import { promisify } from 'util';

export const getInitialStateFromModules = (modules) => {
  const initialState = {};

  for (const moduleName of Object.keys(modules)) {
    const { view } = modules[moduleName];

    if (view?.initialState) {
      if (typeof view.initialState !== 'object') {
        throw new Error(`[${moduleName}]: 'initialState' must be an object (got: ${view.initialState})`);
      }
      for (const key in view.initialState) {
        if (key in initialState) {
          throw new Error(`[${moduleName}]: Duplicate initial state key found: ${key}`);
        }
        initialState[key] = view.initialState[key];
      }
    }
  }

  return initialState;
};

/**
 * Starts the renderer service.
 * Loads the renderer server module and begins listening on the configured port.
 */
const startRenderer = async ({ port, routes, initialState, middleware, config = {} }) => {
  const logger = (await import('../logger.js')).default;
  logger.info(`Starting renderer service in port: ${port}`);

  const createRendererServer = (await import('../renderer/createRendererServer.js')).default;

  const rendererServer = createRendererServer({
    routes,
    initialState,
    middleware,
    config,
  });
  const listen = promisify(rendererServer.listen).bind(rendererServer);
  await listen(port);

  logger.info(`Renderer service listening on port: ${port}`);
};

export default startRenderer;
