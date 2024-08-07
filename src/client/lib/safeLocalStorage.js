import logger from '#white-room/logger.js';
import checkLocalStorage from '#white-room/util/checkLocalStorage.js';

const hasLocalStorage = checkLocalStorage();
const debug = logger.createDebug('client:safeLocalStorage');

function _safeLocalStorageCall(methodName, ...args) {
  if (!hasLocalStorage) {
    return null;
  }

  let result;

  try {
    result = global.localStorage[methodName](...args);
  }
  catch (error) {
    logger.error(error);
    return null;
  }

  return result;
}

const safeLocalStorage = {
  isEnabled: hasLocalStorage,

  getItem(key) {
    const localStorageItem = _safeLocalStorageCall('getItem', key);
    debug('Getting item', { key, localStorageItem, hasLocalStorage });
    return localStorageItem;
  },
  setItem(key, value) {
    debug('Setting item', { key, value, hasLocalStorage });
    return _safeLocalStorageCall('setItem', key, value);
  },
  removeItem(key) {
    debug('Removing item', { key, hasLocalStorage });
    return _safeLocalStorageCall('removeItem', key);
  },
  clear() {
    debug('Clearing localStorage', { hasLocalStorage });
    return _safeLocalStorageCall('clear');
  },
};

export default safeLocalStorage;
