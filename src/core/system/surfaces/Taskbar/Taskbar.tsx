import React, { useState, useEffect } from 'react';
import { StartMenu } from '../StartMenu';
import { Clock } from '../Clock';
import { AppSwitcher } from '../AppSwitcher';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faSearch } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import type { ScreenEdge } from '../../layout';
import type { WindowData } from '../../../windowManager/Window/window.types';
import { restoreAppearance, setTheme, cycleTheme } from '../../appearance';

library.add(fab, fas);

export interface TaskbarProps {
  windows: WindowData[];
  focusedWindowId?: string | null;
  openWindow: (appId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow?: (id: string) => void;
  restoreWindow?: (id: string) => void;
  updateWindow: (id: string, updates: any) => void;
  position?: ScreenEdge;
}

/**
 * Taskbar — Fluent Valley BottomBar application surface.
 *
 * 3-zone layout:
 *   Left:   Menu button (system launcher)
 *   Center: Application quick-launch icons
 *   Right:  Clock + system controls
 *
 * Preserves all existing functionality:
 * - StartMenu
 * - AppSwitcher
 * - Clock
 * - Theme cycling
 * - Search bar
 * - Boot restoration
 */
const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  focusedWindowId,
  openWindow,
  closeWindow,
  focusWindow,
  minimizeWindow,
  restoreWindow,
  updateWindow,
  position = 'bottom',
}) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [hiddenByReload, setHiddenByReload] = useState(false);
  const [, setShowSearchBar] = useState(false);
  const [, setThemeMode] = useState(0);
  const menuButtonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoredThemeId = restoreAppearance();
    setThemeMode(restoredThemeId);
    if (restoredThemeId === 1) setIsCentered(true);
  }, []);

  useEffect(() => {
    const handleOsReload = () => {
      setIsStartMenuOpen(false);
      setIsAppSwitcherOpen(false);
      setIsCentered(false);
      setHiddenByReload(false);
    };
    window.addEventListener('os:reload_complete', handleOsReload);
    return () => window.removeEventListener('os:reload_complete', handleOsReload);
  }, []);

  useEffect(() => {
    const handleOsReloading = () => setHiddenByReload(true);
    window.addEventListener('os:reload', handleOsReloading);
    return () => window.removeEventListener('os:reload', handleOsReloading);
  }, []);

  useEffect(() => {
    const handleOsOpenMenu = () => {
      setIsStartMenuOpen(true);
      try { menuButtonRef.current?.focus(); } catch (e) {}
    };
    window.addEventListener('os:open_menu', handleOsOpenMenu);
    return () => window.removeEventListener('os:open_menu', handleOsOpenMenu);
  }, []);

  const handleMenuClick = () => setIsStartMenuOpen(prev => !prev);
  const toggleAppSwitcher = () => setIsAppSwitcherOpen(prev => !prev);

  const toggleTaskbarAlignment = () => {
    setThemeMode(prev => {
      const nextMode = cycleTheme(prev);
      setTheme(nextMode);
      setIsCentered(nextMode === 1);
      return nextMode;
    });
  };

  const toggleMobileSearch = () => setShowSearchBar(prev => !prev);

  return (
    <>
      {isAppSwitcherOpen && (
        <AppSwitcher
          isOpen={isAppSwitcherOpen}
          windows={windows}
          focusedWindowId={focusedWindowId}
          focusWindow={focusWindow}
          closeWindow={closeWindow}
          onClose={() => setIsAppSwitcherOpen(false)}
        />
      )}
      <div
        id="os-taskbar"
        className={`fv-taskbar ${isCentered ? "fv-taskbar--centered" : ""}`}
        style={{ display: hiddenByReload ? 'none' : undefined }}
        data-position={position}
        role="toolbar"
        aria-label="Taskbar"
      >
        {/* LEFT ZONE: System launcher */}
        <div className="fv-taskbar-left">
          <div
            className="menu fv-taskbar-menu"
            ref={menuButtonRef}
            onClick={handleMenuClick}
            onMouseDown={(e) => e.stopPropagation()}
            data-menu-button
            role="button"
            aria-label="Open Start Menu"
            aria-expanded={isStartMenuOpen}
            tabIndex={0}
          >
            <div className="fv-taskbar-menu-icon">
              <div className="menu-square fv-taskbar-menu-dot"></div>
              <div className="menu-square fv-taskbar-menu-dot"></div>
              <div className="menu-square fv-taskbar-menu-dot"></div>
              <div className="menu-square fv-taskbar-menu-dot"></div>
            </div>
          </div>
        </div>

        {/* CENTER ZONE: Applications */}
        <div className="apps fv-taskbar-center">
          <div className="fv-taskbar-search-mobile">
            <button
              className="fv-taskbar-mobile-search"
              onClick={toggleMobileSearch}
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          <button
            className="fv-taskbar-app"
            onClick={toggleAppSwitcher}
            aria-label="Open App Switcher"
          >
            <FontAwesomeIcon icon={faExpand} className="app" />
          </button>

          <button
            className="fv-taskbar-app"
            onClick={() => openWindow("google")}
            aria-label="Open Google"
          >
            <FontAwesomeIcon icon={['fab', 'google']} className="app" />
          </button>

          <button
            className="fv-taskbar-app"
            onClick={() => openWindow("facebook")}
            aria-label="Open Facebook"
          >
            <FontAwesomeIcon icon={['fab', 'facebook']} className="app" />
          </button>

          <button
            id="run-bing"
            className="fv-taskbar-app fv-taskbar-app--bing"
            onClick={() => openWindow("bing")}
            aria-label="Open Bing"
          >
            <FontAwesomeIcon icon={faSearch} className="app" />
          </button>
        </div>

        {/* RIGHT ZONE: System controls */}
        <div className="fv-taskbar-right">
          <Clock className="fv-taskbar-clock" position={position} />
        </div>

        {isStartMenuOpen &&
          <StartMenu
            onOpenSettings={() => { openWindow("settings"); setIsStartMenuOpen(false); }}
            onOpenPersonalization={() => { openWindow("personalization"); setIsStartMenuOpen(false); }}
            onOpenLinuxMode={() => { openWindow("linuxmode"); setIsStartMenuOpen(false); }}
            onOpenDevZone={() => { openWindow("devzone"); setIsStartMenuOpen(false); }}
            onOpenWinSync={() => { openWindow("winsync"); setIsStartMenuOpen(false); }}
            onOpenKDialer={() => { openWindow("kdialer"); setIsStartMenuOpen(false); }}
            onOpenMPlayer={() => { openWindow("mplayer"); setIsStartMenuOpen(false); }}
            onOpenToolsApp={() => { openWindow("toolsapp"); setIsStartMenuOpen(false); }}
            onToggle={setIsStartMenuOpen}
            alignmentApp={toggleTaskbarAlignment}
            menuButtonRef={menuButtonRef}
            menuLeft={menuButtonRef.current?.getBoundingClientRect().left ?? 8}
          />
        }
      </div>
    </>
  );
};

export default Taskbar;
