import React from 'react';
import type { DesktopRuntimeProps } from './desktop.types';
import { DEFAULT_DESKTOP_CONFIG } from './desktop.constants';
import { BackgroundLayer } from './layers';
import { WindowManager } from '../windowManager';
import { SystemSurfaceLayer } from './layers';
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
 *
 * Boot sequence is handled by the parent (app.js) via the bootloader.
 * DesktopRuntime receives isBooted state and renders accordingly.
 */
const DesktopRuntime: React.FC<DesktopRuntimeProps> = ({ children, config, isBooted = true }) => {
  const _mergedConfig = { ...DEFAULT_DESKTOP_CONFIG, ...config };

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
            <SystemSurfaceLayer>
              <Taskbar
                windows={windows}
                openWindow={openWindow}
                closeWindow={closeWindow}
                focusWindow={focusWindow}
                updateWindow={updateWindow}
                position="bottom"
              />
            </SystemSurfaceLayer>

            {/* Render any additional children (e.g., Bootloader) */}
            {children}
          </>
        )}
      </WindowManager>
    </div>
  );
};

export default DesktopRuntime;
