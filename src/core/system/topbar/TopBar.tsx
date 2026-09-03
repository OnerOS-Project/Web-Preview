import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ScreenEdge } from '../layout';
import { QuickPanel } from '../quickPanels';
import type { SystemPanelId } from '../quickPanels';
import ClockPanel from '../quickPanels/ClockPanel/ClockPanel';
import WeatherPanel from '../quickPanels/WeatherPanel/WeatherPanel';
import SearchPanel from '../search/SearchPanel';
import { WeatherService } from '../weather';
import type { WeatherData, WeatherStatus } from '../weather';

export interface TopBarProps {
  className?: string;
  edge?: ScreenEdge;
  openWindow?: (appId: string) => void;
}

const WeatherSurface: React.FC<{
  onPanelChange: (id: SystemPanelId) => void;
  activePanel: SystemPanelId;
}> = ({ onPanelChange, activePanel }) => {
  const [status, setStatus] = useState<WeatherStatus>('loading');
  const [data, setData] = useState<WeatherData | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const service = new WeatherService(null);
    service.getWeather().then(result => {
      if (result) {
        setData(result);
        setStatus('success');
      } else {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour >= 20;
        setData({
          temperature: isNight ? 18 : 24,
          condition: isNight ? 'Clear' : 'Sunny',
          icon: isNight ? '\u263D' : '\u2600',
          location: 'OnerOS',
        });
        setStatus('success');
      }
    });
  }, []);

  const handleClick = () => {
    onPanelChange(activePanel === 'weather' ? null : 'weather');
  };

  if (status === 'loading') {
    return (
      <div className="fv-weather" aria-label="Weather loading">
        <span className="fv-weather-temp">--{'\u00B0'}</span>
        <span className="fv-weather-label">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="fv-weather fv-weather--trigger"
        aria-label={`Weather: ${data?.condition} ${data?.temperature} degrees. Click for details.`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <span className="fv-weather-icon">{data?.icon || '\u2600'}</span>
        <span className="fv-weather-temp">{data?.temperature}{'\u00B0'}</span>
        <span className="fv-weather-label">{data?.location || 'OnerOS'}</span>
      </div>
      <QuickPanel id="weather" activePanel={activePanel} onOpen={onPanelChange} onClose={() => onPanelChange(null)} triggerRef={triggerRef} align="left">
        <WeatherPanel />
      </QuickPanel>
    </>
  );
};

/**
 * Search surface — opens SearchPanel as a system panel.
 */
const SearchSurface: React.FC<{
  openWindow?: (appId: string) => void;
  onPanelChange: (id: SystemPanelId) => void;
  activePanel: SystemPanelId;
}> = ({ openWindow, onPanelChange, activePanel }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const isSearchOpen = activePanel === 'search';

  const handleClick = () => {
    onPanelChange(isSearchOpen ? null : 'search');
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`fv-search ${isSearchOpen ? 'fv-search--focused' : ''} fv-weather--trigger`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        aria-label="Search OnerOS"
        aria-expanded={isSearchOpen}
      >
        <FontAwesomeIcon icon={require('@fortawesome/free-solid-svg-icons').faSearch} className="fv-search-icon" />
        <span className="fv-search-placeholder">Search OnerOS...</span>
      </div>
      {isSearchOpen && openWindow && (
        <QuickPanel id="search" activePanel={activePanel} onOpen={onPanelChange} onClose={() => onPanelChange(null)} triggerRef={triggerRef} align="center">
          <SearchPanel openWindow={openWindow} onClose={() => onPanelChange(null)} />
        </QuickPanel>
      )}
    </>
  );
};

const TopBar: React.FC<TopBarProps> = ({ className = '', openWindow }) => {
  const [time, setTime] = useState(new Date());
  const [isHidden, setIsHidden] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [activePanel, setActivePanel] = useState<SystemPanelId>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clockTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Ctrl+K to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActivePanel(prev => prev === 'search' ? null : 'search');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const checkWindowCoverage = useCallback(() => {
    let covered = false;
    document.querySelectorAll('.window').forEach((win) => {
      const el = win as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (el.classList.contains('maximized') || (rect.top <= 0 && rect.height > 100)) covered = true;
    });
    return covered;
  }, []);

  // Disable auto-hide on touch/mobile — TopBar always visible
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (isTouchDevice) return;
    const interval = setInterval(() => { if (!isHovering) setIsHidden(checkWindowCoverage()); }, 500);
    return () => clearInterval(interval);
  }, [checkWindowCoverage, isHovering, isTouchDevice]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setIsHidden(false);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    hideTimeoutRef.current = setTimeout(() => setIsHidden(checkWindowCoverage()), 300);
  }, [checkWindowCoverage]);

  useEffect(() => () => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current); }, []);

  const handlePanelChange = useCallback((id: SystemPanelId) => {
    setActivePanel(id);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      {isHidden && <div className="fv-topbar-hover-zone" onMouseEnter={handleMouseEnter} aria-hidden="true" />}

      <div
        id="os-topbar"
        className={`fv-topbar ${isHidden ? 'fv-topbar--hidden' : ''} ${className}`}
        role="banner"
        aria-label="System top bar"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="fv-topbar-left">
          <WeatherSurface onPanelChange={handlePanelChange} activePanel={activePanel} />
        </div>

        <div className="fv-topbar-center">
          <SearchSurface openWindow={openWindow} onPanelChange={handlePanelChange} activePanel={activePanel} />
        </div>

        <div className="fv-topbar-right">
          <div
            ref={clockTriggerRef}
            className="fv-topbar-clock fv-weather--trigger"
            aria-label={`Current time: ${timeStr}. Click for clock details.`}
            onClick={() => handlePanelChange(activePanel === 'clock' ? null : 'clock')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePanelChange(activePanel === 'clock' ? null : 'clock'); }}
          >
            <span className="fv-topbar-time">{timeStr}</span>
            <span className="fv-topbar-date">{dateStr}</span>
          </div>
        </div>
      </div>

      <QuickPanel id="clock" activePanel={activePanel} onOpen={handlePanelChange} onClose={() => setActivePanel(null)} triggerRef={clockTriggerRef} align="right">
        <ClockPanel />
      </QuickPanel>
    </>
  );
};

export default TopBar;
