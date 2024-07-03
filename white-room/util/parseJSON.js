export default function parseJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns 'null', and typeof null === "object",
    // so we must check for that, too.
    if (o && typeof o === 'object' && o !== null) {
      return o;
    }
  }
  catch (e) {} // eslint-disable-line no-empty

  return false;
}
