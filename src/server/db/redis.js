import redis from 'redis';
import { promisify } from 'util';
import redisCommands from 'redis-commands';

const redisClient = redis.createClient(__config.database.redis);

// Promisify redis methods.
redisCommands.list.forEach((fullCommand) => {
  const commandName = fullCommand.split(' ')[0];
  if (commandName !== 'multi') {
    redisClient[`${commandName}Async`] = promisify(redisClient[commandName]);
  }
});

redisClient.on('error', (err) => __log.error(err));

export default redisClient;
