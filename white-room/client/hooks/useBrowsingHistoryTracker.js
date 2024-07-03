import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

import StateContext from '#client/contexts/StateContext.js';

const useBrowsingHistoryTracker = () => {
  const location = useLocation();
  const state = useContext(StateContext)

  useEffect(() => {
    const browsingHistory = state.get(['browsingHistory']) || [];

    console.log('browsingHistory');
    console.log(browsingHistory);

    if (browsingHistory[browsingHistory.length - 1] !== location.pathname) {
      state.set(['browsingHistory'], [ ...browsingHistory, location.pathname ]);
      state.commit();
    }
  }, [location.pathname, state]);
};

export default useBrowsingHistoryTracker;
