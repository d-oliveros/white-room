import { createClient, type RedisClientType } from '@redis/client';
import { createLogger } from '@namespace/logger';

const logger = createLogger('redis.client');

const { REDIS_HOST, REDIS_PORT = '6379' } = process.env;

let redisClientInstance: RedisClientType | null = null;
let isConnected = false;

export const isRedisEnabled = !!(REDIS_HOST && REDIS_PORT);

export function getRedisClient(): RedisClientType {
  if (!isRedisEnabled) {
    throw new Error('Redis is not enabled');
  }

  if (!redisClientInstance) {
    redisClientInstance = createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    });

    redisClientInstance.on('error', (error: Error) => {
      logger.error(error, 'Redis Client Error');
    });

    redisClientInstance.on('connect', () => {
      isConnected = true;
      logger.info('Redis Client Connected');
    });

    redisClientInstance.connect().catch((error: Error) => {
      logger.error(error, 'Redis Connection Error');
    });
  }

  return redisClientInstance;
}

export async function disconnectRedisClient(): Promise<void> {
  if (isConnected && redisClientInstance) {
    await redisClientInstance.disconnect();
    isConnected = false;
  }
  redisClientInstance = null;
}
