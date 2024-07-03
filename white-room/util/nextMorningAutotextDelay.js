import dayjsWithAustinTimezone from '#common/util/dayjsWithAustinTimezone.js';

const nextMorningMomentSet = {
  hour: 12,
  minute: 11,
  second: 0,
};

export default function nextMorningAutotextDelay() {
  const currentDate = dayjsWithAustinTimezone();
  const nextDate = dayjsWithAustinTimezone().set(nextMorningMomentSet).add(1, 'days');
  return nextDate.diff(currentDate);
}
