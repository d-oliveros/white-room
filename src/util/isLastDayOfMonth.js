import dayjsWithDefaultTimezone from '#white-room/util/dayjsWithDefaultTimezone.js';

export default function isLastDayOfMonth() {
  const today = dayjsWithDefaultTimezone();
  const tomorrow = dayjsWithDefaultTimezone().add(1, 'day');

  return today.month() !== tomorrow.month();
}
