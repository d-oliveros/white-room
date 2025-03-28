export function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  let result = baseUrl + path;
  if (result.endsWith('/')) {
    result = result.slice(0, -1);
  }
  return result;
}
