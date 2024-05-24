import lodashOmitBy from 'lodash/fp/omitBy';
import lodashIsNil from 'lodash/fp/isNil';

const omitNil = lodashOmitBy(lodashIsNil);

export default function objWithoutNil(obj) {
  if (!obj) {
    return obj;
  }
  return omitNil(obj);
}
