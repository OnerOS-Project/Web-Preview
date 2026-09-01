import React from 'react';
import type { DesktopRuntimeProps } from './desktop.types';
import { BackgroundLayer } from './layers';
import { WindowManager } from '../windowManager';
import { SystemSurfaceLayer } from './layers';
import { Taskbar } from '../system/surfaces';

const DesktopRuntime: React.FC<DesktopRuntimeProps> = ({ children, isBooted = true }) => {

  if (!isBooted) {
    return null;
  }

  return (
    <div
      className="os-desktop-runtime"
      style={{ background: '#181818', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <WindowManager>
        {({ windows, focusedWindowId, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow, updateWindow }) => (
          <>
            <BackgroundLayer />

            <SystemSurfaceLayer>
              <Taskbar
                windows={windows}
                focusedWindowId={focusedWindowId}
                openWindow={openWindow}
                closeWindow={closeWindow}
                focusWindow={focusWindow}
                minimizeWindow={minimizeWindow}
                restoreWindow={restoreWindow}
                updateWindow={updateWindow}
                position="bottom"
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
