import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

import dbConfig from '#white-room/config/database.js';
import logger from '#white-room/logger.js';

const redisUrl = `redis://${dbConfig.redis.host}:${dbConfig.redis.port}`;
const redis = createClient({ url: redisUrl });

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

const redisLeaderKey = 'app-redis-leader';
const ttlSeconds = 8;

redis.leaderId = uuidv4();
redis.isLeader = false;

redis.renewLeadership = async () => {
  try {
    const currentLeaderId = await redis.get(redisLeaderKey);
    if (currentLeaderId === redis.leaderId) {
      // Renew leadership if still the leader
      await redis.expire(redisLeaderKey, ttlSeconds); // Extend the TTL in seconds
      setTimeout(redis.renewLeadership, (ttlSeconds * 1000) / 2); // Schedule next renewal at half TTL
    } else {
      redis.isLeader = false;
    }
  } catch (error) {
    logger.error(`Redis Error during renewLeadership: ${error.message} ${error.stack}`);
  }
};

redis.claimLeadership = async () => {
  try {
    const result = await redis.set(redisLeaderKey, redis.leaderId, {
      NX: true,
      PX: ttlSeconds * 1000 // Set TTL in milliseconds for `set`
    });

    if (result) {
      // Successfully acquired leadership
      redis.isLeader = true;
      setTimeout(redis.renewLeadership, (ttlSeconds * 1000) / 2); // Schedule first renewal at half TTL
    } else {
      redis.isLeader = false;
    }
  } catch (error) {
    logger.error(`Redis Error during claimLeadership: ${error.message} ${error.stack}`);
  }
};

redis.initClaimLeadershipInterval = async () => {
  await redis.claimLeadership();
  return setInterval(redis.claimLeadership, ttlSeconds * 1000); // Repeat claiming every TTL seconds
};

redis.connect().then(async () => {
  redis.claimLeadershipInterval = await redis.initClaimLeadershipInterval();
}).catch((error) => {
  logger.error('Redis connection error:', error);
});

export default redis;
