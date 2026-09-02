import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { resolveAppIcon } from '../../apps/iconResolver';
import { searchSystemGrouped } from '../search';
import type { SearchResultGroup } from '../search';

interface SearchPanelProps {
  openWindow: (appId: string) => void;
  onClose: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ openWindow, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const groups = useMemo<SearchResultGroup[]>(() => {
    if (!query.trim()) return [];
    return searchSystemGrouped(query, openWindow);
  }, [query, openWindow]);

  const allResults = useMemo(() => groups.flatMap(g => g.results), [groups]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected result into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const result = allResults[selectedIndex];
      if (result) {
        result.action();
        onClose();
      }
    }
  };

  return (
    <div className="fv-quick-panel fv-search-panel" onKeyDown={handleKeyDown}>
      <div className="fv-search-panel-input-row">
        <FontAwesomeIcon icon={faSearch} className="fv-search-panel-icon" />
        <input
          ref={inputRef}
          type="text"
          className="fv-search-panel-input"
          placeholder="Search OnerOS..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search applications and settings"
        />
      </div>

      <div className="fv-search-panel-results" ref={listRef} role="listbox">
        {!query.trim() ? (
          <div className="fv-search-panel-empty">
            Start typing to search apps and settings
          </div>
        ) : allResults.length === 0 ? (
          <div className="fv-search-panel-empty">
            <div>No results found</div>
            <div className="fv-search-panel-empty-hint">Try searching for an app or setting</div>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.label} className="fv-search-panel-group">
              <div className="fv-search-panel-group-label">{group.label}</div>
              {group.results.map(result => {
                const globalIdx = allResults.indexOf(result);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <div
                    key={result.id}
                    data-index={globalIdx}
                    className={`fv-search-panel-result ${isSelected ? 'fv-search-panel-result--selected' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { result.action(); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <div className="fv-search-panel-result-icon">
                      <FontAwesomeIcon icon={resolveAppIcon(result.icon)} />
                    </div>
                    <div className="fv-search-panel-result-text">
                      <div className="fv-search-panel-result-title">{result.title}</div>
                      {result.subtitle && <div className="fv-search-panel-result-subtitle">{result.subtitle}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
