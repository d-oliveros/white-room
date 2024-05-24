import createDebug from 'debug';
import winston from 'winston';

const {
  APP_ID,
  NODE_ENV,
  NO_LOG_MODE,
} = process.env;

const { Console } = winston.transports;
const isProduction = NODE_ENV === 'production';
const transports = [];

transports.push(
  new Console({
    level: 'silly',
    format: winston.format.combine(
      isProduction ? winston.format.uncolorize() : winston.format.colorize(),
      winston.format.timestamp(),
      isProduction ? winston.format.json() : winston.format.simple(), // Format the Cloudwatch logs as JSON.
    ),
  })
);

const logger = winston.createLogger({
  transports: transports,
  silent: NO_LOG_MODE,
});

const _debugInstances = {};

logger.debug = function createDebugWrapped(debugNamespace) {
  debugNamespace = `${APP_ID}:${debugNamespace}`;

  if (!_debugInstances[debugNamespace]) {
    _debugInstances[debugNamespace] = NODE_ENV === 'production' || NO_LOG_MODE
      ? function loggerEmptyDebug() { }
      : createDebug(debugNamespace);
  }

  return (...args) => {
    _debugInstances[debugNamespace](...args);
  };
};

logger.error = (error) => {
  logger.log({
    level: 'error',
    message: error.message,
    stack: error.stack,
    ...error,
  });
};

logger._info = logger.info;

logger.info = (info, metadata) => {
  if (typeof info === 'string') {
    logger._info(info, metadata);
  }
  else {
    logger.log({
      level: 'info',
      ...info,
    });
  }
};

export default logger;
