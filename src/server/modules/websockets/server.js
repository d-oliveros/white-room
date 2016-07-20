import socketio from 'socket.io';
import redis from 'redis';
import invariant from 'invariant';
import { each, extend, invert } from 'lodash';
import { emptyFunction, parseJSON } from 'cd-common';
import redisClient from '../../modules/db/redis';
import { verify } from '../auth/token';
import userSocketsStore from './userSocketsStore';
import handlers from './events';
import eventNames from './constants';

const debug = __log.debug('whiteroom:modules:sockets');

export default {

  /**
   * Initially, these methods will be empty functions.
   * The socket methods will be loaded after calling "listenOn(server)".
   */
  sockets: {
    emit: emptyFunction,
    on:   emptyFunction,
    in:   () => ({ emit: emptyFunction })
  },

  /**
   * Starts a socket server on the provided server.
   * @type   {Function}
   * @param  {http.Server}  server  Server instance to start SocketIO on.
   */
  attachTo(server) {
    debug('Starting the socketIO server.');

    const io = socketio(server, { serveClient: false });
    extend(this, io);

    this.startReceiver();

    io.on('connection', (socket) => {

      // attach the socket handlers to this user's socket
      each(handlers, (handler, eventName) => {
        socket.on(eventName, handler.bind(socket));
      });

      // read the cookies out of the headers
      const headers = socket.handshake.headers;

      // do not run any authentication logic if there are no cookies
      if (!headers.cookie) return;

      const cookies = headers.cookie.split('; ');
      let token;

      // parse the token out of the cookies
      cookies.forEach((cookie) => {
        cookie = cookie.split('=');
        const key = cookie[0];
        const value = cookie[1];
        if (key === 'token') token = value;
      });

      if (token && token.length) {
        this.registerSocketUser(socket, token);
      }
    });
  },

  startReceiver() {
    const { port, host, options } = __config.database.redis;
    const eventMap = invert(eventNames);

    const receiver = redis.createClient(port, host, options);
    receiver.setMaxListeners(0);

    receiver.on('message', (channel, message) => {
      if (!eventMap[channel]) return;

      const json = parseJSON(message);
      debug(`New message ${channel}`);

      if (channel === eventNames.MESSAGE_USER) {
        this.messageUser(json.eventName, json.userId, json.content);
      } else {
        this.sockets.to(json.roomName).emit(channel, json);
      }
    });

    each(eventNames, (eventName) => {
      receiver.subscribe(eventName);
    });
  },

  /**
   * When a socket contains a token, this must be deserialized and stored
   * in the socket object. The socket will also be added to a store belonging
   * to that user in order to send real time events to that specific client
   */
  async registerSocketUser(socket, token) {
    const payload = await verify(token);

    // If socket belongs to user, add the socket to the store
    userSocketsStore[payload._id] = userSocketsStore[payload._id] || [];
    userSocketsStore[payload._id].push(socket);

    // Store user id and roles on the socket
    socket.user = { _id: payload._id, roles: payload.roles };

    // Log activitiy
    debug('A new user socket has connected.');
    debug('Socket user: ', socket.user._id);
  },

  /**
   * Removes a socket from a user socket collection.
   * @param  {Socket} socket The socket to remove
   * @return {undefined}
   */
  removeSocketUser(socket) {
    const user = socket.user;

    if (user && userSocketsStore[user._id]) {
      const sockets = userSocketsStore[user._id];

      for (let i = 0, len = sockets.length; i < len; i++) {
        if (socket === sockets[i]) {
          debug('Removing the socket from the user\'s socket collection');
          sockets.splice(i, 1);
          len--;
          i--;
        }
      }

      if (sockets.length === 0) {
        debug('The socket collection is empty. Removing the collection.');
        delete userSocketsStore[user._id];
      }
    }
  },


  /**
   * Sends a message to a particular user's connected sockets.
   *
   * @type   {Function}
   *
   * @param  {String} eventName The name of the event to emit.
   * @param  {String} userId    The user ID to send the message to.
   * @param  {Mixed}  content   The data to send to the client.
   *
   * @return {Integer}          Number of sockets the message was sent to.
   */
  async messageUser(eventName, userId, content) {
    userId = userId.toString();
    invariant(eventName, 'eventName is required.');
    invariant(typeof userId === 'string', 'userId must be a string.');

    debug(`Sending: ${eventName}`, content, userId);

    const sockets = userSocketsStore[userId] || [];

    for (let i = 0, len = sockets.length; i < len; i++) {
      await sockets[i].emit(eventName, content || undefined);
    }

    return sockets.length;
  },

  async emit(eventName, content) {
    return await redisClient.publishAsync(eventName, JSON.stringify(content));
  }
};
