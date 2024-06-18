export default function parseBoolean(value) {
  return value === true || value === 'true' || value === 'True';
}
