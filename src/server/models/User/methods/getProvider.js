import {findWhere} from 'lodash';

export default function getProvider(provider) {
  return findWhere(this.providers || [], { name: provider });
}
