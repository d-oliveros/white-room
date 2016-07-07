
export const profile = {
  _id: 1,
  id: 1,
  name: 1,
  path: 1
};

export const session = {
  ...profile,
  email: 1,
  roles: 1,
  logs: 1,
  settings: 1,
  providers: 1
};

export const loggingIn = {
  ...session,
  password: 1
};

export default {
  profile,
  session,
  loggingIn
};
