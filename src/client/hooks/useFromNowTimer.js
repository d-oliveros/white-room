import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import lodashCompact from 'lodash/fp/compact.js';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function getTimerValues(fromDate) {
  const secondsTotal = dayjs().diff(dayjs(fromDate), 'seconds');
  if (secondsTotal > 0) {
    const day = Math.floor(secondsTotal / DAY);
    const hour = Math.floor((secondsTotal - (day * DAY)) / HOUR);
    const minute = Math.floor((secondsTotal - (day * DAY) - (hour * HOUR)) / 60);
    const seconds = Math.floor(secondsTotal % 60);
    return { day, hour, minute, seconds, secondsTotal };
  }

  return { day: 0, hour: 0, minute: 0, seconds: 0, secondsTotal };
}

export function formatTime({ day, hour, minute, seconds }) {
  return lodashCompact([
    (day ? `${day}d` : ''),
    `${hour}h`,
    `${minute < 10 ? '0' : ''}${minute}m`,
    `${seconds < 10 ? '0' : ''}${seconds}s`,
  ]).join(' ');
}

export default function useFromNowTimer({ fromDate }) {
  const [timerValue, setTimerValue] = useState(getTimerValues(fromDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const secondsTotal = dayjs().diff(dayjs(fromDate), 'seconds');

      if (secondsTotal > 0) {
        setTimerValue(getTimerValues(fromDate));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fromDate]);

  return {
    ...timerValue,
    timeFormatted: formatTime(timerValue),
  };
}
