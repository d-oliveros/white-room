import request from 'superagent';
import { parseJSON } from 'cd-common';

const pygmyEndpoint = __config.integrations.pygmy;
const debug = __log.debug('boilerplate:modules:pygmy');

export default {
  async shorten(link) {
    if (!pygmyEndpoint) {
      __log.warn(`Pygmy not enabled. Will not shorten ${link}`);
      return;
    }

    debug(`Creating short url for: ${link}`);

    return await new Promise((resolve) => {
      request.post(pygmyEndpoint)
        .send({ url: link })
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            __log.error(`Pygmy: Error generating a short url for ${link}`);
            __log.error(err);
            return resolve(link);
          }
          const shortUrl = parseJSON(res.text).shortUrl;
          debug(`Created short url: ${shortUrl}`);
          resolve(shortUrl);
        });
    });
  }
};
