import React, { useState, useEffect } from 'react';

const ClockPanel: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dayName = time.toLocaleDateString([], { weekday: 'long' });
  const fullDate = time.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="clock-panel">
      <div className="clock-panel-time">
        <span className="clock-panel-digits">{hours}</span>
        <span className="clock-panel-separator">:</span>
        <span className="clock-panel-digits">{minutes}</span>
        <span className="clock-panel-seconds">:{seconds}</span>
      </div>
      <div className="clock-panel-day">{dayName}</div>
      <div className="clock-panel-date">{fullDate}</div>
    </div>
  );
};

export default ClockPanel;
