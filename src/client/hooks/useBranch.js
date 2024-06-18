import { useContext, useState, useEffect } from 'react';
import ReactAppContext from '#client/core/ReactAppContext.js';

export default function useBranch(mapping) {
  const { state } = useContext(ReactAppContext);

  const [cursorState, setCursorState] = useState(() => {
    return state.project(mapping);
  });

  useEffect(() => {
    const watcher = state.watch(mapping);

    watcher.on('update', () => {
      setCursorState(watcher.get());
    });

    return () => watcher.release();
  }, [mapping, state]);

  return cursorState;
}
