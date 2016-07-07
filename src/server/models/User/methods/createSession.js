import { pick } from 'lodash';
import fieldgroups from '../fieldgroups';

export default function createSession() {
  const fieldgroup = Object.keys(fieldgroups.session);
  return pick(this, ...fieldgroup);
}
