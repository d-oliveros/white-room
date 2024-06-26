import replaceAction from '#client/actions/Navigator/replace.js';

export default function goBack({ state, navigate }, params = {}) {
  const browsingHistory = state.get(['browsingHistory']);
  const lastPath = browsingHistory[1];
  if (lastPath) {
    state.set(['browsingHistory'], browsingHistory.slice(2));
    navigate(lastPath);
  }
  else if (params.defaultTo) {
    return replaceAction({ state, navigate }, { to: params.defaultTo });
  }
}
