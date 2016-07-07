/* eslint-disable no-multi-spaces*/

import TimeSeries from 'redis-timeseries';
import assert from 'assert';
import { isObjectId } from 'cd-common';
import redis from '../modules/db/redis';

const tsProto = TimeSeries.prototype;

const debug = require('debug')('timeseries');

const statsDefinition = {
  '1hour':  { ttl: tsProto.days(7),     duration: tsProto.hours(1) },
  '1day':   { ttl: tsProto.weeks(52),   duration: tsProto.days(1) },
  '30days': { ttl: tsProto.weeks(520),  duration: tsProto.days(30) },
  all:      { ttl: tsProto.weeks(5000), duration: tsProto.weeks(520) }
};

const statsDefinitionKeys = Object.keys(statsDefinition);

const ts = new TimeSeries(redis, 'stats', statsDefinition);

const defaults = {
  granularity: '1day',
  amount: 1,
  key: ''
};

export default {
  recordUser(userId, increment = 1) {
    assert(isObjectId(userId));

    debug(`Hit user ${userId}`);

    return new Promise((resolve) => {
      ts
        .recordHit(`user-${userId}`, undefined, increment)
        .exec(resolve);
    });
  },

  getUserStats(params = {}) {
    return new Promise((resolve, reject) => {
      assert(isObjectId(params.key));
      const opts = Object.assign({}, defaults, params);
      const key = `user-${opts.key}`;

      debug(`Get user stats with key ${key} , granularity ${opts.granularity} and amount ${opts.amount}`);

      ts.getHits(key, opts.granularity, opts.amount, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  },

  recordPost(postId, userId, increment = 1) {
    assert(isObjectId(postId));
    assert(isObjectId(userId));

    debug(`Hit post ${postId} with user ${userId}`);

    return new Promise((resolve) => {
      const multi = ts
        .recordHit(`post-${postId}`, undefined, increment)
        .recordHit(`user-posts-${userId}`, undefined, increment);

      multi.pendingMulti.sadd(`stats-users-to-update`, userId);
      multi.exec(resolve);
    });
  },

  getPostStats(params = {}) {
    return new Promise((resolve, reject) => {
      assert(typeof params === 'object');
      assert(isObjectId(params.key));
      const opts = Object.assign({}, defaults, params);
      assert(statsDefinitionKeys.indexOf(opts.granularity) > -1);
      const key = `post-${opts.key}`;

      debug(`Get post stats with key ${key} , granularity ${opts.granularity} and amount ${opts.amount}`);

      ts.getHits(key, opts.granularity, opts.amount, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  },

  getUserPostsStats(params = {}) {
    return new Promise((resolve, reject) => {
      assert(isObjectId(params.key));
      const opts = Object.assign({}, defaults, params);
      const key = `user-posts-${params.key}`;

      debug(`Get user posts stats with key ${key} , granularity ${opts.granularity} and amount ${opts.amount}`);

      ts.getHits(key, opts.granularity, opts.amount, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
};
