import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faRectangleList, faImage, faPalette, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { faUbuntu, faWindows, faApple } from '@fortawesome/free-brands-svg-icons';
import {
  THEMES,
  setTheme,
  getStoredThemeId,
  applyAccentColor,
  resetAppearance,
  applyWallpaper,
  persistWallpaper,
  getCurrentAccentColor,
} from '../../core/system/appearance';
import './personalization.css';

const ICON_MAP: Record<number, typeof faDesktop> = {
  0: faDesktop,
  1: faRectangleList,
  2: faWindows,
  3: faWindows,
  4: faApple,
  5: faUbuntu,
  6: faMagicWandSparkles,
};

const ACCENT_PRESETS = [
  { name: 'Green', color: '#47b895' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Orange', color: '#f59e0b' },
  { name: 'Pink', color: '#ec4899' },
];

function Personalization() {
  const [wallpaperType, setWallpaperType] = useState('default');
  const [customColor, setCustomColor] = useState('#1a5743');
  const [accentColor, setAccentColor] = useState('#47b895');
  const [previewWallpaper, setPreviewWallpaper] = useState('');
  const [activeTheme, setActiveTheme] = useState(0);

  useEffect(() => {
    const savedWallpaperType = localStorage.getItem('os_wallpaper_type') || 'default';
    const savedCustomColor = localStorage.getItem('os_wallpaper_color') || '#1a5743';

    setWallpaperType(savedWallpaperType);
    setCustomColor(savedCustomColor);
    setAccentColor(getCurrentAccentColor());

    if (savedWallpaperType === 'color') {
      setPreviewWallpaper(savedCustomColor);
    } else {
      setPreviewWallpaper('default');
    }

    const themeId = getStoredThemeId();
    setActiveTheme(themeId);
  }, []);

  const handleThemeChange = (themeId: number) => {
    setTheme(themeId);
    setActiveTheme(themeId);
  };

  const handleWallpaperTypeChange = (type: string) => {
    setWallpaperType(type);
    setPreviewWallpaper(type === 'default' ? 'default' : customColor);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (wallpaperType === 'color') setPreviewWallpaper(newColor);
  };

  const applyAll = () => {
    const wt = wallpaperType === 'color' ? 'color' : 'default';
    applyWallpaper(wt, customColor);
    persistWallpaper(wt, customColor);
    applyAccentColor(accentColor);
  };

  const resetToDefault = () => {
    resetAppearance();
    setWallpaperType('default');
    setCustomColor('#1a5743');
    setAccentColor('#47b895');
    setPreviewWallpaper('default');
    setActiveTheme(0);
  };

  return (
    <div className="personalization-app">
      <div className="personalization-header">
        <h2>Personalization</h2>
        <p>Customize the appearance of your OnerOS experience</p>
      </div>

      <div className="personalization-content">
        {/* Theme Section */}
        <div className="p-section">
          <div className="p-section-label">
            <FontAwesomeIcon icon={faDesktop} />
            <span>Theme</span>
          </div>
          <div className="p-theme-grid">
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-theme-card${activeTheme === theme.id ? ' active' : ''}`}
              >
                <div className={`p-theme-preview p-theme-${theme.preview}`}>
                  <FontAwesomeIcon icon={ICON_MAP[theme.id] || faDesktop} className="p-theme-icon" />
                </div>
                <div className="p-theme-name">
                  {activeTheme === theme.id && <span className="p-theme-check">✓</span>}
                  {theme.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallpaper Section */}
        <div className="p-section">
          <div className="p-section-label">
            <FontAwesomeIcon icon={faImage} />
            <span>Wallpaper</span>
          </div>
          <div className="p-wallpaper-row">
            <div className="p-wallpaper-options">
              <label className={`p-radio${wallpaperType === 'default' ? ' selected' : ''}`}>
                <input type="radio" name="wallpaper" value="default" checked={wallpaperType === 'default'} onChange={() => handleWallpaperTypeChange('default')} />
                <span>Default</span>
              </label>
              <label className={`p-radio${wallpaperType === 'color' ? ' selected' : ''}`}>
                <input type="radio" name="wallpaper" value="color" checked={wallpaperType === 'color'} onChange={() => handleWallpaperTypeChange('color')} />
                <span>Color</span>
              </label>
              {wallpaperType === 'color' && (
                <div className="p-color-picker-inline">
                  <input type="color" value={customColor} onChange={handleColorChange} />
                  <input type="text" value={customColor} onChange={handleColorChange} className="p-color-hex" />
                </div>
              )}
            </div>
            <div
              className="p-wallpaper-preview"
              style={{
                backgroundColor: previewWallpaper === 'default' ? '#1e1e1e' : previewWallpaper,
                backgroundImage: previewWallpaper === 'default' ? 'url("/public/img/Wallpaper.webp")' : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
        </div>

        {/* Accent Color Section */}
        <div className="p-section">
          <div className="p-section-label">
            <FontAwesomeIcon icon={faPalette} />
            <span>Accent color</span>
          </div>
          <div className="p-accent-row">
            <div className="p-accent-presets">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  className={`p-accent-dot${accentColor === preset.color ? ' active' : ''}`}
                  style={{ '--dot-color': preset.color }}
                  onClick={() => { setAccentColor(preset.color); }}
                  title={preset.name}
                />
              ))}
            </div>
            <div className="p-accent-custom">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
              <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="p-color-hex" />
            </div>
          </div>
          <div className="p-accent-bar" style={{ background: accentColor }} />
        </div>

        {/* Actions */}
        <div className="p-actions">
          <button className="p-btn-primary" onClick={applyAll}>Apply</button>
          <button className="p-btn-secondary" onClick={resetToDefault}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export default Personalization;
