import { useContext, useState, useEffect } from 'react';
import StateContext from '#client/contexts/StateContext.js';

export default function useBranch(mapping) {
  const state = useContext(StateContext);

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
