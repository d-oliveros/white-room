export default function isRedirectResponse(object) {
  return (
    object instanceof Response &&
    [301, 302, 303, 307, 308].includes(object.status)
  );
}
