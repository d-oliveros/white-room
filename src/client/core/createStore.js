import Baobab from 'baobab';
import logger from '#white-room/logger.js';

const debug = logger.createDebug('client:state');

/**
 * Creates a state object, which is an instance of Baobab,
 * with an overrided
 *
 * @return {Object}  Baobab Tree
 */
export default function createStore(state, options) {
  const tree = new Baobab(state, options);
  tree.__commit = tree.commit;
  tree.commit = treeCommit.bind(tree);
  return tree;
}

/**
 * If the state is transitioning, turns a flag on. If not, it commits.
 * @override commit
 */
function treeCommit({ force } = {}) {
  if (!force && this.get('isTransitioning')) {
    debug('Transitioning. Not committing');
    this.set('pendingCommit', true);
  }
  else {
    debug('Committing');
    this.__commit();
  }
}
