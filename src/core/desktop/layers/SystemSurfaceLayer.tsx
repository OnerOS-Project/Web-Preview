import React from 'react';

export interface SystemSurfaceLayerProps {
  children?: React.ReactNode;
}

/**
 * SystemSurfaceLayer — Container for all system UI surfaces.
 *
 * Renders as a full-viewport overlay that allows pointer events
 * to pass through to lower layers, except where system surfaces
 * are present.
 *
 * Supports both top and bottom system bars via children positioning.
 * The layer itself spans the full viewport to allow future
 * left/right system bar positioning.
 */
const SystemSurfaceLayer: React.FC<SystemSurfaceLayerProps> = ({ children }) => {
  return (
    <div
      id="os-system-surfaces"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default SystemSurfaceLayer;
