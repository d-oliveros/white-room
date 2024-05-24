import momentWithAustinTimezone from 'common/util/momentWithAustinTimezone';

export default function isLastDayOfMonth() {
  const today = momentWithAustinTimezone();
  const tomorrow = momentWithAustinTimezone().add(1, 'day');

  return today.month() !== tomorrow.month();
}
