import dayjsWithDefaultTimezone from '#whiteroom/util/dayjsWithDefaultTimezone.js';

export default function dayjsWithoutOffHours({
  startMoment,
  cutoffEarlyHour,
  cutoffLateHour,
  morningReminderTime,
}) {
  const reminderDate = dayjsWithDefaultTimezone(startMoment);

  if (cutoffEarlyHour && reminderDate.hour() < cutoffEarlyHour) {
    reminderDate.set(morningReminderTime);
  }

  if (cutoffLateHour && reminderDate.hour() >= cutoffLateHour) {
    reminderDate.add(1, 'day').set(morningReminderTime);
  }

  return reminderDate;
}
