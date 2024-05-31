import redis from 'redis';

import dbConfig from '#config/database.js';
import logger from '#common/logger.js';

const redisClient = redis.createClient(dbConfig.redis);
redisClient.on('error', (err) => logger.error(err));

export default redisClient;
