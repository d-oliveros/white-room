import createDebug from 'debug';
import winston from 'winston';
import PrettyError from 'pretty-error';
import dayjs from 'dayjs';

const {
  APP_ID,
  NODE_ENV,
  NO_LOG_MODE,
} = process.env;

const { Console } = winston.transports;
const isProduction = NODE_ENV === 'production';
const transports = [];
const pe = new PrettyError();

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${dayjs(timestamp).format('HH:mm:ss.SSS')} [${level}]: ${message}`;
  if (metadata && Object.keys(metadata).length) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

transports.push(
  new Console({
    level: 'silly',
    format: winston.format.combine(
      winston.format.timestamp(),
      isProduction ? winston.format.uncolorize() : winston.format.colorize(),
      isProduction ? winston.format.json() : customFormat,
    ),
  })
);

const logger = winston.createLogger({
  transports: transports,
  silent: NO_LOG_MODE,
});

const _debugInstances = {};

logger.createDebug = function createDebugWrapped(debugNameSpace) {
  debugNameSpace = `${APP_ID}:${debugNameSpace}`;

  if (!_debugInstances[debugNameSpace]) {
    _debugInstances[debugNameSpace] = NODE_ENV === 'production' || NO_LOG_MODE
      ? () => {}
      : createDebug(debugNameSpace);
  }

  return (...args) => {
    _debugInstances[debugNameSpace](...args);
  };
};

logger.error = (error) => {
  // TODO(@d-oliveros): How to keep actual log written in the logfile?
  // logger.log({
  //   level: 'error',
  //   message: error.message,
  //   stack: error.stack,
  //   ...error,
  // });
  // eslint-disable-next-line no-console
  console.log(pe.render(error));
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
