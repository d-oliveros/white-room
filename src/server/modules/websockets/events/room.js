const debug = __log.debug('whiteroom:modules:sockets');

export default function onRoomWebsocketHandler(roomName) {
  debug(`Socket room: ${roomName}`);
  this.join(roomName);
}
