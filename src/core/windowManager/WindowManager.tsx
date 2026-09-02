import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { WindowData, WindowLayoutMode, WindowBounds } from './Window/window.types';
import type { WindowManagerProps } from './windowManager.types';
import { createWindowData } from './windowManager.utils';
import { getApp } from '../apps';
import Window from './Window/Window';

function getSnapBounds(mode: WindowLayoutMode): WindowBounds {
  const topBarHeight = document.getElementById('os-topbar') ? 40 : 0;
  const taskbarHeight = 52;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const h = vh - topBarHeight - taskbarHeight;

  switch (mode) {
    case 'left':
      return { left: 0, top: topBarHeight, width: vw / 2, height: h };
    case 'right':
      return { left: vw / 2, top: topBarHeight, width: vw / 2, height: h };
    case 'top-left':
      return { left: 0, top: topBarHeight, width: vw / 2, height: h / 2 };
    case 'top-right':
      return { left: vw / 2, top: topBarHeight, width: vw / 2, height: h / 2 };
    case 'bottom-left':
      return { left: 0, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 };
    case 'bottom-right':
      return { left: vw / 2, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 };
    case 'maximized':
      return { left: 0, top: topBarHeight, width: vw, height: h };
    default:
      return { left: 100, top: 100, width: 520, height: 500 };
  }
}

const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  const focusWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => ({ ...w, isFocused: w.id === id }))
    );
    setFocusedWindowId(id);

    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
    }
  }, []);

  const openWindow = useCallback((appName: string) => {
    const newWindow = createWindowData(appName);
    if (newWindow) {
      if (newWindow.appId) {
        const manifest = getApp(newWindow.appId);
        if (manifest?.singleInstance) {
          const existing = windowsRef.current.find(
            w => w.appId === newWindow.appId && !w.isClosing
          );
          if (existing) {
            if (existing.isMinimized) {
              setWindows(prev =>
                prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w)
              );
            }
            focusWindow(existing.id);
            return;
          }
        }
      }
      setWindows(prev => [...prev, newWindow]);
      focusWindow(newWindow.id);
    }
  }, [focusWindow]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, isClosing: true } : w)
    );
    if (focusedWindowId === id) {
      setFocusedWindowId(null);
    }
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== id));
    }, 120);
  }, [focusedWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, isMinimized: true } : w)
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, isMinimized: false } : w)
    );
    focusWindow(id);
  }, [focusWindow]);

  const updateWindow = useCallback((id: string, updates: Partial<WindowData>) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const snapWindow = useCallback((id: string, mode: WindowLayoutMode) => {
    const el = document.getElementById(id);
    if (!el) return;

    const win = windowsRef.current.find(w => w.id === id);
    if (!win) return;

    const isSnappedAlready = win.layoutMode === mode;

    // Restore to floating — use prevBounds and center if needed
    if (mode === 'floating' && win.layoutMode !== 'floating') {
      let restoreBounds = win.prevBounds;

      if (restoreBounds) {
        // Center if prevBounds is off-screen
        const vw = window.innerWidth;
        const left = Math.max(0, Math.min(restoreBounds.left, vw - restoreBounds.width));
        const top = Math.max(0, Math.min(restoreBounds.top, window.innerHeight - restoreBounds.height));

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.width = `${restoreBounds.width}px`;
        el.style.height = `${restoreBounds.height}px`;
      }

      setWindows(prev =>
        prev.map(w => w.id === id ? { ...w, layoutMode: 'floating', isMaximized: false } : w)
      );
      return;
    }

    if (isSnappedAlready) return;

    // Save current geometry before snap
    const prevBounds: WindowBounds = {
      left: parseFloat(el.style.left) || 0,
      top: parseFloat(el.style.top) || 0,
      width: parseFloat(el.style.width) || win.size.width,
      height: parseFloat(el.style.height) || win.size.height,
    };

    const bounds = getSnapBounds(mode);
    el.style.left = `${bounds.left}px`;
    el.style.top = `${bounds.top}px`;
    el.style.width = `${bounds.width}px`;
    el.style.height = `${bounds.height}px`;

    setWindows(prev =>
      prev.map(w => w.id === id ? {
        ...w,
        layoutMode: mode,
        isMaximized: mode === 'maximized',
        prevBounds,
      } : w)
    );
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    const win = windowsRef.current.find(w => w.id === id);
    if (!win) return;
    if (win.layoutMode === 'maximized') {
      snapWindow(id, 'floating');
    } else {
      snapWindow(id, 'maximized');
    }
  }, [snapWindow]);

  useEffect(() => {
    const handleAppRun = (event: Event) => {
      const customEvent = event as CustomEvent;
      const appName = customEvent.detail?.app;
      if (appName) {
        openWindow(appName);
      }
    };
    window.addEventListener('os:app_run', handleAppRun);
    return () => window.removeEventListener('os:app_run', handleAppRun);
  }, [openWindow]);

  useEffect(() => {
    const handleOsReloadComplete = () => {
      setWindows([]);
      setFocusedWindowId(null);
    };
    window.addEventListener('os:reload_complete', handleOsReloadComplete);
    return () => window.removeEventListener('os:reload_complete', handleOsReloadComplete);
  }, []);

  return (
    <>
      <div id="window-frame">
        {windows.map(win => (
          <Window
            key={win.id}
            windowData={win}
            onClose={closeWindow}
            onFocus={focusWindow}
            onMinimize={minimizeWindow}
            onSnap={snapWindow}
          />
        ))}
      </div>

      {children({
        windows,
        focusedWindowId,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
        updateWindow,
        snapWindow,
        toggleMaximize,
      })}
    </>
  );
};

export default WindowManager;
