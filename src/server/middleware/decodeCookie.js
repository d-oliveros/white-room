import { verify } from '../modules/auth/token';

export default async function decodeCookie(req, res, next) {
  const token = req.headers.authorization || req.cookies.token || req.query.token;

  if (!token) return next();

  if (req.query.token) {
    res.cookie('token', req.query.token, __config.cookies);
  }

  try {
    req.user = await verify(token);
    next();
    return req.user;
  } catch (err) {
    __log.error(err);
    res.clearCookie('token', __config.cookies);
    next();

    return err;
  }
}
