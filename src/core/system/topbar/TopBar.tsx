import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ScreenEdge } from '../layout';

export interface TopBarProps {
  className?: string;
  edge?: ScreenEdge;
}

/**
 * Lightweight weather surface.
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

  return (
    <div className={`fv-search ${focused ? 'fv-search--focused' : ''}`}>
      <input
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
 * Auto-hide behavior for OnerOS 2026:
 * - Hides when a maximized window covers the top
 * - Shows on mouse hover at the top edge of the screen
 * - Always visible when no window covers the top
 */
const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const [time, setTime] = useState(new Date());
  const [isHidden, setIsHidden] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if any maximized window covers the top area
  const checkWindowCoverage = useCallback(() => {
    const windows = document.querySelectorAll('.window');
    let covered = false;

    windows.forEach((win) => {
      const el = win as HTMLElement;
      const rect = el.getBoundingClientRect();
      const isMaximized = el.classList.contains('maximized');
      const isAtTop = rect.top <= 0 && rect.height > 100;

      if (isMaximized || isAtTop) {
        covered = true;
      }
    });

    return covered;
  }, []);

  // Update hidden state based on window coverage
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setIsHidden(checkWindowCoverage());
      }
    }, 500);

    return () => clearInterval(interval);
  }, [checkWindowCoverage, isHovering]);

  // Mouse enter at top edge → show TopBar
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setIsHidden(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  // Mouse leave → re-check coverage after delay
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    hideTimeoutRef.current = setTimeout(() => {
      setIsHidden(checkWindowCoverage());
    }, 300);
  }, [checkWindowCoverage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div
      id="os-topbar"
      className={`fv-topbar ${isHidden ? 'fv-topbar--hidden' : ''} ${className}`}
      role="banner"
      aria-label="System top bar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
