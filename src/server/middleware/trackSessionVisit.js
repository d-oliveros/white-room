
const debug = __log.debug('boilerplate:middleware:trackSessionVisit');

/**
 * Checks if the user has not visited the site for at least 30 minutes
 */
export default function trackSessionVisit(req, res, next) {
  const now = Date.now();
  let lastVisit = isNaN(req.cookies.lastVisit) ? null : req.cookies.lastVisit;

  // If the user is logged in, use the value in `user.logs.lastVisit`
  if (req.user && req.user.logs.lastVisit) {
    lastVisit = req.user.logs.lastVisit.getTime();
  }

  if (lastVisit) {
    const minutesElapsed = (now - lastVisit) / 60000;
    if (minutesElapsed >= 30) {
      req.isNewSession = true;
    }
  } else {
    req.isNewSession = true;
  }

  debug(`Last visit: ${lastVisit}. Is new site visit? ${!!req.isNewSession}`);

  res.cookie('lastVisit', now, __config.cookies);
  next();
}
