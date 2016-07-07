import request from 'superagent';
import { each } from 'lodash';
import { stringify } from 'querystring';

const debug = __log.debug('boilerplate:modules:findFriends');
const endpoint = 'https://graph.facebook.com/v2.5/me/friends?fields=id&';

export default class Facebook {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.friends = [];
  }

  get() {
    return this.http(`${endpoint}${stringify({ access_token: this.accessToken })}`);
  }

  http(url) {
    debug(`request to: ${url}`);
    return new Promise((resolve, reject) =>
      request
        .get(url)
        .end((err, res) => err ? reject(err) : resolve(this.parse(JSON.parse(res.text))))
    );
  }

  parse({ data, paging }) {
    each(data, (user) => this.friends.push(`${user.id}`));

    if (paging && paging.next) {
      debug(`getting next page`);
      return this.http(paging.next);
    }

    debug(`friends [ ${this.friends} ]`);
    return this.friends;
  }
}
