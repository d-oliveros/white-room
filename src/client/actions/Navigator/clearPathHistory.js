export default function clearPathHistory({ state }) {
  state.set(['client', 'browsingHistory'], []);
}
