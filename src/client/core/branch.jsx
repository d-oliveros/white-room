import React, { Component } from 'react';
import deepEqual from 'deep-equal';

import log from '#client/lib/log.js';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';
import ReactAppContext from '#client/core/ReactAppContext.js';

const debugActions = log.debug('client:actions');

export function solveMapping(mapping, props, context) {
  if (typeof mapping === 'function') {
    mapping = mapping(props, context);
  }

  return mapping;
}

function invalidMapping(name, mapping) {
  throw new Error(
    'Branch: given cursors mapping is invalid (check the "' + name + '" component).', // eslint-disable-line max-len
    { mapping }
  );
}

const wrappedBranchDecorator = (cursors = {}) => (ComponentToDecorate) => {
  class WithBranchDecorator extends Component {
    static contextType = ReactAppContext;

    constructor(props, context) {
      super(props, context);

      // Creating dispatcher
      this.dispatcher = (fn, ...args) => fn(this.context.tree, ...args);

      this._dispatch = (fn, ...args) => {
        if (!fn || typeof fn !== 'function') {
          const error = new Error(
            '[dispatch] Tried dispatching a function, but no function was provided. ' +
            `Dispatched value: ${fn} [${typeof fn}]`
          );
          error.name = 'ClientDispatchMissingFunctionError';
          throw error;
        }

        debugActions(`Dispatching: ${fn.name}`, ...args);

        return fn({
          state: this.context.tree,
          apiClient: this.context.apiClient,
          navigate: this.context.navigate,
        }, ...args);
      };

      if (!Object.keys(cursors)) {
        this.state = {};
        return;
      }

      const mapping = solveMapping(cursors, props, context);
      if (!mapping) {
        invalidMapping(name, mapping);
      }

      // Creating the watcher
      const watcher = this.context.tree.watch(mapping);

      const handler = () => {
        this.setState({
          derived: this.state.watcher.get(),
        });
      };

      watcher.on('update', handler);

      // Hydrating initial state
      this.state = {
        watcher,
        tree: context.tree,
        derived: watcher.get(),
      };
    }

    static getDerivedStateFromProps(props, { watcher, tree, mapping }) {
      if (!Object.keys(cursors)) {
        return;
      }

      const newMapping = solveMapping(cursors, props, { tree });
      if (!newMapping) {
        invalidMapping(name, newMapping);
      }

      if (deepEqual(mapping, newMapping)) {
        return;
      }

      // Refreshing the watcher
      watcher.refresh(newMapping);
      return {
        mapping,
        derived: watcher.get(),
      };
    }

    componentWillUnmount() {
      if (!this.state.watcher) {
        return;
      }

      // Releasing watcher
      this.state.watcher.release();
    }

    render() {
      return (
        <ComponentToDecorate
          {...this.props}
          {...this.state.derived}
          apiClient={this.context.apiClient}
          dispatch={this._dispatch}
        />
      );
    }
  }
  configureDecoratedComponent({
    DecoratedComponent: WithBranchDecorator,
    OriginalComponent: ComponentToDecorate,
  });

  return WithBranchDecorator;
};

export default wrappedBranchDecorator;
