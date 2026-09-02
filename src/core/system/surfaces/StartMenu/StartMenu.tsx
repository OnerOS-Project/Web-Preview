import React, { useEffect, useRef, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPowerOff,
  faGear,
  faPalette,
  faSearch,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getAllApps } from '../../../apps';
import { resolveAppIcon } from '../../../apps/iconResolver';
import { searchSystem } from '../../search';
import type { SearchResult } from '../../search';

export interface StartMenuProps {
  onOpenSettings: () => void;
  onToggle: (open: boolean) => void;
  alignmentApp: () => void;
  menuButtonRef: React.RefObject<HTMLDivElement>;
  menuLeft?: number;
  onOpenPersonalization: () => void;
  onOpenLinuxMode: () => void;
  onOpenDevZone: () => void;
  onOpenWinSync: () => void;
  onOpenKDialer: () => void;
  onOpenMPlayer: () => void;
  onOpenToolsApp: () => void;
  openWindow: (appId: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({
  onToggle,
  menuButtonRef,
  menuLeft = 8,
  openWindow,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const apps = useMemo(() => getAllApps(), []);

  const searchResults = useMemo<SearchResult[]>(() => {
    return searchSystem(searchQuery, openWindow);
  }, [searchQuery, openWindow]);

  const displayItems = searchQuery.trim()
    ? searchResults
    : apps.map(app => ({
        id: app.id,
        type: 'app' as const,
        title: app.name,
        subtitle: app.description,
        icon: app.icon,
        action: () => openWindow(app.id),
      }));

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);
      const clickedMenuButton =
        (menuButtonRef && menuButtonRef.current && menuButtonRef.current.contains(event.target as Node)) ||
        Boolean(event.target && (event.target as HTMLElement).closest && ((event.target as HTMLElement).closest('.menu') || (event.target as HTMLElement).closest('[data-menu-button]')));

      if (clickedOutsideMenu && !clickedMenuButton) {
        onToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onToggle, menuButtonRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onToggle(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, displayItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = displayItems[selectedIndex];
      if (item) item.action();
    }
  };

  const powerOffOS = () => {
    document.body.innerHTML = "";
    document.body.style.background = "black";
    window.open(window.location.href, "_self")?.close();
  };

  return (
    <div
      id="menu-start"
      className="fv-startmenu"
      ref={menuRef}
      style={{ left: `${menuLeft}px` }}
      onKeyDown={handleKeyDown}
      role="menu"
      aria-label="Start Menu"
    >
      {/* Search */}
      <div className="fv-startmenu-search">
        <FontAwesomeIcon icon={faSearch} className="fv-startmenu-search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          className="fv-startmenu-search-input"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search applications"
        />
        {searchQuery && (
          <button
            className="fv-startmenu-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {/* App list */}
      <div className="fv-startmenu-apps">
        {displayItems.length === 0 ? (
          <div className="fv-startmenu-empty">
            No results found
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const iconDef = resolveAppIcon(item.icon);
            return (
              <button
                key={item.id}
                className={`fv-startmenu-app ${idx === selectedIndex ? 'fv-startmenu-app--selected' : ''}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                role="menuitem"
                aria-label={item.title}
              >
                <div className="fv-startmenu-app-icon">
                  <FontAwesomeIcon icon={iconDef} />
                </div>
                <div className="fv-startmenu-app-info">
                  <div className="fv-startmenu-app-name">{item.title}</div>
                  {item.subtitle && (
                    <div className="fv-startmenu-app-desc">{item.subtitle}</div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="fv-startmenu-footer">
        <button className="fv-startmenu-footer-btn" onClick={() => { openWindow('personalization'); onToggle(false); }} aria-label="Personalization">
          <FontAwesomeIcon icon={faPalette} />
        </button>
        <button className="fv-startmenu-footer-btn" onClick={() => { openWindow('settings'); onToggle(false); }} aria-label="Settings">
          <FontAwesomeIcon icon={faGear} />
        </button>
        <button className="fv-startmenu-footer-btn" onClick={powerOffOS} aria-label="Power off">
          <FontAwesomeIcon icon={faPowerOff} />
        </button>
      </div>
    </div>
  );
};

export default StartMenu;
