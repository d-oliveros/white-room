import CachemanRedis from 'cacheman-redis';
import { promisifyAll } from 'bluebird';
import redisClient from '../modules/db/redis';

const cache = new CachemanRedis({
  ttl: __config.cache.ttl,
  redis: redisClient
});

promisifyAll(cache);

export default cache;
