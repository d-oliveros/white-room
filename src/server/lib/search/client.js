import { Client } from 'elasticsearch';
import request from 'superagent';

const { host } = __config.search;
const client = new Client(__config.search);

client.reachable = false;

/**
 * Checks if the search cluster is reachable in the network
 */
client.isReachable = function() {
  return new Promise((resolve) => {
    request.get(host, (err) => {
      const isReachable = !err;
      client.reachable = isReachable;
      resolve(isReachable);
    });
  });
};

export default client;
