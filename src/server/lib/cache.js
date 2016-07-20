import CachemanRedis from 'cacheman-redis';
import promisifyAll from 'es6-promisify-all';
import redisClient from '../modules/db/redis';

const cache = new CachemanRedis({
  ttl: process.env.CACHE_TTL || 60 * 60 * 24, // 1 day
  redis: redisClient
});

promisifyAll(cache);

export default cache;
