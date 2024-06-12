import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

import dbConfig from '#config/database.js';
import logger from '#common/logger.js';

const redis = new IORedis(dbConfig.redis);

const redisLeaderKey = 'app-redis-leader';
const ttl = 8000;

redis.leaderId = uuidv4();
redis.isLeader = false;

redis.renewLeadership = async () => {
  const currentLeaderId = await redis.get(redisLeaderKey);
  if (currentLeaderId === redis.leaderId) {
    // Renew leadership if still the leader
    await redis.pexpire(redisLeaderKey, ttl); // Extend the TTL
    setTimeout(redis.renewLeadership, ttl / 2);
  }
  else {
    redis.isLeader = false;
  }
}

redis.claimLeadership = async () => {
  try {
    const result = await redis.set(redisLeaderKey, redis.leaderId, 'NX', 'PX', ttl);

    if (result === 'OK') {
      // Successfully acquired leadership
      redis.isLeader = true;
      setTimeout(redis.renewLeadership, ttl / 2);
    }
    else {
      redis.isLeader = false;
    }
  }
  catch (error) {
    logger.error(`Redis Error: ${error.message} ${error.stack}`);
  }
}

redis.initClaimLeadershipInterval = async () => {
  await redis.claimLeadership();
  return setInterval(redis.claimLeadership, ttl);
}

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.claimLeadershipInterval = redis.initClaimLeadershipInterval();

export default redis;
