import createApiClient from '../src/api/createApiClient';
import makeInitialState from '../src/client/makeInitialState';
import createTree from '../src/client/lib/tree';
import log from '../src/client/lib/log';

const {
  COMMIT_HASH,
  APP_URL,
} = process.env;

export const createLoggerFunc = (funcName) => {
  return (...args) => {
    log.info(`Called: "${funcName}" with: ${JSON.stringify(args, null, 2)}`);
  }
}

export const dummyHistory = {
  push: createLoggerFunc('push'),
  replace: createLoggerFunc('replace'),
  listen: createLoggerFunc('push'),
};

export const defaultTreeOptions = {
  asynchronous: true,
  autoCommit: false,
  immutable: true,
};

export const dummyApiClient = createApiClient({
  commitHash: COMMIT_HASH,
  apiPath: '/api/v1',
  appUrl: APP_URL,
  sessionTokenName: 'X-Session-Token',
});
