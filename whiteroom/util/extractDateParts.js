export default function extractDateParts(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  const dateStringSplit = dateString.split('-');

  if (dateStringSplit.length !== 3 || dateStringSplit.some((part) => !part || isNaN(part))) {
    return null;
  }

  const dateParts = {
    year: parseInt(dateStringSplit[0], 10),
    month: parseInt(dateStringSplit[1], 10),
    day: parseInt(dateStringSplit[2], 10),
  };

  if (dateParts.year > 9999) {
    return null;
  }

  if (dateParts.month < 1 || dateParts.month > 12) {
    return null;
  }

  if (dateParts.day > 31) {
    return null;
  }

  return dateParts;
}
