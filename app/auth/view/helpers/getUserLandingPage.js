import {
  hasRoleAdmin,
} from '#user/constants/userRoles.js';

export default function getUserLandingPage(user) {
  let landingPage = '/';

  if (hasRoleAdmin(user?.roles)) {
    landingPage = '/admin';
  }

  return landingPage;
}
