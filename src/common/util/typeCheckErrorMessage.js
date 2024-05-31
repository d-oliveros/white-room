import typeCheck from '#common/util/typeCheck.js';

export default function typeCheckErrorMessage(...args) {
  try {
    typeCheck(...args);
  }
  catch (error) {
    return error.message;
  }
  return null;
}
