import { useContext } from 'react';

import log from 'client/lib/log';
import ReactAppContext from 'client/core/ReactAppContext';

const debugActions = log.debug('client:actions');

export default function useDispatch() {
  const reactAppContext = useContext(ReactAppContext);

  return (fn, ...args) => {
    debugActions(`Dispatching: ${fn.name}`, ...args);

    return fn({
      state: reactAppContext.tree,
      apiClient: reactAppContext.apiClient,
      history: reactAppContext.history,
    }, ...args);
  };
}
