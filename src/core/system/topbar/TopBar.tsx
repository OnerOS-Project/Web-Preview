import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ScreenEdge } from '../layout';
import { WeatherService } from '../weather';
import type { WeatherData, WeatherStatus } from '../weather';
import { searchSystem } from '../search';
import { resolveAppIcon } from '../../apps/iconResolver';
import type { SearchResult } from '../search';
import { QuickPanel } from '../quickPanels';
import type { SystemPanelId } from '../quickPanels';
import ClockPanel from '../quickPanels/ClockPanel/ClockPanel';
import WeatherPanel from '../quickPanels/WeatherPanel/WeatherPanel';

export interface TopBarProps {
  className?: string;
  edge?: ScreenEdge;
  openWindow?: (appId: string) => void;
}

/**
 * Weather surface — triggers WeatherPanel.
 */
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
 * Search surface with real app search.
 */
const SearchSurface: React.FC<{ openWindow?: (appId: string) => void }> = ({ openWindow }) => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim() || !openWindow) { setResults([]); return; }
    setResults(searchSystem(query, openWindow));
    setSelectedIndex(0);
  }, [query, openWindow]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setQuery(''); setFocused(false); inputRef.current?.blur(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[selectedIndex]) { e.preventDefault(); results[selectedIndex].action(); setQuery(''); setFocused(false); inputRef.current?.blur(); }
  };

  return (
    <div className={`fv-search ${focused ? 'fv-search--focused' : ''}`}>
      <input ref={inputRef} type="text" className="fv-search-input" placeholder="Search" aria-label="Search" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} onKeyDown={handleKeyDown} />
      {focused && results.length > 0 && (
        <div className="fv-search-results" role="listbox">
          {results.slice(0, 5).map((r, idx) => (
            <div key={r.id} className={`fv-search-result ${idx === selectedIndex ? 'fv-search-result--selected' : ''}`} role="option" aria-selected={idx === selectedIndex} onMouseDown={e => { e.preventDefault(); r.action(); setQuery(''); }} onMouseEnter={() => setSelectedIndex(idx)}>
              <FontAwesomeIcon icon={resolveAppIcon(r.icon)} className="fv-search-result-icon" />
              <div className="fv-search-result-text">
                <div className="fv-search-result-title">{r.title}</div>
                {r.subtitle && <div className="fv-search-result-subtitle">{r.subtitle}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * TopBar — Fluent Valley top system bar.
 */
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

  const checkWindowCoverage = useCallback(() => {
    let covered = false;
    document.querySelectorAll('.window').forEach((win) => {
      const el = win as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (el.classList.contains('maximized') || (rect.top <= 0 && rect.height > 100)) covered = true;
    });
    return covered;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { if (!isHovering) setIsHidden(checkWindowCoverage()); }, 500);
    return () => clearInterval(interval);
  }, [checkWindowCoverage, isHovering]);

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
          <SearchSurface openWindow={openWindow} />
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
