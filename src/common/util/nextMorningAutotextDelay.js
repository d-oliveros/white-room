import momentWithAustinTimezone from 'common/util/momentWithAustinTimezone';

const nextMorningMomentSet = {
  hour: 12,
  minute: 11,
  second: 0,
};

export default function nextMorningAutotextDelay() {
  const currentDate = momentWithAustinTimezone();
  const nextDate = momentWithAustinTimezone().set(nextMorningMomentSet).add(1, 'days');
  return nextDate.diff(currentDate);
}
