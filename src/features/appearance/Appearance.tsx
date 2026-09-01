import React from 'react';

export interface AppearanceProps {
  settings?: any;
  onUpdate?: (settings: any) => void;
}

const Appearance: React.FC<AppearanceProps> = ({ settings, onUpdate }) => {
  return (
    <div className="os-appearance">
      <h3>Appearance Settings</h3>
      <p>Wallpaper and theme settings will be managed here.</p>
    </div>
  );
};

export default Appearance;
