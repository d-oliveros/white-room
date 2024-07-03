import ms from 'ms';
import lodashIdentity from 'lodash/fp/identity.js';
import typeCheck from '#common/util/typeCheck.js';

export default function durationSettingsToMsArray(durationSettingsStr) {
  typeCheck('durationSettingsStr::NonEmptyString', durationSettingsStr);
  return durationSettingsStr
    .split(',')
    .map((msSettings) => msSettings.trim())
    .filter(lodashIdentity)
    .map((msSettings) => ms(msSettings));
}
