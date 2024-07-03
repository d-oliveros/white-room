import debug from 'debug';
import log from '../lib/log.js';
import safeLocalStorage from '../lib/safeLocalStorage.js';

export default function developmentEnvironment(state) {

  // Enable debugger in development environments.
  // https://github.com/visionmedia/debug#browser-support
  global.debug = debug;

  // Attaches a state debugger.
  const stateDebugger = debug('state');
  state.on('update', ({ type, data: { currentData, previousData } }) => {
    const diff = log.diff(currentData, previousData).value;
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
    safeLocalStorage.setItem('debug', `${state.get(['env', 'APP_ID'])}:*`);
  }
}
