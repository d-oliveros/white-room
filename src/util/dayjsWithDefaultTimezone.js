import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

export default function dayjsWithDefaultTimezone(...args) {
  return dayjs(...args).utcOffset(-6);
}
