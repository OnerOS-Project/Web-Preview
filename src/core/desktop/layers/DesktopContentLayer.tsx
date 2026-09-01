import React from 'react';

export interface DesktopContentLayerProps {
  children?: React.ReactNode;
}

const DesktopContentLayer: React.FC<DesktopContentLayerProps> = ({ children }) => {
  return (
    <div
      id="os-desktop-content"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default DesktopContentLayer;
