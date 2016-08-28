import inspect from 'util-inspect';
import invariant from 'invariant';
import he from 'he';
import { parseJSON } from 'cd-common';
import log from '../lib/log';
import createTree from '../lib/tree';
import initialState from '../initialState';

const { NODE_ENV } = process.env;
const debug = log.debug('state');
const loaded = {};

/**
 * Loads the client's initial state.
 * @exports {Object} The initial state. This is an instance of Baobab.
 */
export default function getStateFromBrowser() {
  invariant(
    process.browser,
    'Only browsers are allowed to build the initial client state');

  if (loaded.state) return loaded.state;

  let state = initialState();

  debug('Initial state', inspect(state));

  // Get the state from the `window` object. The state is passed from the server
  // to the client through a script tag added at the bottom of the <head> section
  if (global.__INITIAL_STATE__) {
    state = parseJSON(he.decode(global.__INITIAL_STATE__));

    debug('Serialized state', state);
    state = Object.assign(initialState(), state);

    const serializedStateNode = global.document.getElementById('serialized-state');
    serializedStateNode.parentNode.removeChild(serializedStateNode);
  }

  debug('Building Baobab tree with', inspect(state));

  const options = {
    asynchronous: true,
    autocommit: false,

    // disabled in production as it has performance penalties
    immutable: NODE_ENV !== 'production'
  };

  const tree = createTree(state, options);

  loaded.state = tree;

  return tree;
}
