import 'winston-loggly';
import moment from 'moment';
import debug from 'debug';
import SentryTransport from 'winston-sentry';
import winston from 'winston';

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
  // when in test environment, only log errors in console
  transports = [
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

export default logger;
