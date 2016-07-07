import anonymousUser from './constants/anonymousUser';

export default function initialStateFactory() {
  return {

    // session data
    currentUser: Object.assign({}, anonymousUser),
    sessionId: null,

    // loaded data
    users: [],

    // context flags
    isNewSession: false,
    transitioning: null,

    // other stores
    experiments: {},
    pageMetadata: {}
  };
}
