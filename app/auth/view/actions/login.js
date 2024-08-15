import analytics from '#whiteroom/client/analytics/analytics.js';

import anonymousUser from '#user/constants/anonymousUser.js';

export async function loadUserInState({ state, user, experimentActiveVariants }) {
  const analyticsSessionId = state.get(['client', 'analytics', 'analyticsSessionId']);
  const currentUser = { ...anonymousUser, ...user };

  // Set experiments
  if (experimentActiveVariants) {
    state.set(['analytics', 'experiments', 'activeVariants'], experimentActiveVariants);
  }

  // Set the new user as the current user in the state
  state.set('currentUser', currentUser);

  analytics.alias(user.id, analyticsSessionId);
  analytics.identify(user);
  // analytics.track(ANALYTICS_EVENT_LOGGED_IN);

  return currentUser;
}

export default async function login({ state, apiClient }, { email, password, autoLoginToken }) {
  const { user, experimentActiveVariants, error } = await apiClient.post('auth/login', {
    email,
    password,
    autoLoginToken,
  });

  if (error) {
    throw new Error(error);
  }

  if (user) {
    await loadUserInState({
      state,
      apiClient,
      user,
      experimentActiveVariants,
    });
  }

  return {
    user,
    experimentActiveVariants,
    error,
  };
}
