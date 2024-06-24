import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import StateContext from '#client/contexts/StateContext.js';
import ApiClientContext from '#client/contexts/ApiClientContext.js';
import DispatchContext from '#client/contexts/DispatchContext.js';

import makeDispatchFn from '#client/core/makeDispatchFn.js';

import App from '#client/App.jsx';
import routes from '#client/routes.jsx';

const AppContextProvider = ({ state, apiClient, children }) => {
  const dispatch = useMemo(() => {
    return makeDispatchFn({
      state,
      apiClient,
    });
  }, [state, apiClient]);

  return (
    <StateContext.Provider value={state}>
      <ApiClientContext.Provider value={apiClient}>
        <DispatchContext.Provider value={dispatch}>
         {children}
        </DispatchContext.Provider>
      </ApiClientContext.Provider>
   </StateContext.Provider>

  );
};

AppContextProvider.propTypes = {
  apiClient: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default AppContextProvider;
