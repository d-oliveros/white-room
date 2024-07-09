import {
  isUserAgentIphoneApp,
} from '#white-room/util/isUserAgentMobileApp.js';
import {
  hasRoleAnonymous,
} from '#user/constants/userRoles.js';

export default function askForReview({ state }) {
  const currentUser = state.get(['currentUser']);
  const userAgent = state.get(['client', 'analytics', 'userAgent']);
  const mobileAppFeatures = state.get(['client', 'mobileApp', 'features']);
  const askedForAppStoreReview = currentUser.settings.askedForAppStoreReview;

  if (
    !hasRoleAnonymous(currentUser.roles)
    && isUserAgentIphoneApp(userAgent)
    && mobileAppFeatures.rateAppV1
    && !askedForAppStoreReview
  ) {
    state.set(['client', 'mobileApp', 'askForReview'], true);
  }
}
