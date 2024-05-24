import {
  isUserAgentIphoneApp,
} from 'common/util/isUserAgentMobileApp';
import {
  hasRoleAnonymous,
} from 'common/userRoles';

export default function askForReview({ state }) {
  const currentUser = state.get(['currentUser']);
  const userAgent = state.get(['analytics', 'userAgent']);
  const mobileAppFeatures = state.get(['mobileApp', 'features']);
  const askedForAppStoreReview = currentUser.settings.askedForAppStoreReview;

  if (
    !hasRoleAnonymous(currentUser.roles)
    && isUserAgentIphoneApp(userAgent)
    && mobileAppFeatures.rateAppV1
    && !askedForAppStoreReview
  ) {
    state.set(['mobileApp', 'askForReview'], true);
  }
}
