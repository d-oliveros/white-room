import socketio from 'socket.io-client';
import { each } from 'lodash';
import { emptyFunction } from 'cd-common';
import { log } from '../lib';
import events from './events';

const debug = log.debug('websockets');

export default {
  rooms: [],

  emit: emptyFunction,
  on: emptyFunction,

  init(state) {
    this.socket = socketio();
    this.emit = this.socket.emit.bind(this.socket);
    this.on = this.socket.on.bind(this.socket);

    each(events, (event, eventName) => {
      this.socket.on(eventName, (...args) => {
        debug(`Got event ${eventName}. Arguments:`, args);
        event(state, ...args);
      });
    });
  },

  enterRoom(name) {
    if (!~this.rooms.indexOf(name)) {
      this.socket.emit('room', name);
      this.rooms.push(name);
    }
  }
};
