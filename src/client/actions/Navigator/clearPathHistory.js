export default function clearPathHistory({ state }) {
  state.set(['analytics', 'pathHistory'], []);
}
