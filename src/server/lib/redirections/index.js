import redis from '../../modules/db/redis';

export default async function redirectionsHandler(req, res, next) {
  try {
    const cache = await redis.getAsync(`redirections-${req.path}`);
    if (cache) {
      const redirection = JSON.parse(cache.toString());
      const redirectTo = __config.host + redirection.target;
      res.redirect(redirection.code, redirectTo);
      return;
    }
  } catch (err) {
    __log.error(err);
  }

  next();
}
