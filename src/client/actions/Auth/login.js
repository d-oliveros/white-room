import { browserHistory } from 'react-router';
import { Auth as AuthAPI } from 'src/server/api';
import { analytics } from 'src/client/lib';
import { anonymousUser } from 'src/client/constants';
import socketClient from 'src/client/websockets/client';

export default async function login(state, params) {

  // logs the user in
  const { user, token } = await AuthAPI.login(params);

  // set the new user as the current user in the state
  state.set('currentUser', Object.assign({}, anonymousUser, user));
  state.commit();

  // registers this user with the socket connection
  // so the server knows who this socket belongs to
  socketClient.socket.emit('userLogin', token);

  global.scroll(0, 0);
  browserHistory.push(`/user/${user.path}`);

  analytics.identify(user);
  analytics.track('Login');

  return user;
}
