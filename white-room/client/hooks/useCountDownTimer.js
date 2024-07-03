import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = HOUR * 24;

function getValues(endDate) {
  const totalSeconds = dayjs(endDate).diff(dayjs(), 'seconds');
  if (totalSeconds > 0) {
    const day = Math.floor(totalSeconds / DAY);
    const hour = Math.floor((totalSeconds - (day * DAY)) / HOUR);
    const minute = Math.floor((totalSeconds - ((hour * HOUR) + (day * DAY))) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { day, hour, minute, seconds };
  }

  return { day: 0, hour: 0, minute: 0, seconds: 0 };
}

function formatTime({ day, hour, minute, seconds }) {
  return `${day < 10 ? '0' : ''}${day > 0 ? (`${day}d `) : ''}` +
    `${hour < 10 ? '0' : ''}${hour}h ` +
    `${minute < 10 ? '0' : ''}${minute}m ` +
    `${seconds < 10 ? '0' : ''}${seconds}s`;
}

export default function useCountDownTimer({ endDate }) {
  const [timerValue, setTimerValue] = useState(getValues(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const totalSeconds = dayjs(endDate).diff(dayjs(), 'seconds');

      if (totalSeconds > 0) {
        setTimerValue(getValues(endDate));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return {
    time: formatTime(timerValue),
  };
}
