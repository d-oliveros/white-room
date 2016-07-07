import {reduce} from 'lodash';

// Transforms a hashed object into an array of objects in the format:
// [ { name: somevar, content: valueOfSomeVar }, ...]
export default function formatEmailVars(vars) {
  return reduce(vars, (memo, value, key) => {
    memo.push({ name: key, content: value });
    return memo;
  }, []);
}
