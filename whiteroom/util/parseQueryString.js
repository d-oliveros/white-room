export default function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString || '');
  const query = {};
  params.forEach((value, key) => {
    query[key] = value;
  });
  return params;
}
