import pino from 'pino';
import createDebug from 'debug';

const {
  APP_ID,
  NODE_ENV,
  NO_LOG_MODE,
} = process.env;

const isProduction = NODE_ENV === 'production';

const pinoConfig = {
  level: NO_LOG_MODE ? 'silent' : 'trace',
  base: {
    pid: false,
  },
  transport: isProduction ? null : {
    target: 'pino-pretty',
    options: {
      colorize: true
    },
  },
};

// Browser-side support.
if (process.browser) {
  pinoConfig.browser = {
    asObject: true,
  };
}

const logger = pino(pinoConfig);

if (process.browser) {
  logger.error = (...args) => {
    console.error(...args);
  };
}

const _debugInstances = {};

logger.createDebug = function createDebugWrapped(debugNameSpace) {
  if (NODE_ENV === 'production') {
    return () => {};
  }

  debugNameSpace = `${APP_ID || 'debug'}:${debugNameSpace}`;
  const debugInstance = createDebug(debugNameSpace);

  if (!_debugInstances[debugNameSpace]) {
    _debugInstances[debugNameSpace] = debugInstance;
  }

  return _debugInstances[debugNameSpace];
};

export default logger;
