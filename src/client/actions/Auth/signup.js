import { browserHistory } from 'react-router';
import { extend } from 'lodash';
import { Auth as AuthAPI } from 'src/server/api';
import { analytics, http } from 'src/client/lib';
import { anonymousUser } from 'src/client/constants';
import socketClient from 'src/client/websockets/client';

export default async function signup(state, params) {

  // creates the new user
  const { user, token } = await AuthAPI.signup(params);

  // set the new user as the current user in the state
  state.set('currentUser', extend({}, anonymousUser, user));
  state.commit();

  http.setToken(token);
  socketClient.socket.emit('userLogin', token);

  global.scroll(0, 0);
  browserHistory.push(`/user/${user.path}`);

  analytics.identify(user);
  analytics.track('Signup');

  return user;
}
