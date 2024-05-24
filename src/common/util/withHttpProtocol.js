/**
 * Will prefix string with http:// if it doesn't already have a protocol
 * @param {String} url URL to prefix
 * @returns {String}
 */
export default function withHttpProtocol(url) {
  if (!url.match(/^[a-zA-Z]+:\/\//)) return 'http://' + url;
  return url;
}
