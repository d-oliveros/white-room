export const ROLE_ANONYMOUS = 'anonymous';
export const ROLE_USER = 'user';
export const ROLE_ADMIN = 'admin';

export const ALL_ROLES = [
  ROLE_USER,
  ROLE_ADMIN,
];

export const STAFF_ROLES = [
  ROLE_ADMIN,
];

export const hasRoleAnonymous = (userRoles) => {
  return userRoles.includes(ROLE_ANONYMOUS);
};

export const hasRoleUser = (userRoles) => {
  return userRoles.includes(ROLE_USER);
};

export const hasRoleAdmin = (userRoles) => {
  return userRoles.includes(ROLE_ADMIN);
};

export const hasRoleStaff = (userRoles) => {
  return userRoles.some((userRole) => STAFF_ROLES.includes(userRole));
};
