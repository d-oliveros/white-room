const urlMatcher = /(https?:\/\/)?[\w\-~]+((\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w-]*)?(\?[^\s]*)?)+/gmi; // eslint-disable-line max-len

export default function matchUrls(string) {
  return string.match(urlMatcher);
}
