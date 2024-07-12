import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import dbConfig from '#white-room/config/database.js';
import logger from '#white-room/logger.js';

// Create Redis client using connection details from database configuration
const redis = new Redis({
  host: dbConfig.redis.host,
  port: dbConfig.redis.port,
  db: dbConfig.redis.db,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('[redis] Connected to Redis');
});

redis.on('error', (redisError) => {
  const error = new Error('Redis connection error', { cause: redisError });
  error.name = redisError.name;
  logger.error(error);
});

const redisLeaderKey = 'app-redis-leader';
const ttlSeconds = 3;

// Unique identifier for this instance and initial leadership status
redis.leaderId = uuidv4();
redis.isLeader = false;

/**
 * Renews the leadership of the current instance by extending the TTL
 */
redis.renewLeadership = async () => {
  try {
    const currentLeaderId = await redis.get(redisLeaderKey);
    if (currentLeaderId === redis.leaderId) {
      // Renew leadership if still the leader
      await redis.expire(redisLeaderKey, ttlSeconds); // Extend the TTL in seconds
      setTimeout(redis.renewLeadership, (ttlSeconds * 1000) / 2); // Schedule next renewal at half TTL
    }
    else {
      logger.info(`Instance ${redis.leaderId} is no longer the leader`);
      redis.isLeader = false;
    }
  } catch (redisError) {
    const error = new Error(`Redis Error during renewLeadership: ${redisError.message}`, { cause: redisError });
    logger.error(error);
  }
};

/**
 * Claims leadership by setting the leader key in Redis with a TTL
 */
redis.claimLeadership = async () => {
  try {
    const result = await redis.set(redisLeaderKey, redis.leaderId, 'PX', ttlSeconds * 1000, 'NX');

    if (result) {
      // If successfully set the key, the current instance becomes the leader
      logger.info(`[redis] Instance ${redis.leaderId} has become the leader`);
      redis.isLeader = true;
      setTimeout(redis.renewLeadership, (ttlSeconds * 1000) / 2); // Schedule first renewal at half TTL
    }
  } catch (error) {
    logger.error(`Redis Error during claimLeadership: ${error.message} ${error.stack}`);
  }
};

/**
 * Initializes the interval to claim leadership periodically
 */
redis.initClaimLeadershipInterval = async () => {
  logger.info('[redis] Initializing leadership claim interval');
  await redis.claimLeadership();
  return setInterval(redis.claimLeadership, ttlSeconds * 1000); // Repeat claiming every TTL seconds
};

// The `ioredis` client automatically connects upon instantiation, so no need to call `connect()`
redis.on('ready', async () => {
  logger.info(`[redis] Redis client is ready: ${redis.leaderId}`);
  redis.claimLeadershipInterval = await redis.initClaimLeadershipInterval();
});

export default redis;
