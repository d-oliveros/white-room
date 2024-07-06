import useBranch from '#white-room/client/hooks/useBranch.js';
import useDispatch from '#white-room/client/hooks/useDispatch.js';

export default function useCard({ id, defaultExpandedValue = false }) {
  const cardId = `card:${id}`;
  const cardStatePathExpanded = ['cardState', `${cardId}:expanded`];

  const dispatch = useDispatch();
  const branch = useBranch({
    expanded: cardStatePathExpanded,
  });

  const setExpanded = (newExpandedValue) => {
    dispatch(({ state }) => {
      state.set(cardStatePathExpanded, newExpandedValue);
      state.commit();
    });
  };

  return {
    expanded: typeof branch.expanded === 'boolean'
      ? branch.expanded
      : defaultExpandedValue,
    setExpanded: setExpanded,
  };
}
