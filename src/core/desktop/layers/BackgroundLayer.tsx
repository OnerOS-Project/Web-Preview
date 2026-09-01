import React from 'react';

export interface BackgroundLayerProps {
  children?: React.ReactNode;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ children }) => {
  return (
    <div
      id="os-background"
      tabIndex={0}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundLayer;
