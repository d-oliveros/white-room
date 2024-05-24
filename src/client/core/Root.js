import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import ReactAppContext from './ReactAppContext';
import App from '../App';
import routes from '../routes';

/**
 * Root component.
 * This component provides the application's state in its child context,
 * and renders the main router component.
 */
@withRouter
class Root extends React.Component {
  static childContextTypes = {
    userAgent: PropTypes.object,
  };

  static propTypes = {
    apiClient: PropTypes.object.isRequired,
    tree: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      userAgent: this.props.tree.get(['analytics', 'userAgent']),
    };
  }

  render() {
    const {
      apiClient,
      tree,
      history,
    } = this.props;

    return (
      <ReactAppContext.Provider
        value={{
          tree,
          apiClient,
          history,
        }}
      >
        <App
          routes={routes}
          apiClient={apiClient}
        />
      </ReactAppContext.Provider>
    );
  }
}

export default Root;
