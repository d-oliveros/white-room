export default function setShouldRestoreScrollPosition({ state }) {
  state.set(['scrollPositions', 'shouldRestoreScrollPosition'], true);
}
