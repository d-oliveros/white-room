import assert from 'http-assert';
import { pick } from 'lodash';

const debug = __log.debug('whiteroom:User:emailSignup');

const whitelist = [
  'email',
  'name',
  'password',
  'signupIp'
];

export default async function emailSignup(userVars) {
  const User = this;

  userVars = pick(userVars, whitelist);
  userVars.email = userVars.email.trim().toLowerCase();

  const count = await User.count({ email: userVars.email });
  assert(!count, 409, 'This email has already been used');

  const user = {
    ...userVars,
    signupProvider: 'email',
    logs: {
      sessions: 1
    }
  };

  if (user.name) {
    debug(`Generating path for user ${user.name}`);
    user.path = await User.generatePath(user.name);
  }

  debug('Creating new user via email signup:', user);

  const newUser = await User.create(user);

  return newUser;
}
