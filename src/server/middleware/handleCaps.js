
/**
 * Lowercases the URL. If the requested URL had caps, the request will be
 * redirected with a 301 status code to the lower-cased URL.
 */
export default function handleCapsMiddleware(req, res, next) {
  const path = req.path;
  const lowercase = path.toLowerCase();

  if (path !== lowercase) {
    return res.redirect(301, lowercase);
  }

  next();
}
