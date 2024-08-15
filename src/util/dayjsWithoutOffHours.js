import dayjsWithDefaultTimezone from '#whiteroom/util/dayjsWithDefaultTimezone.js';
import durationSettingsToMsArray from '#whiteroom/util/durationSettingsToMsArray.js';

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

export function getReminderDateOffHours({
  delays,
  startMoment,
  cutoffEarlyHour,
  cutoffLateHour,
  morningReminderTime,
}) {
  const firstReminder = dayjsWithoutOffHours({
    startMoment,
    cutoffEarlyHour,
    cutoffLateHour,
    morningReminderTime,
  });

  return durationSettingsToMsArray(delays).reduce((reminders, delayMs, index) => {
    const lastReminder = reminders[index];
    return [
      ...reminders,
      {
        date: dayjsWithoutOffHours({
          startMoment: dayjsWithDefaultTimezone(lastReminder.date).add(delayMs, 'ms'),
          cutoffEarlyHour,
          cutoffLateHour,
          morningReminderTime,
        }),
      },
    ];
  }, [{ date: firstReminder }]);
}
