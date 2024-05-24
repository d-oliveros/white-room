import createApiClient from '../src/api/createApiClient';
import makeInitialState from '../src/client/makeInitialState';
import createTree from '../src/client/lib/tree';
import log from '../src/client/lib/log';

const {
  COMMIT_HASH,
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
  autocommit: false,
  immutable: true,
};

export const loggedOutTree = createTree(
  makeInitialState(),
  defaultTreeOptions,
);

export const dummyApiClient = createApiClient({
  commitHash: COMMIT_HASH,
  apiPath: '/api/v1',
  sessionTokenName: 'X-Session-Token',
});

dummyApiClient.get = createLoggerFunc('get');
dummyApiClient.post = createLoggerFunc('post');
dummyApiClient.postWithState = createLoggerFunc('postWithState');
