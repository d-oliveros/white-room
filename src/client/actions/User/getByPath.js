import assert from 'http-assert';
import { User as UserAPI } from 'src/server/api';

export default async function getByPath(state, userPath) {

  // check if the user is not already loaded
  if (state.exists(['users', { path: userPath }])) {
    return state.get(['users', { path: userPath }]);
  }

  // loads the user using the server's API
  const user = await UserAPI.getByPath(userPath);
  assert(user, 404, `User ${userPath} not found`);

  // add the user to the state
  state.push(['users'], user);
  state.commit();

  return user;
}
