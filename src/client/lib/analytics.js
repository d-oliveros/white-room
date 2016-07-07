import inspect from 'util-inspect';
import ls from 'local-storage';
import assert from 'http-assert';
import { getTeaser, capitalize } from 'cd-common';
import { isEmpty, isObject, extend, each, omit } from 'lodash';
import experimentsConfig from '../../../config/experiments';
import log from './log';

const debug = log.debug('lib:analytics');
const isBrowser = process.browser;

class Analytics {
  constructor() {
    this.queue = [];
    this.flushAt = 20;
    this.flushAfter = 10 * 1000;
  }

  configure(state) {
    this.state = state;
  }

  /**
   * Determines if we should track this session.
   *
   * @return {Boolean}  Should we track this session?.
   */
  shouldTrack() {
    if (!isBrowser) return false;

    const currentUser = this.state.get('currentUser');
    let valid = !currentUser.roles.admin && !currentUser.managed;

    if (!valid) {
      debug('Not tracking this user.');
    }

    if (!global.analytics) {
      valid = false;
    }

    return valid;
  }

  /**
   * Identifies a user.
   *
   * @param {Object}  user  The user to identify as.
   */
  identify(user) {
    debug(`Identifying ${inspect(user)}.`);

    if (this.shouldTrack()) {
      const id = user.id;
      const traits = omit(user, 'password', 'providers', 'tokens', 'invitations');
      global.analytics.identify(id, traits);
    }
  }

  /**
   * Clears the analytics user state
   */
  logout() {
     debug(`Logging out`);

     if (this.shouldTrack()) {
       global.analytics.user().logout();

       if (global.mixpanel) {
         global.mixpanel.cookie.clear();
         global.mixpanel.identify();
       }
     }
   }

  /**
   * Creates a user alias. This should be executed after a user signup,
   * to attribute his old events to his new ID.
   *
   * @param {String}  id      The new user ID.
   * @param {String}  prevId  The previous user ID.
   */
  alias(id, prevId) {
    debug(`Aliasing. ID: ${id}. Previous ID: ${prevId}.`);

    if (this.shouldTrack()) {
      global.analytics.alias(id, prevId);
    }
  }

  /**
   * Tracks an event.
   *
   * @param {String}  e     The event name.
   * @param {Object}  data  Extra properties to be attached to this event.
   */
  track(e, data, options = {}) {
    data = this.setMeta(data);
    let trackingMsg = `Tracking ${e}. Data:\n${inspect(data)}.`;

    if (!isEmpty(options)) {
      trackingMsg += `\nOptions:\n${inspect(options)}`;
    }

    debug(trackingMsg);

    if (this.shouldTrack()) {
      global.analytics.track(e, data, options);
    }
  }

  /**
   * Tracks a page view.
   *
   * @param {String}  name  The page title.
   */
  pageview() {
    const section = this.state.get('pageMetadata', 'section');
    const title = this.state.get('pageMetadata', 'pageTitle') || 'White Room';
    const data = { title };

    debug(`Tracking page view: "${section}" (${title})`);

    // Tracks a page view event in Mixpanel
    this.track(`Viewed ${section} Page`, {}, {
      integrations: {
        All: false,
        Mixpanel: true
      }
    });

    // Tracks a page view event everywhere else
    if (this.shouldTrack()) {
      global.analytics.page(section, data);
    }
  }

