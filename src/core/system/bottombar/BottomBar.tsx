import React from 'react';

export interface BottomBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

const BottomBar: React.FC<BottomBarProps> = ({ left, center, right }) => {
  return (
    <div id="os-bottombar" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
    }}>
      <div>{left}</div>
      <div>{center}</div>
      <div>{right}</div>
    </div>
  );
};

export default BottomBar;
