/**
 * Checks if `localStorage` exists in the running environment.
 *
 * @return {boolean} `true` if `localStorage` exists and is valid.
 */
export default function checkLocalStorage() {
  const hasLocalStorage = (
    typeof global.localStorage === 'object'
    && global.localStorage
    && typeof global.localStorage.getItem === 'function'
    && typeof global.localStorage.setItem === 'function'
    && typeof global.localStorage.removeItem === 'function'
    && typeof global.localStorage.clear === 'function'
  );
  return hasLocalStorage;
}
