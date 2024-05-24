import replaceAction from './replace';

export default function goBack({ state, history }, params = {}) {
  const pathHistory = state.get(['analytics', 'pathHistory']);
  const screenIdHistory = state.get(['analytics', 'screenIdHistory']);
  const lastPath = pathHistory[1];
  if (lastPath) {
    state.set(['analytics', 'pathHistory'], pathHistory.slice(2));
    state.set(['analytics', 'screenIdHistory'], screenIdHistory.slice(2));
    history.push(lastPath);
  }
  else if (params.defaultTo) {
    return replaceAction({ state, history }, { to: params.defaultTo });
  }
}
