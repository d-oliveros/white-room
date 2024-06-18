const isoDateStringRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export default function isIsoDateString(value) {
  if (!value) {
    return false;
  }
  return isoDateStringRegex.test(value);
}
