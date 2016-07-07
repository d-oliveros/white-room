import socketServer from '../server';

const debug = __log.debug('boilerplate:modules:sockets');

export default function registerUserWebsocketHandler(token) {
  debug(`Registering user token ${token}`);
  socketServer.registerSocketUser(this, token);
}
