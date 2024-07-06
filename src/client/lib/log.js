import createDebugger from 'debug';
import { stringify } from 'flatted';

import objectDiff from '#white-room/util/objectDiff.js';
import checkLocalStorage from '#white-room/util/checkLocalStorage.js';

const NODE_ENV = process.env.NODE_ENV;

const hasLocalStorage = checkLocalStorage();

const stringifyArgs = (args) => args.map((arg) => {
  if (typeof arg === 'object' && arg) {
    return stringify(arg, null, 2);
  }
  return arg;
});

const log = NODE_ENV === 'production'
  ? {
    _debuggers: {},
    info: (args) => {
      if (process.browser) {
        console.log(args); // eslint-disable-line no-console
      }
    },
    warn: (args) => {
      if (process.browser) {
        console.warn(args); // eslint-disable-line no-console
      }
    },
    error: (error) => {
      if (global.__log) {
        console.error(error);
      }
      if (process.browser) {
        console.error(error); // eslint-disable-line no-console
      }
    },
    diff() { return {}; },
    debug(key) {
      let debug = this._debuggers[key];
      if (!debug) {
        debug = (...args) => {
          if (hasLocalStorage) {
            try {
              const enableDebug = global.localStorage.getItem('enableDebug');
              if (enableDebug === 'true') {
                console.log(...stringifyArgs(args)); // eslint-disable-line no-console
              }
            }
            catch (error) {
              log.error(error);
            }
          }
        };
        this._debuggers[key] = debug;
      }
      return debug;
    },
  }
  : {
    _debuggers: {},
    info: (...args) => {
      if (global.__log) {
        console.info(...args);
      }
      else {
        console.log(...args); // eslint-disable-line no-console
      }
    },
    warn: (...args) => {
      if (global.__log) {
        console.warn(...args);
      }
      else {
        console.warn(...args); // eslint-disable-line no-console
      }
    },
    error: (error) => {
      if (global.__log) {
        console.error(error);
      }
      else {
        console.error(error); // eslint-disable-line no-console
        if (process.browser) {
          console.error(error); // eslint-disable-line no-console
        }
      }
    },
    diff: (obj1, obj2) => objectDiff(obj1, obj2),
    debug(key) {
      let debug = this._debuggers[key];
      if (!debug) {
        // TODO: Expose APP_ID here
        // debug = createDebugger(`${APP_ID}:${key}`);
        debug = createDebugger(`whiteroom:${key}`);
        this._debuggers[key] = debug;
      }
      return (...args) => {
        if (hasLocalStorage && global.localStorage.getItem('enableDebug') === 'true') {
          log.info(...args);
        }
        debug(...args);
      };
    },
  };

export default log;
