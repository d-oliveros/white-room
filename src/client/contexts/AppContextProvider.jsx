import React, { StrictMode } from 'react';
import PropTypes from 'prop-types';
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import StateContext from '#white-room/client/contexts/StateContext.js';
import ApiClientContext from '#white-room/client/contexts/ApiClientContext.js';
import DispatchContext from '#white-room/client/contexts/DispatchContext.js';

const AppContextProvider = ({ store, queryClient, apiClient, dispatch, children }) => {
  return (
    <StrictMode>
      <StateContext.Provider value={store}>
        <ApiClientContext.Provider value={apiClient}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
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
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default AppContextProvider;
