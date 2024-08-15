import {
  hasRoleAnonymous,
  hasRoleAdmin,
} from '#user/constants/roles.js';

export default function getUserLandingPage(user) {
  const userRoles = user?.roles || [];
  let landingPage = '/';

  if (hasRoleAnonymous(userRoles)) {
    landingPage = '/login';
  }
  if (hasRoleAdmin(userRoles)) {
    landingPage = '/admin';
  }

  return landingPage;
}
