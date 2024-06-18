import typeCheck from '#common/util/typeCheck.js';

export default function replace({ navigate }, { to } = {}) {
  typeCheck('to::NonEmptyString', to);
  navigate(to);
}
