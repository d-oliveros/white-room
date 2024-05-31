import { useContext, useState, useEffect } from 'react';

import ReactAppContext from '#client/core/ReactAppContext.js';
import useDispatch from '#client/hooks/useDispatch.js';

export default function useBranch(cursors) {
  const reactAppContext = useContext(ReactAppContext);
  const dispatch = useDispatch();

  const [state, setState] = useState(() => {
    const mapping = typeof cursors === 'function' ? cursors(reactAppContext) : cursors;
    return reactAppContext.tree.project(mapping);
  });

  useEffect(() => {
    const mapping = typeof cursors === 'function' ? cursors(reactAppContext) : cursors;
    const watcher = reactAppContext.tree.watch(mapping);

    watcher.on('update', () => {
      setState(watcher.get());
    });

    return () => watcher.release();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursors]);

  return {
    ...state,
    dispatch,
  };
}
