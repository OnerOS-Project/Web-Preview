import React, { useState, useRef, useEffect } from 'react';
import type { ScreenEdge } from '../layout';

export interface TopBarProps {
  className?: string;
  edge?: ScreenEdge;
}

/**
 * Lightweight weather surface.
 * Placeholder architecture — no external API dependency.
 */
const WeatherSurface: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const isNight = hour < 6 || hour >= 20;
  const icon = isNight ? '\u263D' : '\u2600';
  const temp = isNight ? '18\u00B0' : '24\u00B0';

  return (
    <div className="fv-weather" aria-label="Weather">
      <span className="fv-weather-icon">{icon}</span>
      <span className="fv-weather-temp">{temp}</span>
      <span className="fv-weather-label">OnerOS</span>
    </div>
  );
};

/**
 * Search surface with Fluent Valley glass styling.
 */
const SearchSurface: React.FC = () => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`fv-search ${focused ? 'fv-search--focused' : ''}`}>
      <input
        ref={inputRef}
        type="text"
        className="fv-search-input"
        placeholder="Search"
        aria-label="Search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

/**
 * TopBar — Fluent Valley top system bar.
 *
 * Layout: Weather | Search | Clock
 * Uses Fluent Valley surface tokens for glass styling.
 */
const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      id="os-topbar"
      className={`fv-topbar ${className}`}
      role="banner"
      aria-label="System top bar"
    >
      <div className="fv-topbar-left">
        <WeatherSurface />
      </div>

      <div className="fv-topbar-center">
        <SearchSurface />
      </div>

      <div className="fv-topbar-right">
        <div className="fv-topbar-clock" aria-label={`Current time: ${timeStr}`}>
          <span className="fv-topbar-time">{timeStr}</span>
          <span className="fv-topbar-date">{dateStr}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
