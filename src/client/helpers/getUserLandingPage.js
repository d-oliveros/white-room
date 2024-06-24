import {
  hasRoleAdmin,
} from '#common/userRoles.js';

export default function getUserLandingPage(user) {
  let landingPage = '/';

  if (hasRoleAdmin(user?.roles)) {
    landingPage = '/admin';
  }

  return landingPage;
}
