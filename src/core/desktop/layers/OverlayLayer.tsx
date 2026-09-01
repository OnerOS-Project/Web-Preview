import React from 'react';

export interface OverlayLayerProps {
  children?: React.ReactNode;
}

const OverlayLayer: React.FC<OverlayLayerProps> = ({ children }) => {
  return (
    <div
      id="os-overlays"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default OverlayLayer;
