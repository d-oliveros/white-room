import lodashOmitBy from 'lodash/fp/omitBy.js';
import lodashIsNil from 'lodash/fp/isNil.js';

const omitNil = lodashOmitBy(lodashIsNil);

export default function objWithoutNil(obj) {
  if (!obj) {
    return obj;
  }
  return omitNil(obj);
}
