const makeInitialState = (state = {}) => ({
  ...state,
  testingSomeState: {
    setInInitial: true,
  },
});

export default makeInitialState;
