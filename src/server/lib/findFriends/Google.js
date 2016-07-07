import request from 'superagent';
import { each } from 'lodash';

const debug = __log.debug('boilerplate:modules:findFriends');
const endpoint = 'https://www.googleapis.com/plus/v1/people/me/people/visible';

export default class Google {
  constructor(accessToken) {
    this.accessToken = accessToken;
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
        .set('Authorization', `Bearer ${this.accessToken}`)
        .end((err, res) => err ? reject(err) : resolve(this.parse(res.body)))
    );
  }

  parse({items, nextPageToken }) {
    each(items, (user) => this.friends.push(`${user.id}`));

    if (nextPageToken) {
      debug(`getting next page`);
      return this.http(`${endpoint}?pageToken=${nextPageToken}`);
    }

    debug(`friends [ ${this.friends} ]`);
    return this.friends;
  }
}
