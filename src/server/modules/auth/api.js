import { Router } from 'express';
import { resolve } from 'bluebird';
import { extend, each } from 'lodash';
import createError from 'http-errors';
import inspect from 'util-inspect';
import { redis } from '../../modules/db';
import { getRequestIP } from '../../lib/geocoder';
import { generateToken, verify } from './token';
import profiles from './profiles';
import oAuthHandler from './oAuthHandler';
import oAuthProvider from './oAuthProvider';

const providers = {
  twitter: require('twitter-oauth-agent'),
  google: require('google-oauth-agent'),
  facebook: require('facebook-oauth-agent'),
  linkedin: require('linkedin-oauth-agent')
};

const debug = __log.debug('auth');
const router = new Router();

router.post('/signup', async (req, res, next) => {
  const { User } = require('../../models');
  req.checkBody('email', 'Email is required.').notEmpty();
  req.checkBody('email', 'Email is invalid.').isEmail();

  if (req.validationErrors()) {
    return res.status(400).send(req.validationErrors());
  }

  const ip = getRequestIP(req);
  const userData = req.body;
  userData.signupIp = ip || undefined;

  if (req.cookies.__tmpl) {
    userData.trackerTemplate = req.cookies.__tmpl;
  }

  debug(`User signup with email: ${req.body.email} ${inspect(userData)}`);

  let user;

  try {
    user = await User.emailSignup(userData);
  } catch (e) {
    return next(e);
  }

  await addPostsAndAppreciations(user, req.body);

  const variation = await redis.getAsync(`email-variation-${ip}`);
  if (variation) {
    user.signedUpEmailVariation = variation;
    await user.save();
  }

  debug(`creating user session`);
  const userSession = user.createSession();
  const token = generateToken(userSession);

  res.cookie('token', token, __config.cookies);

  if (req.body.redirect) {
    res.redirect(req.body.redirect);
  } else {
    res.json({ user: userSession, token: token });
  }
});

router.post('/signupWithInvitation', (req, res, next) => {
  const { User, Token } = require('../../models');
  req.checkBody('email', 'Email is required.').notEmpty();
  req.checkBody('email', 'Email is invalid.').isEmail();
  req.checkBody('invitation', 'Token is required.').notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send(req.validationErrors());
  }

  let user;

  Token.authorize(req.body.invitation, { claimed: true })
    .then(() => User.emailSignup(req.body))
    .then((newUser) => {
      user = newUser;

      return addPostsAndAppreciations(user, req.body);
    })
    .then(() => {
      const userSession = user.createSession();
      const token = generateToken(userSession);

      res.cookie('token', token, __config.cookies);
      res.json({ user: userSession, token: token });
    })
    .catch(next);
});


router.post('/invitation', (req, res, next) => {
  const { User, Invitation } = require('../../models');

  req.checkBody('email', 'Valid email is required').notEmpty().isEmail();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).send('Email is invalid');
  }

  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) throw createError(400, 'This email has already been used');

      return Invitation.findOne({ email });
    })
    .then((invitation) => {
      if (invitation) throw createError(400, 'This email has already been used.');
      return Invitation.create({ email });
    })
    .then(() => {
      __log.info(`New user invite: ${email}`);
      res.status(200).end();
    })
    .catch(next);

});

router.get('/invitation', (req, res) => {
  const { User, Invitation } = require('../../models');

  req.checkQuery('id', 'Valid key is required').isObjectId().notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    __log.error(errors);
    return res.redirect('/');
  }

  const { id } = req.query;
  let user;

  Invitation.findById(id)
    .then((invitation) => {
      if (!invitation) throw createError(404, 'Invitation not found');

      if (invitation.status === 'claimed') {
        return User.findOne({ email: invitation.email });
      }

      return User.emailSignup({ email: invitation.email });
    })
    .then((newUser) => {
      user = newUser;

      return Invitation.update({ _id: id }, { status: 'claimed' });
    })
    .then(() => {
      user.isChangingPassword = true;
      return user.save();
    })
    .then(() => {
      const userSession = user.createSession();
      const token = generateToken(userSession);

      res.cookie('token', token, __config.cookies);
      res.redirect('/initiation/password');
    })
    .catch((err) => {
      __log.error(err);
      return res.redirect('/');
    });

});

/**
 * Twitter strategy
 */
