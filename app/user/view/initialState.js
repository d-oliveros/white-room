import anonymousUser from '#user/constants/anonymousUser.js';

/**
 * Initial client state.
 */
const initialState = {
  currentUser: { ...anonymousUser },
};

export default initialState;
