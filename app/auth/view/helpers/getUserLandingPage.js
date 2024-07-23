import {
  hasRoleAdmin,
} from '#user/constants/roles.js';

export default function getUserLandingPage(user) {
  let landingPage = '/';

  if (hasRoleAdmin(user?.roles)) {
    landingPage = '/admin';
  }

  return landingPage;
}
