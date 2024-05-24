/**
 * Checks if an `apiState` object is in an "idle" state.
 *
 * @param  {Object} apiState API state object.
 * @return {boolean}
 */
export default function checkIfIdleApiState(apiState) {
  let isIdle = true;
  Object.keys(apiState).forEach((actionType) => {
    Object.keys(apiState[actionType]).forEach((apiStateQueryId) => {
      if (apiState[actionType][apiStateQueryId].inProgress === true) {
        isIdle = false;
      }
    });
  });
  return isIdle;
}
