import assert from 'assert';
import he from 'he';

import parseJSON from '#common/util/parseJSON.js';
import log from '#client/lib/log.js';
import createTree from '#client/lib/tree.js';
import makeInitialState from '#client/makeInitialState.js';

const debug = log.debug('state');

const NODE_ENV = process.env.NODE_ENV;

/**
 * Loads the client's initial state.
 * @exports {Object} The initial state. This is an instance of Baobab.
 */
export default function getStoreFromBrowser() {
  assert(
    process.browser,
    'Only browsers are allowed to build the initial client state');

  let state = makeInitialState();

  // Get the state from the `window` object. The state is passed from the server
  // to the client through a script tag added at the bottom of the <head> section
  if (global.__INITIAL_STATE__) {
    state = parseJSON(he.decode(global.__INITIAL_STATE__));

    state = Object.assign(makeInitialState(), state || {});

    debug('Initial state', state);

    const serializedStateNode = global.document.getElementById('serialized-state');
    serializedStateNode.parentNode.removeChild(serializedStateNode);
  }

  const options = {
    asynchronous: true,
    autocommit: false,

    // Disabled in production as this has performance penalties.
    immutable: NODE_ENV !== 'production',
  };

  const tree = createTree(state, options);

  debug('Building Baobab tree with', { state, options, tree });

  return tree;
}
