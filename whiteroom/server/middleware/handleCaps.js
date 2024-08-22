/**
 * Lowercases the URL. If the requested URL had caps, the request will be
 * redirected with a 301 status code to the lower-cased URL.
 */
export default function handleCaps(req, res, next) {
  const path = req.path;
  const lowercase = path.toLowerCase();

  if (path !== lowercase) {
    res.redirect(301, lowercase);
    return;
  }

  next();
}
