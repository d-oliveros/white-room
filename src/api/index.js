import path from 'path';
import lodashValues from 'lodash/fp/values';
import requireIndex from 'es6-requireindex';

function getActionSpecsList(actionSpecs) {
  const actionSpecValues = lodashValues(actionSpecs);
  return actionSpecValues.reduce((memo, actionSpecValue) => {
    if (typeof actionSpecValue === 'object' && actionSpecValue) {
      if (typeof actionSpecValue.handler === 'function') {
        memo.push(actionSpecValue);
      }
      else {
        memo.push(...getActionSpecsList(actionSpecValue));
      }
    }
    return memo;
  }, []);
}

export const actionSpecs = requireIndex(path.join(__dirname, 'handlers'));
export const actionSpecsList = getActionSpecsList(actionSpecs);

export actionTypes from './actionTypes';
export createApiClient from './createApiClient';
export createApiServer from './createApiServer';
