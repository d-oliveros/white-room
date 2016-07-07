import React from 'react';
import { Router, RouterContext } from 'react-router';
import BaobabPropTypes from 'baobab-react/prop-types';

/**
 * Root component.
 * This component provides the application's state in its child context,
 * and renders the main router component.
 */
export default class Root extends React.Component {
  static childContextTypes = {
    tree: BaobabPropTypes.baobab
  };

  getChildContext() {
    return {
      tree: this.props.tree
    };
  }

  render() {
    const { routes, history, componentBranch } = this.props;

    // If a component branch was provided, a router context is rendered
    // instead of a full router instance, useful for server-side rendering
    if (componentBranch) {
      return <RouterContext {...componentBranch}/>;
    }

    return (
      <Router routes={routes} history={history}/>
    );
  }
}
