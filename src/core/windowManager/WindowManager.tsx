import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { WindowData } from './Window/window.types';
import type { WindowManagerProps } from './windowManager.types';
import { createWindowData } from './windowManager.utils';
import { getApp } from '../apps';
import Window from './Window/Window';

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

    // Also update DOM-based focus (z-index via .active class)
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
          const existing = windowsRef.current.find(w => w.appId === newWindow.appId);
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
    setWindows(prev => prev.filter(w => w.id !== id));
    if (focusedWindowId === id) {
      setFocusedWindowId(null);
    }
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

  // Listen for os:app_run events
  useEffect(() => {
    const handleAppRun = (event: Event) => {
      const customEvent = event as CustomEvent;
      const appName = customEvent.detail?.app;
      if (appName) {
        console.log(`[OS] Running app: ${appName}`);
        openWindow(appName);
      }
    };

    window.addEventListener('os:app_run', handleAppRun);
    return () => window.removeEventListener('os:app_run', handleAppRun);
  }, [openWindow]);

  // Listen for os:reload events
  useEffect(() => {
    const handleOsReloadComplete = () => {
      setWindows([]);
      setFocusedWindowId(null);
      console.log('[WindowManager] Windows cleared on reload');
    };

    window.addEventListener('os:reload_complete', handleOsReloadComplete);
    return () => window.removeEventListener('os:reload_complete', handleOsReloadComplete);
  }, []);

  return (
    <>
      {/* Render windows in a fixed container */}
      <div id="window-frame">
        {windows.map(win => (
          <Window key={win.id} windowData={win} onClose={closeWindow} />
        ))}
      </div>

      {/* Render children with window state and actions */}
      {children({
        windows,
        focusedWindowId,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        restoreWindow,
        updateWindow,
      })}
    </>
  );
};

export default WindowManager;
