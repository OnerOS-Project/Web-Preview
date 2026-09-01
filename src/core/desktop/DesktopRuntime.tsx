import React, { useEffect, useState } from 'react';
import type { DesktopRuntimeProps } from './desktop.types';
import { DEFAULT_DESKTOP_CONFIG } from './desktop.constants';
import { BackgroundLayer } from './layers';
import { WindowManager } from '../windowManager';
import { Taskbar } from '../system/surfaces';

/**
 * DesktopRuntime - Main orchestrator for the OnerOS desktop environment.
 *
 * This component composes all desktop layers and provides the structure for:
 * - Background (wallpaper, effects)
 * - Windows (via WindowManager)
 * - System surfaces (Taskbar, future bars)
 * - Overlays (dialogs, notifications)
 *
 * The WindowManager remains the single source of truth for window state.
 * DesktopRuntime does NOT own window state - it composes the WindowManager.
 */
const DesktopRuntime: React.FC<DesktopRuntimeProps> = ({ children, config }) => {
  const [isBooted, setIsBooted] = useState(false);
  const mergedConfig = { ...DEFAULT_DESKTOP_CONFIG, ...config };

  // Boot sequence - preserve existing 3-second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooted(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Remove bootloader after boot completes
  useEffect(() => {
    if (isBooted) {
      const loader = document.getElementById('os-loader');
      if (loader) {
        loader.remove();
      }
    } else {
      document.body.classList.remove('margin');
    }
  }, [isBooted]);

  if (!isBooted) {
    return null;
  }

  return (
    <div
      className="os-desktop-runtime"
      style={{ background: '#181818', width: '100%', height: '100%', position: 'relative' }}
    >
      <WindowManager>
        {({ windows, openWindow, closeWindow, focusWindow, updateWindow }) => (
          <>
            {/* Background Layer - wallpaper and background effects */}
            <BackgroundLayer />

            {/* Window Layer - WindowManager renders windows in #window-frame */}
            {/* Note: WindowManager handles window rendering internally */}

            {/* System Surface Layer - Taskbar and other system UI */}
            <div
              id="os-system-surfaces"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 100,
              }}
            >
              <Taskbar
                windows={windows}
                openWindow={openWindow}
                closeWindow={closeWindow}
                focusWindow={focusWindow}
                updateWindow={updateWindow}
                position="bottom"
              />
            </div>

            {/* Render any additional children (e.g., Bootloader) */}
            {children}
          </>
        )}
      </WindowManager>
    </div>
  );
};

export default DesktopRuntime;
