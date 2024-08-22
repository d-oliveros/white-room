import getNullEmptyValue from '#whiteroom/util/getNullEmptyValue.js';

export default function setNullEmptyValues(values) {
  if (!values) {
    return values;
  }
  const sanitizedValues = {};
  for (const key of Object.keys(values)) {
    sanitizedValues[key] = getNullEmptyValue(values[key]);
  }
  return sanitizedValues;
}
