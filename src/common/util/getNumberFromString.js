const numberRegex = /\d*\.?\d*/g;

export default function getNumberFromString(numberStr) {
  if (!numberStr) {
    return null;
  }
  if (typeof numberStr === 'number') {
    return numberStr;
  }
  if (typeof numberStr !== 'string') {
    throw new Error('Number string is not a number or a string.');
  }
  return parseFloat(numberStr.match(numberRegex).join('').trim());
}
