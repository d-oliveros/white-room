
export default function dummyEvent(state, data) {
  console.log(`Dummy websockets event. Server sent: ${data}`);
  console.log('Current state is', state.get());
}
