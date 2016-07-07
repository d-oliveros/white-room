const debug = __log.debug('boilerplate:middleware:benchmark');

/**
 * Provides a function to measure the time spent on rendering the initial HTML.
 */
export default function benchmark(req, res, next) {
  const now = Date.now();

  req.benchmark = {
    stop() {
      const lapsed = Date.now() - now;
      debug(`Rendered client in ${lapsed}ms.`);
    }
  };

  next();
}
