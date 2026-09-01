import React from 'react';

export interface TopBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ left, center, right }) => {
  return (
    <div id="os-topbar" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      zIndex: 999,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
    }}>
      <div>{left}</div>
      <div>{center}</div>
      <div>{right}</div>
    </div>
  );
};

export default TopBar;
