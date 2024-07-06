import lodashPadStart from 'lodash/padStart.js';
import dayjsWithAustinTimezone from '#white-room/util/dayjsWithAustinTimezone.js';

/**
 * Extracts a date string without time in YYYY-MM-DD format,
 * using the 'America/Chicago' timezone (GMT-5 / GMT-6).
 *
 * @param  {string} dateIsoString The ISO string to extract the date string from.
 * @return {string}               Date string in YYYY-MM-DD format.
 */
export default function extractDateString(dateIsoString) {
  if (!dateIsoString || typeof dateIsoString !== 'string') {
    return null;
  }
  const dateMoment = dayjsWithAustinTimezone(dateIsoString);
  if (!dateMoment.isValid()) {
    return null;
  }
  const year = lodashPadStart(dateMoment.year(), 2, '0');
  const month = lodashPadStart(dateMoment.month() + 1, 2, '0');
  const day = lodashPadStart(dateMoment.date(), 2, '0');

  return `${year}-${month}-${day}`;
}
