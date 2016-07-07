import { getRequestLocation } from '../lib/geocoder';
import { User } from '../models';

const debug = __log.debug('boilerplate:middleware:populateUser');

export default async function populateUser(req, res, next) {
  if (!req.user) return next();

  // Update the user's last visit
  const location = getRequestLocation(req);
  const now = Date.now();

  try {
    const edits = {
      'logs.lastVisit': now,
      $inc: {
        'logs.sessions': 1
      }
    };

    if (location) {
      edits.location = location;
      edits.coordinates = location.ll;
    }

    const user = await User.findOneAndUpdate({ _id: req.user._id }, edits, {
      select: User.fieldgroups.session,
      new: false
    }).lean();

    debug('User visit', !!user);

    // If there is no user, this user has been deleted from the DB
    if (!user) {
      res.clearCookie('token', __config.cookies);
      req.user = null;
      return next();
    }

    req.user = user;

  } catch (err) {
    next(err);
    return err;
  }

  next();
}
