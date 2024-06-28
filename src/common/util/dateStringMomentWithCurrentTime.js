import dayjs from 'dayjs';
import extractDateParts from '#common/util/extractDateParts.js';

export default function dateStringMomentWithCurrentTime(dateString) {
  const dateParts = extractDateParts(dateString);
  if (!dateParts) {
    return null;
  }
  const dateMoment = dayjs()
    .year(dateParts.year)
    .month(dateParts.month - 1)
    .date(dateParts.day);

  return dateMoment;
}
