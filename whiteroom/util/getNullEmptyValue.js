export default function getNullEmptyValue(value, nullValue = null) {
  if (
    !value
    && typeof value !== 'boolean'
    && (
      typeof value !== 'number'
      || isNaN(value)
    )
  ) {
    return nullValue;
  }
  return value;
}
