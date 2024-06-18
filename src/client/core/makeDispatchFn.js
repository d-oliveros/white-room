import typeCheck from '#common/util/typeCheck.js';
import log from '#client/lib/log.js';

const debugActions = log.debug('client:actions');

export default function makeDispatchFn({ state, apiClient, navigate }) {
  typeCheck('state::Object', state);
  typeCheck('apiClient::Object', apiClient);
  typeCheck('navigate::Object|Function', navigate);

  return function dispatchFn(fn, ...args) {
    if (!fn || typeof fn !== 'function') {
      const error = new Error(
        '[dispatch] Tried dispatching a function, but no function was provided. ' +
        `Dispatched value: ${fn} [${typeof fn}]`
      );
      error.name = 'ClientDispatchMissingFunctionError';
      throw error;
    }
    debugActions(`Dispatching: ${fn.name || 'anonymous'}`, ...args);
    return fn({ state, apiClient, navigate }, ...args);
  };
}
