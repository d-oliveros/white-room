import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import ReactAppContext from '#client/core/ReactAppContext.js';
import App from '#client/App.jsx';
import routes from '#client/routes.js';

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
      <App routes={routes} apiClient={apiClient} />
    </ReactAppContext.Provider>
  );
};

Root.propTypes = {
  apiClient: PropTypes.object.isRequired,
  tree: PropTypes.object.isRequired,
};

export default Root;