import replaceAction from '#client/actions/Navigator/replace.js';

export default function goBack({ state, navigate }, params = {}) {
  const pathHistory = state.get(['analytics', 'pathHistory']);
  const lastPath = pathHistory[1];
  if (lastPath) {
    state.set(['analytics', 'pathHistory'], pathHistory.slice(2));
    navigate(lastPath);
  }
  else if (params.defaultTo) {
    return replaceAction({ state, navigate }, { to: params.defaultTo });
  }
}
