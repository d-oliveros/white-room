import React, { Component } from 'react';

import { initialApiActionState } from '#api/createApiClient';
import typeCheck from '#common/util/typeCheck.js';

import branch from '#client/core/branch.js';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';

export default function withApiState(getBindingsRaw, opts = {}) {
  typeCheck('getBindings::Object | Function', getBindingsRaw);
  typeCheck('opts::Maybe Object', opts);

  const getBindings = typeof getBindingsRaw === 'function'
    ? getBindingsRaw
    : () => getBindingsRaw;

  return function withApiStateDecorator(ComponentToDecorate) {
    @branch((props) => {
      const bindings = getBindings(props);
      const bindingNames = Object.keys(bindings);
      const bindingsForBranch = bindingNames.reduce((memo, bindingName) => ({
        ...memo,
        [bindingName]: [
          opts.statePath || 'apiState',
          bindings[bindingName].action,
          bindings[bindingName].queryId ? `${bindings[bindingName].queryId}` : 'default',
        ],
      }), {});
      return bindingsForBranch;
    })
    class WithApiState extends Component {
      render() {
        // Default non-existent bound values using the initial app state structure for api calls.
        const bindings = getBindings(this.props);
        const bindingProps = Object.keys(bindings).reduce((memo, bindingName) => ({
          ...memo,
          [bindingName]: this.props[bindingName] || initialApiActionState,
        }), {});

        return (
          <ComponentToDecorate {...this.props} {...bindingProps} />
        );
      }
    }

    configureDecoratedComponent({
      DecoratedComponent: WithApiState,
      OriginalComponent: ComponentToDecorate,
    });

    return WithApiState;
  };
}
