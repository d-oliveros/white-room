import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const MINUTE = 60;
const HOUR = 60 * MINUTE;

function formatTime({ hour, minute }) {
  return `${hour}h ${minute < 10 ? '0' : ''}${minute}m`;
}

export default function useCountUpTimer({ startDate }) {
  const [timerValue, setTimerValue] = useState({ hour: 0, minute: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const totalSeconds = dayjs().diff(startDate, 'seconds');
      if (totalSeconds > 0) {
        const hour = Math.floor(totalSeconds / HOUR);
        const minute = Math.floor((totalSeconds - (hour * HOUR)) / 60);

        setTimerValue({ hour, minute });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  return {
    time: formatTime(timerValue),
  };
}
