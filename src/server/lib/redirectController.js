import Redirection from '#models/Redirection.js';

export default async function redirectController(req, res, next) {
  try {
    const { redirectId } = req.params;
    if (redirectId) {
      const redirection = await Redirection.getById(redirectId);
      if (redirection) {
        res.redirect(302, redirection.url);
        return;
      }
    }
    next();
  }
  catch (error) {
    next(error);
  }
}
