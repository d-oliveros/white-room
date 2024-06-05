import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import ReactAppContext from '#client/core/ReactAppContext.js';
import App from '#client/App.jsx';
import routes from '#client/routes.js';

const UserAgentContext = createContext();

const Root = ({ apiClient, tree }) => {
  const navigate = useNavigate();

  return (
    <ReactAppContext.Provider
      value={{
        tree,
        apiClient,
        navigate: navigate,
      }}
    >
      <UserAgentContext.Provider value={tree.get(['analytics', 'userAgent'])}>
        <App routes={routes} apiClient={apiClient} />
      </UserAgentContext.Provider>
    </ReactAppContext.Provider>
  );
};

Root.propTypes = {
  apiClient: PropTypes.object.isRequired,
  tree: PropTypes.object.isRequired,
};

export default Root;