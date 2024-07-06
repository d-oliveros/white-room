import dayjsWithAustinTimezone from '#white-room/util/dayjsWithAustinTimezone.js';

export default function isLastDayOfMonth() {
  const today = dayjsWithAustinTimezone();
  const tomorrow = dayjsWithAustinTimezone().add(1, 'day');

  return today.month() !== tomorrow.month();
}