router.get('/twitter/request', (req, res, next) => {
  if (__config.auth.twitter.consumer_key) {
    providers.twitter(__config.auth.twitter, (err, token) => {
      if (err) return next(err);
      res.json(token);
    });
  } else {
    res.sendStatus(202);
  }
});

/**
 * OAuth2 strategies
 */
router.post('/:provider', async (req, res) => {
  const { body } = req;
  const onlyLogIn = req.body.onlyLogIn;
  const { provider } = req.params;
  const options = extend(body, __config.auth[provider]);

  const profile = await oAuthProvider(provider, options);

  const user = await oAuthHandler(provider, profile, onlyLogIn);

  // The requester selected only logging option and no user was found
  if (!user) {
    return res.sendStatus(404);
  }

  // If user is deleted return something to the user
  if (user.deleted) {
    return res.sendStatus(410);
  }

  await addPostsAndAppreciations(user, req.body);

  const ip = getRequestIP(req);
  const variation = await redis.getAsync(`email-variation-${ip}`);

  if (ip && !user.signupIp) {
    user.signupIp = ip;
  }

  if (variation) {
    user.signedUpEmailVariation = variation;
  }

  if (req.cookies.__tmpl) {
    user.trackerTemplate = req.cookies.__tmpl;
  }

  user.logs.sessions += 1;
  const userSession = user.createSession();
  const token = generateToken(userSession);

  await user.save();

  res.cookie('token', token, __config.cookies);
  res.json({ user: userSession, token });
});

router.post('/share/:provider', (req, res) => {
  const { User } = require('../../models');
  const { body } = req;
  const { provider } = req.params;
  const options = extend(body, __config.auth[provider]);

  providers[provider](options, async (err, profile) => {
    if (err) {
      return res.status(500).end();
    }

    profile = profiles[provider](profile);
    const decoded = await verify(req.cookies.token);
    const user = await User.findById(decoded._id);
    const token = user.getToken(provider);

    if (!profile.accessToken || (provider === 'twitter' && !profile.accessTokenSecret)) {
      return res.status(500).end();
    }

    if (!token) {
      user.tokens.push({
        name: provider,
        id: profile.id,
        accessToken: profile.accessToken,
        accessTokenSecret: profile.accessTokenSecret
      });
    } else {
      token.accessToken = profile.accessToken;
      token.accessTokenSecret = profile.accessTokenSecret;
    }

    await user.save();
    res.json({ tokens: user.tokens });
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token', __config.cookies);
  res.status(200).end();
});

router.get('/password-reset', (req, res) => {
  const { User, Token } = require('../../models');

  req.checkQuery('email', 'Valid email is required').notEmpty().isEmail();
  req.checkQuery('key', 'Valid key is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.redirect('/');
  }

  const email = req.query.email.trim().toLowerCase();
  const token = req.query.key;

  debug(`Email: ${email}, Token: ${token}`);

  const validate = {
    email: email,
    expiration: 86400 // Seconds
  };

  Token.authorize(token, validate)
    .then(() => Token.claim(token))
    .then(() => User.findOne({ email }))
    .then((user) => {
      user.isChangingPassword = true;
      user.roles.anonymous = true;
      return user.save();
    })
    .then((user) => {
      const userSession = user.createSession();
      const token = generateToken(userSession);

      res.cookie('token', token, __config.cookies);
      return res.redirect(`/password-reset`);
    })
    .catch((err) => {
      if (err.statusCode) {
        res.redirect(`/?token_err=${err.statusCode}`);
      } else {
        __log.error(err);
        res.redirect('/');
      }
    });
});

router.get('/:provider/callback', (req, res) => {
  res.status(200).end();
});

function addPostsAndAppreciations(user, body) {
  const { Post } = require('../../models');
  const PostAPI = require('../../../api').Post;

  debug(`adding posts and appreciations`);

  const promises = [];

  if (body.sessionId) {
    promises.push(Post.assignPostsToUser(user._id, body.sessionId));
  }

  each(body.appreciations, (appreciation) => {
    if (!~user.appreciations.indexOf(appreciation.id)) {
      user.appreciations.push(appreciation.id);
    }

    PostAPI.addAppreciation(user._id, appreciation);
  });

  return Promise.all(promises)
    .then(() => resolve())
    .catch(() => resolve());
}

export default router;
