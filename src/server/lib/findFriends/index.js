const services = {
  facebook: require('./Facebook.js'),
  twitter: require('./Twitter.js'),
  google: require('./Google.js')
};

export function findFriends(provider, ids) {
  const User = require('../../models/User');

  const query = {
    'providers.name': provider,
    'providers.id': { $in: ids }
  };
  const select = { id: true, subscriptions: true, counts: true, name: true, image: true, path: true };

  return User.find(query).select(select);
}

export async function getFriends(provider, accessToken, accessTokenSecret) {
  const service = new services[provider](accessToken, accessTokenSecret);
  const ids = await service.get();
  return findFriends(provider, ids);
}
