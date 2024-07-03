export const USER_ROLE_ANONYMOUS = 'anonymous';
export const USER_ROLE_USER = 'user';
export const USER_ROLE_ADMIN = 'admin';

export const ALL_USER_ROLES = [
  USER_ROLE_USER,
  USER_ROLE_ADMIN,
];

export const STAFF_USER_ROLES = [
  USER_ROLE_ADMIN,
];

export const hasRoleAnonymous = (userRoles) => {
  return userRoles.includes(USER_ROLE_ANONYMOUS);
};

export const hasRoleUser = (userRoles) => {
  return userRoles.includes(USER_ROLE_USER);
};

export const hasRoleAdmin = (userRoles) => {
  return userRoles.includes(USER_ROLE_ADMIN);
};
