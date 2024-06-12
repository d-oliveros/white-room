import React from 'react';
import { initialApiActionState } from '#api/createApiClient.js';
import typeCheck from '#common/util/typeCheck.js';

import useBranch from '#client/core/branch.jsx';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';

export default function useApiState(getBindingsRaw, opts = {}) {
  typeCheck('getBindings::Object | Function', getBindingsRaw);
  typeCheck('opts::Maybe Object', opts);

  const getBindings = typeof getBindingsRaw === 'function'
    ? getBindingsRaw
    : () => getBindingsRaw;

  return function withApiStateDecorator(ComponentToDecorate) {
    const WithApiState = (props) => {
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

      const branchProps = useBranch(() => bindingsForBranch, props);

      // Default non-existent bound values using the initial app state structure for api calls.
      const bindingProps = bindingNames.reduce((memo, bindingName) => ({
        ...memo,
        [bindingName]: branchProps[bindingName] || initialApiActionState,
      }), {});

      return (
        <ComponentToDecorate {...props} {...bindingProps} />
      );
    };

    configureDecoratedComponent({
      DecoratedComponent: WithApiState,
      OriginalComponent: ComponentToDecorate,
    });

    return WithApiState;
  };
}
