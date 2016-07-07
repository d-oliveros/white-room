import request from 'superagent';
import OAuth from 'oauth';
import { stringify } from 'querystring';
import { getTeaser } from 'cd-common';
import { random } from 'lodash';

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

export default async function share(params, provider, accessToken, accessTokenSecret) {
  const vars = getVars(params);
  return await providers[provider](vars, accessToken, accessTokenSecret);
}

const providers = {
  facebook({ base, href, teaser, message, user }, accessToken) {
    const params = {
      caption: `By ${user.name}`,
      link: href,
      name: base.title,
      description: teaser,
      access_token: accessToken,
      message
    };

    return new Promise((resolve, reject) => {
      request
        .post(`https://graph.facebook.com/v1.0/me/feed?${stringify(params)}`)
        .end((err) => err ? reject(err) : resolve());
    });
  },

  twitter(vars, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
      if (vars.shortHref.length > 96) {
        return reject('The shortHref too long');
      }

      const status = encodeURIComponent(_getTwitterShareText(vars, 140));

      request
        .post(`https://api.twitter.com/1.1/statuses/update.json?status=${status}`)
        .sign(oauth, accessToken, accessTokenSecret)
        .end((err) => err ? reject(err) : resolve());
    });
  },

  linkedin({ base, href, teaser, message }, accessToken) {
    const params = {
      content: {
        title: base.title,
        'submitted-url': href,
        description: teaser
      },
      comment: message,
      visibility: {
        code: 'anyone'
      }
    };

    return new Promise((resolve, reject) => {
      request
        .post('https://api.linkedin.com/v1/people/~/shares?format=json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(params)
        .end((err) => err ? reject(err) : resolve());
    });
  }
};

function getVars({ base, post, user }) {
  const href = `${process.env.APP_HOST}/${base.askedToPath}/questions/${base.path}?focus=${post.id}`;

  const teaser = post.body.length > 350
    ? getTeaser(post.body, 260) + '... '
    : post.body;

  const shortHref = post.shortUrl
    ? post.shortUrl
    : href;

  const messages = [
    'You should check out my answer :)',
    'Someone asked me a question. See my answer :)'
  ];


  return {
    ...post,
    user: user,
    base: base,
    teaser: teaser,
    href: href,
    shortHref: shortHref,
    message: messages[random(0, messages.length - 1)]
  };
}

/**
 * Gets the twitter message to be shared.
 * @param  {Post}    post  The post to share.
 * @param  {Number}  limit  The message's character limit.
 */
function _getTwitterShareText(vars, limit) {
  const title = vars.base.title;
  const href = vars.shortHref;
  let trim = 0;
  let shareText;

  do {
    shareText = _doTwitterShareText(title, trim, href);
    if (trim > 140) {
      trim = 0;
    } else {
      trim++;
    }
  } while (shareText.length > (limit - 2));

  return shareText;
}

/**
 * Recursive function that generates the correct twitter message to be shared.
 *
 * @param  {String}  title    The post's title.
 * @param  {Number}  trim     The trimming count, used internally.
 * @param  {String}  href     The link pointing to this post.
 *
 * @return {Boolean}          The resulting twitter share text.
 */
function _doTwitterShareText(title, trim, href) {
  if (trim) {
    title = title.substring(0, title.length - (trim + 3)) + '...';
  }

  return `Just answered @WiselikeHQ question: "${title}" ${href}`;
}
