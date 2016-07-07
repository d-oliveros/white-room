import assert from 'http-assert';
import { isObjectId, isEmail } from 'cd-common';
import { User } from '../models';

export default {
  path: '/disable/:type',
  method: 'get',
  async handler(req, res) {
    const { type } = req.params;
    const { userId, email, token } = req.query;

    assert(isObjectId(userId) && isEmail(email), 400);

    const user = await User.findById(userId);
    assert(user && user.email === email, 400);

    const types = Object.keys(user.settings.emailNotifications);
    assert(types.indexOf(type) > -1, 400);

    user.settings.emailNotifications[type] = false;

    await user.save();
    let url = `${__config.server.host}/${user.path}?disabled=${type}`;

    if (token) {
      url += `&token=${token}`;
    }

    res.redirect(url);
    return url;
  }
};
