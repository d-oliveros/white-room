import jwt from 'jsonwebtoken';

import * as cookiesConfig from '#whiteroom/config/cookies.js';
import logger from '#whiteroom/logger.js';

const {
  JWT_KEY,
} = process.env;

export default async function unwrapSessionToken(req, res, next) {
  try {
    const sessionToken =
      req.headers['x-session-token']
      || req.cookies[cookiesConfig.session.name]
      || req.query.sessionToken;

    if (!sessionToken) {
      res.locals.session = null;
      next();
      return;
    }

    if (req.query.sessionToken) {
      res.cookie(
        cookiesConfig.session.name,
        req.query.sessionToken,
        cookiesConfig.session.settings,
      );
    }

    let session = await jwt.verify(sessionToken, JWT_KEY);

    // Delete invalid sessions.
    if (session && !session.userId && !session.roles) {
      session = null;
      res.clearCookie(
        cookiesConfig.session.name,
        cookiesConfig.session.settings,
      );
    }

    res.locals.session = session;

    next();
  }
  catch (err) {
    logger.error(err);
    res.clearCookie(cookiesConfig.session.name, cookiesConfig.session.settings);
    next();
  }
}
