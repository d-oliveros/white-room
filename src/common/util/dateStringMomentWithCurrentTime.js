import moment from 'moment';
import extractDateParts from 'common/util/extractDateParts';

export default function dateStringMomentWithCurrentTime(dateString) {
  const dateParts = extractDateParts(dateString);
  if (!dateParts) {
    return null;
  }
  const dateMoment = moment()
    .year(dateParts.year)
    .month(dateParts.month - 1)
    .date(dateParts.day);

  return dateMoment;
}
