import uuid from 'uuid';

export default function sessionCookie(req, res, next) {
  const cookies = req.cookies || {};
  let sessionId = cookies.sessionId;

  if (!sessionId) {
    sessionId = uuid.v1();
    res.cookie('sessionId', sessionId, __config.cookies);
  }

  req.sessionId = sessionId;

  next();
}
