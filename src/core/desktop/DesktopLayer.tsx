import React from 'react';
import type { DesktopLayerProps } from './desktop.types';

const DesktopLayer: React.FC<DesktopLayerProps> = ({ children, zIndex = 0 }) => {
  return (
    <div
      style={{
        position: 'relative',
        zIndex,
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default DesktopLayer;
