import {
  isUserAgentIphoneApp,
} from '#white-room/util/isUserAgentMobileApp.js';

import {
  hasRoleAnonymous,
} from '#user/constants/userRoles.js';

export default async function askForPushNotifications({ state }) {
  const currentUser = state.get(['currentUser']);
  const userAgent = state.get(['client', 'analytics', 'userAgent']);
  const askedPushNotificationPermission = state.get(['client', 'mobileApp', 'askedPushNotificationPermission']);

  if (
    !hasRoleAnonymous(currentUser.roles)
    && isUserAgentIphoneApp(userAgent)
    && !askedPushNotificationPermission
  ) {
    state.set(['client', 'mobileApp', 'askPushNotifications'], true);
  }
}
