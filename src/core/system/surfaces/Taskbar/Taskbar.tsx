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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [, setThemeMode] = useState(0);
  const menuButtonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPersonalizationSettings = () => {
      const wallpaperType = localStorage.getItem('os_wallpaper_type');
      const wallpaperColor = localStorage.getItem('os_wallpaper_color');
      const accentColor = localStorage.getItem('os_accent_color');

      const background = document.getElementById('os-background');
      if (background) {
        if (wallpaperType === 'color' && wallpaperColor) {
          background.style.backgroundImage = 'none';
          background.style.backgroundColor = wallpaperColor;
        }
      }

      if (accentColor) {
        // Set the CSS custom property — all apps use var(--color-accent)
        document.documentElement.style.setProperty('--color-accent', accentColor);

        // Legacy overrides for window chrome and taskbar (not yet using CSS vars)
        const style = document.createElement('style');
        style.id = 'custom-accent-style';
        style.innerHTML = `
          .window.active .border-window { border-color: ${accentColor} !important; }
          .window.active .draggable-window { background-color: ${accentColor} !important; }
          .menu-square { background-color: ${accentColor} !important; }
          #os-taskbar { border-top-color: ${accentColor} !important; }
          .apps .search-bar input { border-color: ${accentColor} !important; }
          .apps .search-bar input:focus { border-color: ${accentColor} !important; }
        `;
        document.head.appendChild(style);
      }
    };

    loadPersonalizationSettings();
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
      const nextMode = (prev + 1) % 6;
      const taskbar = document.getElementById('os-taskbar');
      const body = document.body;
      if (taskbar && body) {
        taskbar.classList.remove('center', 'win95-theme', 'winxp-theme', 'macos-theme', 'ubuntu-theme');
        body.classList.remove('win95-mode', 'winxp-mode', 'macos-mode', 'ubuntu-mode');
        switch(nextMode) {
          case 0: setIsCentered(false); body.style.cursor = 'default'; break;
          case 1: setIsCentered(true); taskbar.classList.add('center'); body.style.cursor = 'default'; break;
          case 2: setIsCentered(false); taskbar.classList.add('win95-theme'); body.classList.add('win95-mode'); body.style.cursor = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABNSURBVCiRY/j//z8DGYCFgYRQj5q4cePG/4yMjAwUaWRkZPz//z/jgQMHyNaIyyA8NpLiHKLdMFo1DAY1DA41DA41DA41DA41DA41DBU1AADTTR0xqm6CzAAAAABJRU5ErkJggg=="), auto'; break;
          case 3: setIsCentered(false); taskbar.classList.add('winxp-theme'); body.classList.add('winxp-mode'); body.style.cursor = 'default'; break;
          case 4: setIsCentered(false); taskbar.classList.add('macos-theme'); body.classList.add('macos-mode'); body.style.cursor = 'default'; break;
          case 5: setIsCentered(false); taskbar.classList.add('ubuntu-theme'); body.classList.add('ubuntu-mode'); body.style.cursor = 'default'; break;
        }
      }
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
        className={isCentered ? "center" : ""}
        style={{ display: hiddenByReload ? 'none' : undefined }}
        data-position={position}
      >
        <div className="apps">
          <div
            className="menu"
            ref={menuButtonRef}
            onClick={handleMenuClick}
            onMouseDown={(e) => e.stopPropagation()}
            data-menu-button
            aria-label="Open Start Menu"
          >
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
          </div>
          <div className="taskbar-separator"></div>
          <div className={`search-bar ${showSearchBar ? 'mobile-visible' : ''}`}>
            <input type="text" placeholder="Search favourite app"></input>
          </div>
          <button className="mobile-search-icon" id="mobile-search" onClick={toggleMobileSearch} aria-label="Search Bar">
            <FontAwesomeIcon icon={faSearch} className="app" />
          </button>
          <button id="run-app-switcher" className={showSearchBar ? 'mobile-hidden' : ''} onClick={toggleAppSwitcher} aria-label="Open App Switcher">
            <FontAwesomeIcon icon={faExpand} className="app" />
          </button>
          <button id="run-google" className={showSearchBar ? 'mobile-hidden' : ''} onClick={() => openWindow("google")} aria-label="Open Google">
            <FontAwesomeIcon icon={['fab', 'google']} className="app" />
          </button>
          <button id="run-facebook" className={showSearchBar ? 'mobile-hidden' : ''} onClick={() => openWindow("facebook")} aria-label="Open Facebook">
            <FontAwesomeIcon icon={['fab', 'facebook']} className="app" />
          </button>
          <button id="run-bing" onClick={() => openWindow("bing")} aria-label="Open Bing">
            <FontAwesomeIcon icon={faSearch} className="app" />
          </button>
        </div>
        <Clock className={isCentered ? "right" : ""} position={position} />
        {isStartMenuOpen && 
          <StartMenu 
            onOpenSettings={() => openWindow("settings")}
            onOpenPersonalization={() => openWindow("personalization")}
            onOpenLinuxMode={() => openWindow("linuxmode")}
            onOpenDevZone={() => openWindow("devzone")}
            onOpenWinSync={() => openWindow("winsync")}
            onOpenKDialer={() => openWindow("kdialer")}
            onOpenMPlayer={() => openWindow("mplayer")}
            onOpenToolsApp={() => openWindow("toolsapp")}
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
