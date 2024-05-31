import assert from 'assert';

import log from '#client/lib/log.js';

const debug = log.debug('sunroom:Analytics:setScreenId');
const isBrowser = process.browser;

export default function setScreenId({ state }, screenId) {
  assert(screenId, 'Screen ID is required.');
  const currentScreenId = state.get(['analytics', 'screenId']);
  assert(
    !currentScreenId || currentScreenId === screenId,
    'Tried setting a screen ID without unsetting previous screen ID.'
  );

  state.set(['analytics', 'screenId'], screenId);

  if (isBrowser) {
    state.unshift(['analytics', 'screenIdHistory'], screenId);
    state.unshift(['analytics', 'pathHistory'], global.location.pathname + global.location.search);

    // Restore the scroll position if `shouldRestoreScrollPosition` flag is turned on.
    const shouldRestoreScrollPosition = state.get(['scrollPositions', 'shouldRestoreScrollPosition']);
    debug('shouldRestoreScrollPosition', shouldRestoreScrollPosition);
    if (shouldRestoreScrollPosition) {
      state.set(['scrollPositions', 'shouldRestoreScrollPosition'], false);
      const restorableScrollPosition = state.get(['scrollPositions', screenId]);
      debug('restorableScrollPosition', restorableScrollPosition);

      if (!isNaN(restorableScrollPosition)) {
        setTimeout(() => {
          global.scroll(0, restorableScrollPosition);
        }, 100);
      }
    }
  }

  state.commit();
}
