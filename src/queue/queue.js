import { Queue } from 'bullmq';
import redisClient from '#whiteroom/server/db/redis.js';

const {
  QUEUE_ID = 'queue',
} = process.env;

const queue = new Queue(QUEUE_ID, {
  connection: redisClient,
});

export default queue;
