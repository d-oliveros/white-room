import Baobab from 'baobab';
import log from '#white-room/client/lib/log.js';

const debug = log.debug('lib:tree');

/**
 * Creates a state object, which is an instance of Baobab,
 * with an overrided
 *
 * @return {Object}  Baobab Tree
 */
export default function createStore(state, options) {
  const tree = new Baobab(state, {
    asynchronous: false,
    autocommit: false,
    immutable: false,
    ...(options || {}),
  });
  tree.__commit = tree.commit;
  tree.commit = treeCommit.bind(tree);
  return tree;
}

/**
 * If the state is transitioning, turns a flag on. If not, it commits.
 * @override commit
 */
function treeCommit() {
  if (this.get('isTransitioning')) {
    debug('Transitioning. Not committing');
    this.set('pendingCommit', true);
  }
  else {
    debug('Committing');
    this.__commit();
  }
}
