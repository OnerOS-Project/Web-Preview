import React from 'react';

export interface SystemSurfaceLayerProps {
  children?: React.ReactNode;
}

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
      <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default SystemSurfaceLayer;
