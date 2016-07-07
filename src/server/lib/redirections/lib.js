import { pick } from 'lodash';
import redis from '../../modules/db/redis';

export async function addRedirection(redirection) {
  const key = `redirections-${redirection.source}`;
  const stringified = JSON.stringify(pick(redirection, 'target', 'code'));
  return await redis.setAsync(key, stringified);
}

export default { addRedirection };
