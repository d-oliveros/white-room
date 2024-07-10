import React, { useState, StrictMode } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import StateContext from '#white-room/client/contexts/StateContext.js';
import ApiClientContext from '#white-room/client/contexts/ApiClientContext.js';
import DispatchContext from '#white-room/client/contexts/DispatchContext.js';
import makeDispatchFn from '#white-room/client/core/makeDispatchFn.js';

const AppContextProvider = ({ store, queryClient, apiClient, children }) => {
  const [dispatch] = useState(() => makeDispatchFn({ state: store, apiClient }));

  return (
    <StrictMode>
      <StateContext.Provider value={store}>
        <ApiClientContext.Provider value={apiClient}>
          <QueryClientProvider client={queryClient}>
            <DispatchContext.Provider value={dispatch}>
              {children}
            </DispatchContext.Provider>
          </QueryClientProvider>
        </ApiClientContext.Provider>
     </StateContext.Provider>
    </StrictMode>
  );
};

AppContextProvider.propTypes = {
  queryClient: PropTypes.object.isRequired,
  apiClient: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default AppContextProvider;
