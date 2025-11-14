import { useEffect, useState } from 'react';
import dayjs from '../lib/dayjs.js';

const formatUnit = (value) => String(value).padStart(2, '0');

const useCountdown = (targetDate) => {
  const [diff, setDiff] = useState(() => (targetDate ? dayjs(targetDate).diff(dayjs()) : 0));

  useEffect(() => {
    if (!targetDate) return undefined;
    const interval = setInterval(() => {
      setDiff(dayjs(targetDate).diff(dayjs()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return {
      formatted: '00:00:00',
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true
    };
  }

  const duration = dayjs.duration(Math.max(diff, 0));
  const hours = duration.hours() + duration.days() * 24;
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return {
    formatted: `${formatUnit(hours)}:${formatUnit(minutes)}:${formatUnit(seconds)}`,
    hours,
    minutes,
    seconds,
    isPast: diff <= 0
  };
};

export default useCountdown;

