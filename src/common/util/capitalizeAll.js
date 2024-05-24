import capitalize from 'common/util/capitalize';

export default function capitalizeAll(string) {
  if (typeof string !== 'string') {
    return string;
  }
  return string
    .split(' ')
    .map((capitalize))
    .join(' ');
}
