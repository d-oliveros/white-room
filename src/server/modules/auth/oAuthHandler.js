import inspect from 'util-inspect';
import { resolve } from 'bluebird';
import { chain } from 'lodash';
import { isEmail } from 'cd-common';

const debug = __log.debug('auth:oAuthHandler');

export default function oAuthHandler(provider, profile, onlyLogIn) {
  const { User } = require('../../models');

  debug(`Got ${provider} profile:\n${inspect(profile)}`);

  profile.emails = chain(profile.emails || [])
    .filter((email) => isEmail(email.value))
    .map((email) => email.value.toLowerCase())
    .value();

  profile.email = profile.emails.length ? profile.emails[0] : null;

  const query = {
    $or: [
      { email: { $in: profile.emails } },
      { 'providers.id': `${profile.id}` }
    ]
  };

  return User.findOne(query, User.fieldgroups.loggingIn)
    .then((user) => {
      if (!user) return resolve();
      if (user.getProvider(provider)) return user;

      return user.addProvider({ name: provider, id: profile.id });
    })
    .then((user) => {
      if (user) return user;

      if (!user && onlyLogIn) return false;

      profile.provider = provider;
      return User.oAuthSignup(profile);
    });
}
