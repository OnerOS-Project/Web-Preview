import React, { useState, useEffect } from 'react';
import type { DesktopRuntimeProps } from './desktop.types';
import { BackgroundLayer } from './layers';
import { WindowManager } from '../windowManager';
import { SystemSurfaceLayer } from './layers';
import { Taskbar } from '../system/surfaces';
import TopBar from '../system/topbar/TopBar';
import { getStoredThemeId, getThemeById } from '../system/appearance';

const DesktopRuntime: React.FC<DesktopRuntimeProps> = ({ children, isBooted = true }) => {
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const themeId = getStoredThemeId();
      const theme = getThemeById(themeId);
      setShowTopBar(theme.showTopBar);
    };
    checkTheme();

    const handler = () => checkTheme();
    window.addEventListener('storage', handler);
    const fvHandler = () => checkTheme();
    window.addEventListener('fv:theme-changed', fvHandler as EventListener);

    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('fv:theme-changed', fvHandler as EventListener);
    };
  }, []);

  if (!isBooted) {
    return null;
  }

  return (
    <div
      className="os-desktop-runtime"
      style={{ background: '#181818', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <WindowManager>
        {({ windows, focusedWindowId, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, updateWindow, snapWindow, toggleMaximize }) => (
          <>
            <BackgroundLayer />

            <SystemSurfaceLayer>
              {showTopBar && <TopBar openWindow={openWindow} />}

              <Taskbar
                windows={windows}
                focusedWindowId={focusedWindowId}
                openWindow={openWindow}
                closeWindow={closeWindow}
                focusWindow={focusWindow}
                minimizeWindow={minimizeWindow}
                restoreWindow={restoreWindow}
                updateWindow={updateWindow}
                snapWindow={snapWindow}
                toggleMaximize={toggleMaximize}
                position="bottom"
                showTopBar={showTopBar}
              />
            </SystemSurfaceLayer>

            {children}
          </>
        )}
      </WindowManager>
    </div>
  );
};

export default DesktopRuntime;
