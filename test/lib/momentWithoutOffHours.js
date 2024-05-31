import { assert } from 'chai';
import momentWithAustinTimezone from '#common/util/momentWithAustinTimezone.js';
import momentWithoutOffHours, {
  getReminderDateOffHours,
} from 'common/util/momentWithoutOffHours';

describe('momentWithoutOffHours', () => {
  it('without cutoff and with start should return start', () => {
    // Arrange
    const now = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(8)
      .minute(35)
      .second(21);

    // Act
    const output = momentWithoutOffHours({
      startMoment: now,
    });

    // Assert
    assert.equal(output.toString(), now.toString());
  });

  it('start is before the early cutoff should return morningReminderTime', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(7)
      .minute(59)
      .second(59);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(8)
      .minute(14)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is at the early cutoff should return start', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(8)
      .minute(0)
      .second(0);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(8)
      .minute(0)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is after the early cutoff, but at the same hour should return start', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(8)
      .minute(0)
      .second(1);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(8)
      .minute(0)
      .second(1);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is after the early cutoff should return start', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(9)
      .minute(0)
      .second(1);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(9)
      .minute(0)
      .second(1);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is before the later cutoff should return start', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(21)
      .minute(59)
      .second(59);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(21)
      .minute(59)
      .second(59);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is at the later cutoff should return tomorrow at morningReminderTime', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(22)
      .minute(0)
      .second(0);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(2)
      .hour(8)
      .minute(14)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is after the later cutoff, but at the same hour should return tomorrow at morningReminderTime', () => { // eslint-disable-line max-len
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(22)
      .minute(0)
      .second(1);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(2)
      .hour(8)
      .minute(14)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is after the later cutoff should return tomorrow at morningReminderTime', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(23)
      .minute(0)
      .second(1);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(2)
      .hour(8)
      .minute(14)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is after the later cutoff, later day should return the next day at morningReminderTime', () => {
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(3)
      .hour(23)
      .minute(0)
      .second(1);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(4)
      .hour(8)
      .minute(14)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 8,
      cutoffLateHour: 22,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  it('start is before early cutoff, but after the later cutoff (incorrect cutoff) return the next day at morningReminderTime', () => { // eslint-disable-line max-len
    // Arrange
    const start = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(1)
      .hour(11)
      .minute(0)
      .second(1);

    const expected = momentWithAustinTimezone()
      .year(2021)
      .month(12)
      .date(2)
      .hour(8)
      .minute(14)
      .second(0);

    // Act
    const output = momentWithoutOffHours({
      startMoment: start,
      cutoffEarlyHour: 14,
      cutoffLateHour: 7,
      morningReminderTime: {
        hours: 8,
        minutes: 14,
        seconds: 0,
      },
    });

    // Assert
    assert.equal(output.toString(), expected.toString());
  });

  describe('getReminderDateOffHours', () => {
    it('should move reminders to the next day', () => {
      const reminders = getReminderDateOffHours({
        delays: '3h,12h',
        startMoment: momentWithAustinTimezone()
          .year(2022)
          .month(9)
          .date(12)
          .hour(20)
          .minute(30)
          .second(0),
        cutoffEarlyHour: 8,
        cutoffLateHour: 20,
        morningReminderTime: {
          hours: 8,
          minutes: 0,
          seconds: 0,
        },
      });

      const expectedReminders = [
        'October 13, 2022 8:00 AM', // next day 8:00 am
        'October 13, 2022 11:00 AM', // 3 hours later
        'October 14, 2022 8:00 AM', // 12 hours later, 11 pm, then 8 am
      ];

      assert.deepEqual(
        reminders.map((reminder) => reminder.date.format('LLL')),
        expectedReminders,
      );
    });

    it('should keep reminders in the next day', () => {
      const reminders = getReminderDateOffHours({
        delays: '3h,12h',
        startMoment: momentWithAustinTimezone()
          .year(2022)
          .month(9)
          .date(12)
          .hour(9)
          .minute(30)
          .second(0),
        cutoffEarlyHour: 8,
        cutoffLateHour: 20,
        morningReminderTime: {
          hours: 8,
          minutes: 0,
          seconds: 0,
        },
      });

      const expectedReminders = [
        'October 12, 2022 9:30 AM', // same hour
        'October 12, 2022 12:30 PM', // 3 hours later
        'October 13, 2022 8:00 AM', // 12 hours later, 12:30 am, then 8 am
      ];

      assert.deepEqual(
        reminders.map((reminder) => reminder.date.format('LLL')),
        expectedReminders,
      );
    });
  });
});
