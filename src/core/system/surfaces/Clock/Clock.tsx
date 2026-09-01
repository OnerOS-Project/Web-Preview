import React, { useState, useEffect } from 'react';
import type { ScreenEdge } from '../../layout';

export interface ClockProps {
  className?: string;
  position?: ScreenEdge;
}

const Clock: React.FC<ClockProps> = ({ className = '', position = 'bottom' }) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timerID = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timerID);
  }, []);

  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const currentTime = date.toLocaleTimeString([], options);

  return (
    <div id="clock" className={className} data-position={position}>
      <h3>{currentTime}</h3>
    </div>
  );
};

export default Clock;
