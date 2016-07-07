import { findWhere } from 'lodash';

export default function getToken(name) {
  return findWhere(this.tokens || [], { name });
}
