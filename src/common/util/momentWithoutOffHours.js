import momentWithAustinTimezone from '#common/util/momentWithAustinTimezone.js';
import durationSettingsToMsArray from '#common/util/durationSettingsToMsArray.js';

export default function momentWithoutOffHours({
  startMoment,
  cutoffEarlyHour,
  cutoffLateHour,
  morningReminderTime,
}) {
  const reminderDate = momentWithAustinTimezone(startMoment);

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
  const firstReminder = momentWithoutOffHours({
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
        date: momentWithoutOffHours({
          startMoment: momentWithAustinTimezone(lastReminder.date).add(delayMs, 'ms'),
          cutoffEarlyHour,
          cutoffLateHour,
          morningReminderTime,
        }),
      },
    ];
  }, [{ date: firstReminder }]);
}
