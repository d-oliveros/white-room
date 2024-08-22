export default function objectOmitUndefined(object) {
  try {
    return JSON.parse(JSON.stringify(object));
  }
  catch (e) {} // eslint-disable-line no-empty

  return {};
}
