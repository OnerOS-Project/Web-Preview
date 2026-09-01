import React from 'react';

export interface DesktopProps {
  children?: React.ReactNode;
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  return (
    <div id="os-background" tabIndex={0}>
      {children}
    </div>
  );
};

export default Desktop;
