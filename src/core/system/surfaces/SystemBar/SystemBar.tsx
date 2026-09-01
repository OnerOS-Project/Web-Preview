import React from 'react';
import type { ScreenEdge } from '../../layout';

export interface SystemBarProps {
  edge?: ScreenEdge;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface SystemBarSlotProps {
  children?: React.ReactNode;
  className?: string;
}

const SystemBarLeft: React.FC<SystemBarSlotProps> = ({ children, className = '' }) => (
  <div className={`system-bar-slot system-bar-left ${className}`} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
    {children}
  </div>
);

const SystemBarCenter: React.FC<SystemBarSlotProps> = ({ children, className = '' }) => (
  <div className={`system-bar-slot system-bar-center ${className}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
    {children}
  </div>
);

const SystemBarRight: React.FC<SystemBarSlotProps> = ({ children, className = '' }) => (
  <div className={`system-bar-slot system-bar-right ${className}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
    {children}
  </div>
);

const SystemBarBase: React.FC<SystemBarProps> = ({ edge = 'top', children, className = '', style }) => {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: edge === 'top' || edge === 'bottom' ? '100%' : 'auto',
    height: edge === 'left' || edge === 'right' ? '100%' : 'auto',
    ...style,
  };

  return (
    <div
      className={`system-bar system-bar-${edge} ${className}`}
      data-edge={edge}
      style={baseStyles}
    >
      {children}
    </div>
  );
};

// Attach slot components as static properties
const SystemBar = Object.assign(SystemBarBase, {
  Left: SystemBarLeft,
  Center: SystemBarCenter,
  Right: SystemBarRight,
});

export { SystemBarLeft, SystemBarCenter, SystemBarRight };
export default SystemBar;
