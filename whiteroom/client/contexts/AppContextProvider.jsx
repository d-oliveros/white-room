import React, { StrictMode, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { QueryClientProvider } from '@tanstack/react-query';

import StateContext from '#whiteroom/client/contexts/StateContext.js';
import ApiClientContext from '#whiteroom/client/contexts/ApiClientContext.js';
import DispatchContext from '#whiteroom/client/contexts/DispatchContext.js';

const {
  NODE_ENV,
} = process.env;

const AppContextProvider = ({ store, queryClient, apiClient, dispatch, children }) => {
  const [Devtools, setDevtools] = useState(null);

  useEffect(() => {
    if (NODE_ENV === 'development') {
      import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => {
        setDevtools(<ReactQueryDevtools initialIsOpen={false} />);
      });
    }
  }, []);

  return (
    <StrictMode>
      <StateContext.Provider value={store}>
        <ApiClientContext.Provider value={apiClient}>
          <QueryClientProvider client={queryClient}>
            {Devtools}
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
