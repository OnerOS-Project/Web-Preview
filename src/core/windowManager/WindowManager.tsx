import React, { useState, useCallback, useEffect } from 'react';
import type { WindowData, WindowManagerProps } from './windowManager.types';
import { createWindowData } from './windowManager.utils';
import Window from './Window/Window';

const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const [windows, setWindows] = useState<WindowData[]>([]);

  const openWindow = useCallback((appName: string) => {
    const newWindow = createWindowData(appName);
    if (newWindow) {
      setWindows(prev => [...prev, newWindow]);
    }
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    // Future: bring window to front, update z-index
    // For now, this is a no-op that prepares the API
    setWindows(prev =>
      prev.map(w => ({
        ...w,
        isFocused: w.id === id,
      }))
    );
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<WindowData>) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  // Listen for os:app_run events to open windows from terminal/external
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

  // Listen for os:reload events to clear windows
  useEffect(() => {
    const handleOsReloadComplete = () => {
      setWindows([]);
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
        openWindow,
        closeWindow,
        focusWindow,
        updateWindow,
      })}
    </>
  );
};

export default WindowManager;
