import {
  isUserAgentIphoneApp,
} from '#common/util/isUserAgentMobileApp.js';

import {
  hasRoleAnonymous,
} from '#common/userRoles.js';

export default async function askForPushNotifications({ state }) {
  const currentUser = state.get(['currentUser']);
  const userAgent = state.get(['analytics', 'userAgent']);
  const askedPushNotificationPermission = state.get(['mobileApp', 'askedPushNotificationPermission']);

  if (
    !hasRoleAnonymous(currentUser.roles)
    && isUserAgentIphoneApp(userAgent)
    && !askedPushNotificationPermission
  ) {
    state.set(['mobileApp', 'askPushNotifications'], true);
  }
}
