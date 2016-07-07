import { browserHistory } from 'react-router';
import { Auth as AuthAPI } from 'src/server/api';
import { http, analytics } from 'src/client/lib';
import { anonymousUser } from 'src/client/constants';
import socketClient from 'src/client/websockets/client';

export default async function logout(state) {
  http.setToken(null);
  socketClient.socket.emit('userLogout');

  analytics.track('Logout');
  analytics.logout();

  await AuthAPI.logout();

  state.set('currentUser', anonymousUser);
  state.commit();

  global.scroll(0, 0);
  browserHistory.push('/');
}
