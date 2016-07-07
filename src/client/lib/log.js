import createDebugger from 'debug';
import objectDiff from 'objectdiff';
import { emptyFunction } from 'cd-common';
import { isObject, isArray } from 'lodash';
import serializeError from 'serialize-error';
import http from './http';

let log = {
  _debuggers: [],
  info: ::console.info,
  warn: ::console.warn,
  error: (err, tags = []) => {
    console.log(err);
    const stack = err.stack || 'No error message';
    const args = isArray(tags) && tags.length ? [stack, tags] : [stack];
    console.error.apply(console, args);
    logToServer(err, tags);
  },
  diff: (obj1, obj2) => sanitizeDiff(objectDiff.diff(obj1, obj2)),
  debug(key) {
    let debug = this._debuggers[key];
    if (!debug) {
      debug = createDebugger(key);
      this._debuggers.push({ key, debug });
    }
    return debug;
  }
};

if (process.env.NODE_ENV === 'production') {
  log = {
    _debuggers: [],
    info: emptyFunction,
    error: logToServer,
    warn: emptyFunction,
    diff() { return {}; },
    debug: () => emptyFunction
  };
}

function logToServer(err, tags) {
  if (process.browser) {
    const toSend = { err: serializeError(err) };

    if (isArray(tags)) {
      toSend.tags = tags;
    }

    http.post('/log-client-error', toSend)
      .catch((err) => {
        console.error(
          'Error while trying to log error', err,
          'tried to send:', err, tags);
      });
  }
}

function sanitizeDiff(diff) {
  if (!diff || diff.changed === 'equal') return diff;

  const value = diff.value;

  if (isObject(value)) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (!value[key]) continue;
        if (value[key].changed === 'equal') {
          delete value[key];
        } else if (isObject(value[key].value)) {
          sanitizeDiff(value[key]);
          if (value[key].changed === 'object change') {
            value[key] = value[key].value;
          }
        }
      }
    }
  }

  return diff;
}

export default log;
