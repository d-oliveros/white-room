import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import StateContext from '#client/contexts/StateContext.js';
import ApiClientContext from '#client/contexts/ApiClientContext.js';
import DispatchContext from '#client/contexts/DispatchContext.js';

import makeDispatchFn from '#client/core/makeDispatchFn.js';

import App from '#client/App.jsx';
import routes from '#client/routes.js';

const AppContextProvider = ({ state, queryClient, apiClient, children }) => {
  console.log('queryClient', queryClient);
  const [dispatch] = useState(() => makeDispatchFn({ state, apiClient }));

  return (
    <StateContext.Provider value={state}>
      <ApiClientContext.Provider value={apiClient}>
        <QueryClientProvider client={queryClient}>
          <DispatchContext.Provider value={dispatch}>
           {children}
          </DispatchContext.Provider>
        </QueryClientProvider>
      </ApiClientContext.Provider>
   </StateContext.Provider>

  );
};

AppContextProvider.propTypes = {
  queryClient: PropTypes.object.isRequired,
  apiClient: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default AppContextProvider;
