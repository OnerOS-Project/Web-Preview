import React from 'react';

export interface WindowLayerProps {
  children?: React.ReactNode;
}

const WindowLayer: React.FC<WindowLayerProps> = ({ children }) => {
  return (
    <div
      id="window-frame"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default WindowLayer;
