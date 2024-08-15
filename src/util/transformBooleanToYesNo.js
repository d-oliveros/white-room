import transformStringToBoolean from '#whiteroom/util/transformStringToBoolean.js';
import capitalize from '#whiteroom/util/capitalize.js';

const transformBooleanToYesNo = (booleanOrString, shouldCapitalize) => {
  const boolean = transformStringToBoolean(booleanOrString);
  // Avoid converting `null` to `no`.
  if (typeof boolean !== 'boolean') {
    return null;
  }
  let yesNo = boolean ? 'yes' : 'no';

  if (shouldCapitalize) {
    yesNo = capitalize(yesNo);
  }

  return yesNo;
};

export default transformBooleanToYesNo;
