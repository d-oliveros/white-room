import jwt from 'jsonwebtoken';

const { JWT_KEY } = process.env;

export default async function unwrapSessionToken(req, res, next) {
  try {
    const sessionToken =
      req.headers['x-session-token']
      || req.cookies[__config.cookies.session.name]
      || req.query.sessionToken;

    if (!sessionToken) {
      res.locals.session = null;
      next();
      return;
    }

    if (req.query.sessionToken) {
      res.cookie(
        __config.cookies.session.name,
        req.query.sessionToken,
        __config.cookies.session.settings,
      );
    }

    let session = await jwt.verify(sessionToken, JWT_KEY);

    // Delete invalid sessions.
    if (session && !session.userId && !session.roles) {
      session = null;
      res.clearCookie(
        __config.cookies.session.name,
        __config.cookies.session.settings,
      );
    }

    res.locals.session = session;

    next();
  }
  catch (err) {
    __log.error(err);
    res.clearCookie(__config.cookies.session.name, __config.cookies.session.settings);
    next();
  }
}
