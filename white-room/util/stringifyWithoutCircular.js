export default function stringifyWithoutCircular(value) {
  const cache = [];
  const stringified = JSON.stringify(value, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      cache.push(value);
    }
    return value;
  });
  return stringified;
}
