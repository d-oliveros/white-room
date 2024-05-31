import useBranch from '#client/hooks/useBranch.js';
import isBoolean from '#common/util/isBoolean.js';

export default function useCard({ id, defaultExpandedValue }) {
  const cardId = `card:${id}`;
  const cardStatePathExpanded = ['cardState', `${cardId}:expanded`];

  const branch = useBranch({
    expanded: cardStatePathExpanded,
  });

  const setExpanded = (newExpandedValue) => {
    branch.dispatch(({ state }) => {
      state.set(cardStatePathExpanded, newExpandedValue);
      state.commit();
    });
  };

  return {
    expanded: isBoolean(branch.expanded) ? branch.expanded : (defaultExpandedValue || false),
    setExpanded: setExpanded,
  };
}
