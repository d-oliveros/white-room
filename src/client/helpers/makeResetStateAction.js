const makeResetStateAction = (initialState) => {
  return ({ state }) => {
    state.set({
      ...state.get(),
      ...initialState,
    });
  }
}

export default makeResetStateAction;
