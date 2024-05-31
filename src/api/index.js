import path from 'path';
import { fileURLToPath } from 'url';
import lodashValues from 'lodash/fp/values.js';

import { loadModules } from '#common/util/loadModules.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getActionSpecsList(actionSpecs) {
  const actionSpecValues = lodashValues(actionSpecs);
  return actionSpecValues.reduce((memo, actionSpecValue) => {
    if (typeof actionSpecValue === 'object' && actionSpecValue) {
      if (typeof actionSpecValue.handler === 'function') {
        memo.push(actionSpecValue);
      } else {
        memo.push(...getActionSpecsList(actionSpecValue));
      }
    }
    return memo;
  }, []);
}

export const actionSpecs = await loadModules(path.join(__dirname, 'handlers'));
export const actionSpecsList = getActionSpecsList(actionSpecs);

export * as actionTypes from './actionTypes.js';
export { default as createApiClient } from './createApiClient.js';
export { default as createApiServer } from './createApiServer.js';
