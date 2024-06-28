import dayjs from 'dayjs';

export default function dayjsWithAustinTimezone(...args) {
  return dayjs(...args).tz('America/Chicago');
}
