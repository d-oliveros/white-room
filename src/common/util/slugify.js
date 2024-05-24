import lodashDeburr from 'lodash/fp/deburr';

export default function slugify(string) {
  if (!string) {
    return '';
  }
  return lodashDeburr(string).trim().replace(/ /g, '-').replace(/\./g, '').toLowerCase();
}
