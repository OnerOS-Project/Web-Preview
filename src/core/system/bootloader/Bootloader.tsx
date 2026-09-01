import React from 'react';

export interface BootloaderProps {}

const Bootloader: React.FC<BootloaderProps> = () => {
  return (
    <div id="os-loader">
      <p>OnerOS</p>
    </div>
  );
};

export default Bootloader;
