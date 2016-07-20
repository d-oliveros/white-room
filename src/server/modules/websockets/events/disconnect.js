import socketServer from '../server';

const debug = __log.debug('whiteroom:modules:sockets');

export default function onDisconnectWebsocketHandler() {
  debug('Socket disconnected');
  socketServer.removeSocketUser(this);
}
