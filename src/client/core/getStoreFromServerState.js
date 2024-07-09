import assert from 'assert';
import he from 'he';

import parseJSON from '#white-room/util/parseJSON.js';
import log from '#white-room/client/lib/log.js';
import createTree from '#white-room/client/core/createTree.js';

const debug = log.debug('state');

/**
 * Loads the client's initial state.
 * @exports {Object} The initial state. This is an instance of Baobab.
 */
export default function getStoreFromServerState({ serverStateStr, baobabOptions = {} } = {}) {
  assert(
    process.browser,
    'Only browsers are allowed to build the initial client state');

  let state = {};

  // The state is passed from the server to the client through
  // a script tag added at the bottom of the <head> section
  if (serverStateStr && typeof serverStateStr === 'string') {
    state = parseJSON(he.decode(serverStateStr));

    debug('Initial state', state);

    const serializedStateNode = global.document.getElementById('serialized-state');
    serializedStateNode.parentNode.removeChild(serializedStateNode);
  }

  const options = {
    asynchronous: true,
    autoCommit: false,
    immutable: true,
    ...baobabOptions,
  };

  const tree = createTree(state, options);

  debug('Building Baobab tree with', { state, options, tree });

  return tree;
}
