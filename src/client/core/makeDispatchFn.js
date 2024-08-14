import typeCheck from '#white-room/util/typeCheck.js';
import logger from '#white-room/logger.js';

const debug = logger.createDebug('client:actions');

export default function makeDispatchFn({ state, apiClient }) {
  typeCheck('state::Object', state);
  typeCheck('apiClient::Object', apiClient);

  return function dispatchFn(fn, ...args) {
    if (!fn || typeof fn !== 'function') {
      const error = new Error(
        '[dispatch] Tried dispatching a function, but no function was provided. ' +
        `Dispatched value: ${fn} [${typeof fn}]`
      );
      error.name = 'ClientDispatchMissingFunctionError';
      throw error;
    }
    debug(`Dispatching: ${fn.name || 'anonymous'}`, ...args);
    return fn({ state, apiClient }, ...args);
  };
}
