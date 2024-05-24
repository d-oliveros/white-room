import assert from 'assert';
import ms from 'ms';

export default async function unsetScreenId({ apiClient, state }) {
  if (
    apiClient.commitHashChangedTimestamp
      && apiClient.commitHashChangedTimestamp
      && (Date.now() - apiClient.commitHashChangedTimestamp) > ms('3m')
      && typeof global.location === 'object'
      && typeof global.location.reload === 'function'
  ) {
    global.location.reload();
    return;
  }
  const screenId = state.get(['analytics', 'screenId']);
  assert(screenId, 'Tried unsetting screen ID, but none was set.');

  if (process.browser) {
    const scrollPosition = global.pageYOffset || global.document.documentElement.scrollTop;
    state.set(['scrollPositions', screenId], scrollPosition);
  }

  state.set(['analytics', 'screenId'], null);
  state.commit();
}
