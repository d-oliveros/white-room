export default function setShouldRestoreScrollPosition({ state }) {
  state.set(['client', 'scrollPositions', 'shouldRestoreScrollPosition'], true);
}
