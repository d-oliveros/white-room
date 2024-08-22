/**
 * Uncaught exception and unhandled rejection handler.
 *
 * The application logs uncaught exceptions and unhandled rejections. If the
 * number of errors exceeds a threshold within a 1-minute interval, the
 * application will shut down.
 *
 * Ensure you have a process manager (e.g., pm2) to automatically restart
 * the application in case of a crash.
 */
let _uncaughtExceptionHandlerIntervalId = null;

export default function startUncaughtExceptionHandler(listener) {
  if (typeof listener !== 'object' || !listener.on || !listener.exit) {
    throw new TypeError('A valid event listener with "on" and "exit" methods is required.');
  }

  if (_uncaughtExceptionHandlerIntervalId) return;

  let errorCount = 0;
  const errorThreshold = 1500;

  const errorHandler = (type, exception) => {
    try {
      console.warn(`${type} #${errorCount + 1}`);
      console.error(exception);
    } catch (loggingError) {
      // If logging fails, there's not much we can do, but let's log it anyway.
      console.error('Error logging the exception:', loggingError);
    }

    errorCount += 1;
    if (errorCount >= errorThreshold) {
      console.warn('Error threshold reached, shutting down.');
      listener.exit(1);
    }
  };

  listener.on('uncaughtException', (exception) => errorHandler('Uncaught exception', exception));
  listener.on('unhandledRejection', (exception) => errorHandler('Unhandled rejection', exception));

  _uncaughtExceptionHandlerIntervalId = setInterval(() => {
    errorCount = 0;
  }, 60000);

  return _uncaughtExceptionHandlerIntervalId;
}
