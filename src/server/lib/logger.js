require('winston-loggly');
const moment = require('moment');
const debug = require('debug');
const loggly = require('loggly');
const SentryTransport = require('winston-sentry');
const winston = require('winston');

const { env } = process;
const { Logger } = winston;
const { File, Console, Loggly } = winston.transports;

const logglyEnv = env.NODE_ENV === 'local' ? 'env-development' : `env-${env.NODE_ENV}`;

let transports = [

  // Log the errors in a log file
  new File({
    level: 'error',
    timestamp: true,
    prettyPrint: true,
    filename: 'error.log'
  }),

  // Log everything in the console
  new Console({
    level: 'silly',
    colorize: true,
    prettyPrint: true,
    timestamp: () => moment().format('h:mm:ss'),
    humanReadableUnhandledException: true
  })
];

// Log the errors in Sentry
if (env.SENTRY_KEY) {
  transports.push(new SentryTransport({
    level: 'error',
    dsn: env.SENTRY_KEY
  }));
}

// Log everything in Loggly
if (env.LOGGLY_KEY && env.LOGGLY_SUBDOMAIN) {
  transports.push(new Loggly({
    level: 'info',
    token: env.LOGGLY_KEY,
    subdomain: env.LOGGLY_SUBDOMAIN,
    tags: ['server', logglyEnv],
    json: true,
    stripColors: true
  }));
}
if (process.env.NODE_ENV === 'test') {
  transports = [
    // Log errors in console
    new Console({
      level: 'error',
      colorize: true,
      prettyPrint: true,
      timestamp: () => moment().format('h:mm:ss'),
      humanReadableUnhandledException: true
    })
  ];
}

const logger = new Logger({ transports });

logger.debug = debug;

/**
 * Interface to log client-side errors
 */
logger.clientError = (err, tags = []) => {
  logger.warn(`Client-side error`);
  logger.error(err);
  logger.warn('Client loggly key or subdomain not set up. Not logging client-side error', tags);
};

if (env.LOGGLY_KEY && env.LOGGLY_SUBDOMAIN) {
  const client = loggly.createClient({
    token: env.LOGGLY_KEY,
    subdomain: env.LOGGLY_SUBDOMAIN,
    tags: ['browser', logglyEnv]
  });

  logger.clientError = (err, tags = []) => {
    const args = tags.length ? [err, tags] : [err];
    client.log.apply(client, args);
  };
}

export default logger;
