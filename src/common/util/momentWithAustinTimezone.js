import moment from 'moment-timezone';

export default function momentWithAustinTimezone(...args) {
  return moment(...args).tz('America/Chicago');
}
