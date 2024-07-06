import anonymousUser from '#user/constants/anonymousUser.js';

/**
 * Makes the initial client state.
 */
export default function initialState() {
  return {
    // Server State
    currentUser: { ...anonymousUser },

    // THIS SECTION REPLACED BY REACT QUERY
    users: {
      byId: {},
    },
  };
}
