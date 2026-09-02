import React, { useState, useEffect, useRef } from 'react';
import { StartMenu } from '../StartMenu';
import { Clock } from '../Clock';
import { AppSwitcher } from '../AppSwitcher';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import type { ScreenEdge } from '../../layout';
import type { WindowData } from '../../../windowManager/Window/window.types';
import { restoreAppearance, setTheme, cycleTheme } from '../../appearance';
import { getApp } from '../../../apps';
import { resolveAppIcon } from '../../../apps/iconResolver';
import { loadPinnedApps } from '../../preferences/taskbarPreferences';
import NotificationBell from '../Notifications/NotificationBell';

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
  showTopBar?: boolean;
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
  showTopBar = false,
}) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [hiddenByReload, setHiddenByReload] = useState(false);
  const [, setThemeMode] = useState(0);
  const [pinnedApps, setPinnedApps] = useState<string[]>([]);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; appId: string; windowId?: string } | null>(null);
  const [isTaskbarHidden, setIsTaskbarHidden] = useState(false);
  const [isTaskbarHovering, setIsTaskbarHovering] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ctxMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoredThemeId = restoreAppearance();
    setThemeMode(restoredThemeId);
    if (restoredThemeId === 1) setIsCentered(true);
    setPinnedApps(loadPinnedApps());
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

  // Close context menu on outside click
  useEffect(() => {
    if (!ctxMenu) return;
    const handler = (e: MouseEvent) => {
      if (ctxMenuRef.current && !ctxMenuRef.current.contains(e.target as Node)) {
        setCtxMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ctxMenu]);

  // Taskbar auto-hide when maximized windows cover bottom (OnerOS 2026 only)
  useEffect(() => {
    if (showTopBar) return; // Only for OnerOS 2026

    const checkCoverage = () => {
      if (isTaskbarHovering || isStartMenuOpen || isAppSwitcherOpen || ctxMenu) return;
      const wins = document.querySelectorAll('.window.maximized');
      setIsTaskbarHidden(wins.length > 0);
    };

    const interval = setInterval(checkCoverage, 500);
    return () => clearInterval(interval);
  }, [showTopBar, isTaskbarHovering, isStartMenuOpen, isAppSwitcherOpen, ctxMenu]);

  const handleTaskbarMouseEnter = () => {
    setIsTaskbarHovering(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const handleTaskbarMouseLeave = () => {
    setIsTaskbarHovering(false);
    hideTimeoutRef.current = setTimeout(() => {
      if (showTopBar) {
        const wins = document.querySelectorAll('.window.maximized');
        setIsTaskbarHidden(wins.length > 0);
      }
    }, 300);
  };

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
        className={`fv-taskbar ${isCentered ? "fv-taskbar--centered" : ""} ${isTaskbarHidden && !showTopBar ? "fv-taskbar--hidden" : ""}`}
        style={{ display: hiddenByReload ? 'none' : undefined }}
        data-position={position}
        role="toolbar"
        aria-label="Taskbar"
        onMouseEnter={handleTaskbarMouseEnter}
        onMouseLeave={handleTaskbarMouseLeave}
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
          {/* App Switcher button */}
          <button
            className="fv-taskbar-app"
            onClick={toggleAppSwitcher}
            aria-label="Open App Switcher"
          >
            <FontAwesomeIcon icon={faExpand} className="app" />
          </button>

          {/* All taskbar items: pinned (idle) + all window instances, max 20 */}
          {(() => {
            const items: React.ReactNode[] = [];
            const MAX_TASKBAR_ITEMS = 20;

            // 1. Pinned apps with no open windows → idle buttons
            for (const appId of pinnedApps) {
              if (items.length >= MAX_TASKBAR_ITEMS) break;
              const appWins = windows.filter(w => (w.appId || w.id) === appId && !w.isClosing);
              if (appWins.length === 0) {
                const app = getApp(appId);
                const iconDef = resolveAppIcon(app?.icon);
                items.push(
                  <button
                    key={`pinned-${appId}`}
                    className="fv-taskbar-app"
                    onClick={() => openWindow(appId)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setCtxMenu({ x: rect.left, y: rect.top - 10, appId });
                  }}
                  aria-label={app?.name || appId}
                >
                  <FontAwesomeIcon icon={iconDef} className="app" />
                </button>
                );
              }
            }

            // 2. Every open window instance (pinned or not)
            for (const win of windows.filter(w => !w.isClosing)) {
              if (items.length >= MAX_TASKBAR_ITEMS) break;
              const appId = win.appId || win.id;
              const app = getApp(appId);
              const iconDef = resolveAppIcon(win.icon || app?.icon);
              const isFocused = win.id === focusedWindowId;
              const isMinimized = !!win.isMinimized;
              const appName = win.title || app?.name || appId;

              let indicatorClass = '';
              if (isFocused) indicatorClass = 'fv-taskbar-app--focused';
              else if (isMinimized) indicatorClass = 'fv-taskbar-app--minimized';
              else indicatorClass = 'fv-taskbar-app--open';

              items.push(
                <button
                  key={win.id}
                  className={`fv-taskbar-app ${indicatorClass}`}
                  title={appName}
                  onClick={() => {
                    if (isFocused && minimizeWindow) {
                      minimizeWindow(win.id);
                    } else if (isMinimized && restoreWindow) {
                      restoreWindow(win.id);
                      focusWindow(win.id);
                    } else {
                      focusWindow(win.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setCtxMenu({ x: rect.left, y: rect.top - 10, appId, windowId: win.id });
                  }}
                  aria-label={appName}
                  aria-current={isFocused ? 'true' : undefined}
                >
                  <FontAwesomeIcon icon={iconDef} className="app" />
                  <div className="fv-taskbar-indicator" />
                </button>
              );
            }

            return items;
          })()}
        </div>

        {/* RIGHT ZONE: System controls */}
        <div className="fv-taskbar-right">
          <NotificationBell />
          {!showTopBar && <Clock className="fv-taskbar-clock" position={position} />}
        </div>

        {isStartMenuOpen &&
          <StartMenu
            onToggle={setIsStartMenuOpen}
            openWindow={(appId) => { openWindow(appId); setIsStartMenuOpen(false); }}
            alignmentApp={toggleTaskbarAlignment}
            menuButtonRef={menuButtonRef}
            menuLeft={menuButtonRef.current?.getBoundingClientRect().left ?? 8}
            onOpenSettings={() => {}}
            onOpenPersonalization={() => {}}
            onOpenLinuxMode={() => {}}
            onOpenDevZone={() => {}}
            onOpenWinSync={() => {}}
            onOpenKDialer={() => {}}
            onOpenMPlayer={() => {}}
            onOpenToolsApp={() => {}}
          />
        }
      </div>

      {/* Taskbar app context menu */}
      {ctxMenu && (
        <div
          ref={ctxMenuRef}
          className="app-switcher-context-menu"
          style={{ position: 'fixed', left: ctxMenu.x, bottom: '52px', zIndex: 10000 }}
        >
          <div className="context-menu-title">
            <FontAwesomeIcon
              icon={resolveAppIcon(getApp(ctxMenu.appId)?.icon)}
              style={{ marginRight: 8, opacity: 0.7 }}
            />
            {getApp(ctxMenu.appId)?.name || ctxMenu.appId}
          </div>
          <button
            className="context-menu-item"
            onClick={() => { openWindow(ctxMenu.appId); setCtxMenu(null); }}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Open new instance</span>
          </button>
          {ctxMenu.windowId && (
            <button
              className="context-menu-item context-menu-danger"
              onClick={() => { closeWindow(ctxMenu.windowId!); setCtxMenu(null); }}
            >
              <FontAwesomeIcon icon={faXmark} />
              <span>Close app</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Taskbar;
