import anonymousUser from '#user/constants/anonymousUser.js';

/**
 * Initial client state.
 */
const initialState = {
  currentUser: { ...anonymousUser },
  users: {
    byId: {},
  },
};

export default initialState;
