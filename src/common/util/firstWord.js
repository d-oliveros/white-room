export default function firstWord(string) {
  if (string && typeof string === 'string') {
    return string.split(' ')[0];
  }
  return '';
}
