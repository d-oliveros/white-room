/**
 * Uncaught exception handler.
 *
 * The application will log uncaught exceptions. If enough exceptions happen
 * in 1 minute intervals, the application will stop.
 *
 * Make sure you have a daemon restaring your instance when it crashes. eg. pm2
 */
let _uncaughtExceptionHandlerIntervalId = null;
const startUncaughtExceptionHandler = () => {
  if (_uncaughtExceptionHandlerIntervalId) return;

  let errCount = 0;
  const errTreshold = 1500;
  process.on('uncaughtException', (exception) => {
    try {
      console.warn(`Uncaught exception #${errCount}`);
      console.error(exception);
    }
    catch (error) {} // eslint-disable-line no-empty

    errCount += 1;
    if (errCount === errTreshold) {
      console.warn('Fatal uncaught exception, shutting down.');
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (exception) => {
    try {
      console.warn(`Unhandled rejection #${errCount}`);
      console.error(exception);
    }
    catch (error) {} // eslint-disable-line no-empty

    errCount += 1;
    if (errCount === errTreshold) {
      console.warn('Fatal unhandled rejection, shutting down.');
      process.exit(1);
    }
  });

  _uncaughtExceptionHandlerIntervalId = setInterval(() => {
    errCount = 0;
  }, 60000);

  return _uncaughtExceptionHandlerIntervalId;
}

export default startUncaughtExceptionHandler;
