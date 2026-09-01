import React from 'react';

export interface SystemSurfaceLayerProps {
  children?: React.ReactNode;
}

/**
 * SystemSurfaceLayer - Container for system UI elements.
 *
 * This layer renders:
 * - Taskbar
 * - Future system bars
 * - Start Menu
 * - Clock
 * - Future widgets
 * - Future notifications
 *
 * The layer itself is transparent and allows pointer events to pass through
 * to lower layers, except where system surfaces are present.
 */
const SystemSurfaceLayer: React.FC<SystemSurfaceLayerProps> = ({ children }) => {
  return (
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
      {children}
    </div>
  );
};

export default SystemSurfaceLayer;
