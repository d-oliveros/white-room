import request from 'superagent';
import OAuth from 'oauth';
import { each } from 'lodash';

require('superagent-oauth')(request);

const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  __config.auth.twitter.consumer_key,
  __config.auth.twitter.consumer_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

const debug = __log.debug('whiteroom:modules:findFriends');
const endpoint = 'https://api.twitter.com/1.1/friends/ids.json';

export default class Twitter {
  constructor(accessToken, accessTokenSecret) {
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
    this.friends = [];
  }

  get() {
    return this.http(endpoint);
  }

  http(url) {
    debug(`request to: ${url}`);
    return new Promise((resolve, reject) =>
      request
        .get(url)
        .sign(oauth, this.accessToken, this.accessTokenSecret)
        .end((err, res) => err ? reject(err) : resolve(this.parse(res.body)))
    );
  }

  parse(data) {
    const ids = data.ids;
    const nextCursor = data.next_cursor;

    each(ids, (userId) => this.friends.push(`${userId}`));

    if (nextCursor) {
      debug(`getting next page`);
      return this.http(`${endpoint}?cursor=${nextCursor}`);
    }

    debug(`friends [ ${this.friends} ]`);
    return this.friends;
  }
}
