import debug from 'debug';
import log from '../lib/log';

export default function developmentEnvironment(state) {

  // Enable debugger in development environments
  // @see https://github.com/visionmedia/debug#browser-support
  global.debug = debug;

  // Attaches a state debugger
  const stateDebugger = debug('state');
  state.on('update', ({ type, data: { currentData, previousData } }) => {
    const diff = log.diff(currentData, previousData).value;
    stateDebugger('tree updated', type, diff);
  });

  // Exposes the state in the global object for development purposes.
  Object.defineProperty(global, 'state', {
    get() {
      return state.get();
    }
  });
}
