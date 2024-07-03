export default function clearPathHistory({ state }) {
  state.set(['browsingHistory'], []);
}
