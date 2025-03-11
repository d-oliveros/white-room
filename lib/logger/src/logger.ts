import pino from 'pino';

const { APP_ID, LOG_LEVEL, NODE_ENV } = process.env;

const baseLogger = pino({
  level: LOG_LEVEL || 'info',
  base: { app: `${APP_ID}-app` },
  transport: ['development', 'test'].includes(NODE_ENV || '')
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          messageFormat: '[{module}] {msg}',
          ignore: 'pid,hostname,app,module',
        },
      }
    : undefined,
});

/**
 * Creates a logger with the specified module name
 * @param moduleName Name of the module to be included in logs
 */
function createLogger(moduleName: string) {
  return baseLogger.child({ module: moduleName });
}

export { createLogger };
