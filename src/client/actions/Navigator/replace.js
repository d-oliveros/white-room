import typeCheck from '#common/util/typeCheck.js';

export default function replace({ state, navigate }, { to } = {}) {
  typeCheck('to::NonEmptyString', to);
  const pathHistory = state.get(['analytics', 'pathHistory']);
  const screenIdHistory = state.get(['analytics', 'screenIdHistory']);
  state.set(['analytics', 'pathHistory'], pathHistory.slice(1));
  state.set(['analytics', 'screenIdHistory'], screenIdHistory.slice(1));
  navigate(to);
}
