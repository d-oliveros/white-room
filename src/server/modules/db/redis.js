import redis from 'redis';
import { promisifyAll } from 'bluebird';

promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

const { port, host, options } = __config.database.redis;
const client = redis.createClient(port, host, options);

client.on('error', (err) => __log.error(err.stack));

export default client;
