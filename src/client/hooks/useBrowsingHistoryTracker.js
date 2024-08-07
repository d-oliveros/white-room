import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import StateContext from '#white-room/client/contexts/StateContext.js';

const useBrowsingHistoryTracker = () => {
  const location = useLocation();
  const state = useContext(StateContext)

  useEffect(() => {
    const browsingHistory = state.get(['client', 'browsingHistory']) || [];

    if (browsingHistory[browsingHistory.length - 1] !== location.pathname) {
      state.set(['browsingHistory'], [ ...browsingHistory, location.pathname ]);
      state.commit();
    }
  }, [location.pathname, state]);
};

export default useBrowsingHistoryTracker;
