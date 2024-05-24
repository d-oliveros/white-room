import momentWithAustinTimezone from 'common/util/momentWithAustinTimezone';

const availableHours = [
  ['08:15', '19:30'], // Sunday
  ['08:00', '20:00'], // Monday
  ['08:00', '20:00'], // Tuesday
  ['08:00', '20:00'], // Wednesday
  ['08:00', '20:00'], // Thursday
  ['08:00', '20:00'], // Friday
  ['08:15', '19:30'], // Saturday
];
const START_HOUR_INDEX = 0;
const END_HOUR_INDEX = 1;

export default function momentIsLiveChatAvailable() {
  const now = momentWithAustinTimezone();
  const currentDay = now.day();

  return now.isBetween(
    momentWithAustinTimezone(availableHours[currentDay][START_HOUR_INDEX], 'HH:mm'),
    momentWithAustinTimezone(availableHours[currentDay][END_HOUR_INDEX], 'HH:mm')
  );
}
