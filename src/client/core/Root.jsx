import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import ReactAppContext from '#client/core/ReactAppContext.js';
import makeDispatchFn from '#client/core/makeDispatchFn.js';

import App from '#client/App.jsx';
import routes from '#client/routes.js';

const Root = ({ state, apiClient }) => {
  const navigate = useNavigate();

  const dispatch = useMemo(() => {
    return makeDispatchFn({
      state,
      apiClient,
      navigate,
    });
  }, [state, apiClient, navigate]);

  return (
    <ReactAppContext.Provider
      value={{
        state,
        apiClient,
        navigate,
        dispatch,
      }}
    >
      <App
        routes={routes}
        apiClient={apiClient}
      />
    </ReactAppContext.Provider>
  );
};

Root.propTypes = {
  apiClient: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
};

export default Root;