  /**
   * Sets contextual meta information to the passed object.
   *
   * @param  {Object}  data  The object that will be populated with meta info.
   * @return {Object}        The populated object.
   */
  setMeta(data = {}) {
    if (!isBrowser) return data;

    const state = this.state;
    const user = state.get('currentUser');
    const experiments = state.get('experiments');
    const trackerTemplate = state.get('trackerTemplate');

    data['Referer'] = document.referer; // eslint-disable-line dot-notation
    data['Initial Referrer'] = ls.get('initial-referrer');
    data['Page Name'] = document.title;
    data['Page URL'] = global.location.pathname;
    data['Current User Session ID'] = state.get('sessionId');

    // Logged-in users
    if (!user.roles.anonymous) {
      data['Current User ID'] = user.id;
      data['Current User Name'] = user.name;
      data['Current User Email'] = user.email;
      data['Current User Is Anonymous'] = 'No';
      data['Current User Is Managed'] = user.managed ? 'Yes' : 'No';
      data['Current User Is Moderator'] = user.roles.moderator ? 'Yes' : 'No';
      data['Current User Is Admin'] = user.roles.admin ? 'Yes' : 'No';
    // Anonymous users
    } else {
      data['Current User ID'] = 'Anonymous';
      data['Current User Name'] = 'Anonymous';
      data['Current User Email'] = 'Anonymous';
      data['Current User Is Anonymous'] = 'Yes';
      data['Current User Is Managed'] = 'No';
      data['Current User Is Moderator'] = 'No';
      data['Current User Is Admin'] = 'No';

      if (user.signupProvider) {
        data['Current User Signed Up With'] = user.signupProvider;
      }
    }

    // Add the tracker template
    if (trackerTemplate) {
      data['CyberSue Tracking Template'] = trackerTemplate;
    }

    // Add the experiment variations and A/B testing data
    each(experiments, (variation, key) => {
      const experiment = experimentsConfig[key];

      if (isObject(experiment)) {
        data[`Experiment: ${experiment.name}`] = variation;
      }
    });

    // Pick certain fields in entities
    if (data._entities) {
      each(data._entities, (entity, type) => {
        switch (type) {
          case 'user': extend(data, getUserMeta(entity)); break;
          case 'post': extend(data, getPostMeta(entity)); break;
          case 'tag': extend(data, getTagMeta(entity)); break;
        }
      });

      delete data._entities;
    }

    // Remove undefined values
    data = JSON.parse(JSON.stringify(data));

    return data;
  }

  user(userId) {
    assert(userId, 400, 'userId is required');
    this.enqueue({ type: 'user', userId });
  }

  post(postId, userId) {
    assert(postId, 400, 'postId is required');
    this.enqueue({ type: 'post', postId, userId });
  }

  posts(posts) {
    posts.map((post) => {
      this.post(post.id, post.askedTo);
    });
  }

  users(users) {
    users.map((user) => {
      this.user(user.id);
    });
  }

  enqueue(track) {
    if (!isBrowser) return;

    this.queue.push(track);
    debug(`added to queue ${track.type} with params ${inspect(track)}`);

    if (this.queue.length >= this.flushAt) this.flush();
    if (this.timer) clearTimeout(this.timer);

    this.timer = setTimeout(this.flush.bind(this), this.flushAfter);
  }

  async flush() {
    if (!this.queue.length) return;

    const batch = this.queue.splice(0, this.flushAt);
    debug(`flush ${batch.length} items`);

    try {
      await StatsAPI.batch(batch);
    } catch (e) {
      batch.map((track) => this.track(track));
    }
  }
}

/**
 * Gets the analytic meta information of a user.
 * @param  {Object}  user  A user.
 * @return {Object}        Meta information.
 */
function getUserMeta(user) {
  const trackingData = {
    'User ID': user._id
  };

  trackingData['User Name'] = user.name;
  trackingData['User Path'] = user.path;
  trackingData['User Headline'] = user.headline;

  if (user.email) {
    trackingData['User Email'] = user.email;
  }

  if (user.signupProvider) {
    trackingData['User Signed Up With'] = capitalize(user.signupProvider);
  }

  return trackingData;
}

/**
 * Gets the analytic meta information of a post.
 * @param  {Object}  post  A post.
 * @return {Object}        Meta information.
 */
function getPostMeta(post) {
  const entity = post.threadLevel === 0
    ? 'Question'
    : post.threadLevel === 1
      ? 'Answer'
      : 'Reply';

  const trackingData = {
    'Body Length': post.body.length,
    'Body Teaser': getTeaser(post.body, 120),
    'Thread Level': post.threadLevel
  };

  trackingData[entity + ' ID'] = post.id;
  trackingData[entity + ' Is Anonymous'] = post.anonymous;

  if (post.user) {
    trackingData['User ID'] = post.user;
    trackingData['User Name'] = post.userName;
    trackingData['User Headline'] = post.userHeadline;
  }

  return trackingData;
}

/**
 * Gets the analytic meta information of a tag.
 * @param  {Object}  tag   A tag.
 * @return {Object}        Meta information.
 */
function getTagMeta(tag) {
  const trackingData = {
    'Tag Name': tag.name,
    'Tag Slug': tag.slug,
    'Tag ID': tag.id
  };

  return trackingData;
}

export default new Analytics();
