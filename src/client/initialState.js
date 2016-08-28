import anonymousUser from './constants/anonymousUser';

export default () => ({
  // session data
  currentUser: { ...anonymousUser },
  sessionId: null,

  // loaded data
  users: [],

  // context flags
  isNewSession: false,
  transitioning: null,

  // other stores
  experiments: {},
  pageMetadata: {}
});
