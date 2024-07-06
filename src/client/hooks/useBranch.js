import { useContext, useState, useEffect } from 'react';
import StateContext from '#white-room/client/contexts/StateContext.js';

export default function useBranch(mapping) {
  if (typeof mapping === 'string') {
    mapping = [mapping];
  }
  let isSingleBranch = Array.isArray(mapping);

  if (isSingleBranch) {
    mapping = { [mapping[mapping.length - 1]]: mapping };
  }

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

  return isSingleBranch
    ? cursorState[Object.keys(mapping)[0]]
    : cursorState;
}
