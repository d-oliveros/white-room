export default function undefinedToNull(value) {
  return typeof value === 'undefined' ? null : value;
}
