import socketServer from '../server';

const debug = __log.debug('boilerplate:modules:sockets');

export default function onUserLogoutWebsocketHandler() {
  debug('Socket user logout');
  socketServer.removeSocketUser(this);
}
