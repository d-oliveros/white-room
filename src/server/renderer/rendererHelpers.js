import jsesc from 'jsesc';
import assert from 'assert';

import typeCheck from '#common/util/typeCheck.js';

export function assertIdleApiState(apiState) {
  Object.keys(apiState).forEach((actionType) => {
    Object.keys(apiState[actionType]).forEach((apiStateQueryId) => {
      if (apiState[actionType][apiStateQueryId].inProgress === true) {
        const error = new Error(
          `API request still in progress: ${actionType}:${apiStateQueryId}`
        );
        error.name = 'ClientRenderApiRequestInProgressError';
        error.details = {
          apiState,
        };
        throw error;
      }
    });
  });
}

export function makeRendererResponse({ type, html, redirectUrl, error }) {
  typeCheck('type::NonEmptyString', type);
  typeCheck('html::Maybe NonEmptyString', html);
  typeCheck('redirectUrl::Maybe NonEmptyString', redirectUrl);
  assert(html || redirectUrl || error, 'html, redirectUrl or error is required.');

  return {
    type: type,
    html: html || null,
    redirectUrl: redirectUrl || null,
    error: error || null,
  };
}

// Serializes the state.
export function serializeState(state) {
  const stateWithoutMonkeys = withoutMonkeys(state.get());
  return jsesc(JSON.stringify(stateWithoutMonkeys));
}

// Removes the baobab "monkeys" from the state.
export function withoutMonkeys(object) {
  return Object.keys(object).reduce((acc, key) => {
    if (key[0] === '$') {
      return acc;
    }
    if (!object[key] || typeof object[key] !== 'object' || Array.isArray(object[key])) {
      return {
        ...acc,
        [key]: object[key],
      };
    }
    return {
      ...acc,
      [key]: withoutMonkeys(object[key]),
    };
  }, {});
}
