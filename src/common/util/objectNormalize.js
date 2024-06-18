import { setIn } from 'formik';

export default function objectNormalize(object) {
  let result = {};
  for (const key of Object.keys(object)) {
    result = setIn(result, key, object[key]);
  }
  return result;
}
