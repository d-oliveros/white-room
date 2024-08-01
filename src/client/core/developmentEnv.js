import debug from 'debug';
import objectDiff from '#white-room/util/objectDiff.js';
import safeLocalStorage from '#white-room/client/lib/safeLocalStorage.js';

export default function developmentEnvironment(state) {

  // Enable debugger in development environments.
  // https://github.com/visionmedia/debug#browser-support
  global.debug = debug;

  // Attaches a state debugger.
  const stateDebugger = debug('state');
  state.on('update', ({ type, data: { currentData, previousData } }) => {
    const diff = objectDiff(currentData, previousData).value;
    stateDebugger('tree updated', type, diff);
  });

  // Exposes the state in the global object for development purposes.
  Object.defineProperty(global, 'state', {
    get() {
      return state.get();
    },
  });

  // Enable debug messages initially.
  if (typeof safeLocalStorage.getItem('debug') !== 'string') {
    safeLocalStorage.setItem('debug', `${state.get(['client', 'env', 'APP_ID'])}:*`);
  }
}
