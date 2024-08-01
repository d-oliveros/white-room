import dayjsWithDefaultTimezone from '#white-room/util/dayjsWithDefaultTimezone.js';

const nextMorningMomentSet = {
  hour: 12,
  minute: 11,
  second: 0,
};

export default function nextMorningAutotextDelay() {
  const currentDate = dayjsWithDefaultTimezone();
  const nextDate = dayjsWithDefaultTimezone().set(nextMorningMomentSet).add(1, 'days');
  return nextDate.diff(currentDate);
}
