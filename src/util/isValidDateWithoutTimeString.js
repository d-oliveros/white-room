const dateWithoutTimeRegex = /^\d{4}-\d{2}-\d{2}$/;

export default function isValidDateWithoutTimeString(dateString) {
  return dateWithoutTimeRegex.test(dateString);
}
