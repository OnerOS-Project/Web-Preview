import React, { useState, useEffect } from 'react';
import './personalization.css';

function Personalization() {
  const [wallpaperType, setWallpaperType] = useState('default');
  const [customColor, setCustomColor] = useState('#1a5743');
  const [accentColor, setAccentColor] = useState('#47b895');
  const [previewWallpaper, setPreviewWallpaper] = useState('');

  useEffect(() => {
    const savedWallpaperType = localStorage.getItem('os_wallpaper_type') || 'default';
    const savedCustomColor = localStorage.getItem('os_wallpaper_color') || '#1a5743';
    const savedAccentColor = localStorage.getItem('os_accent_color') || '#47b895';

    setWallpaperType(savedWallpaperType);
    setCustomColor(savedCustomColor);
    setAccentColor(savedAccentColor);

    if (savedWallpaperType === 'color') {
      setPreviewWallpaper(savedCustomColor);
    } else {
      setPreviewWallpaper('default');
    }

    // Restore accent on mount
    document.documentElement.style.setProperty('--color-accent', savedAccentColor);
  }, []);

  const applyWallpaper = () => {
    const background = document.getElementById('os-background');
    if (!background) return;

    if (wallpaperType === 'default') {
      background.style.backgroundImage = 'url("/public/img/Wallpaper.webp")';
      background.style.backgroundColor = '';
      localStorage.setItem('os_wallpaper_type', 'default');
    } else if (wallpaperType === 'color') {
      background.style.backgroundImage = 'none';
      background.style.backgroundColor = customColor;
      localStorage.setItem('os_wallpaper_type', 'color');
      localStorage.setItem('os_wallpaper_color', customColor);
    }
  };

  const applyAccentColor = () => {
    // Set the CSS custom property — all apps use var(--color-accent)
    document.documentElement.style.setProperty('--color-accent', accentColor);

    // Legacy overrides for window chrome and taskbar (not yet using CSS vars)
    const menuSquares = document.querySelectorAll('.menu-square');
    menuSquares.forEach(square => {
      square.style.backgroundColor = accentColor;
    });

    const style = document.createElement('style');
    style.id = 'custom-accent-style';
    const existingStyle = document.getElementById('custom-accent-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    style.innerHTML = `
      .window.active .border-window { border-color: ${accentColor} !important; }
      .window.active .draggable-window { background-color: ${accentColor} !important; }
      .menu-square { background-color: ${accentColor} !important; }
      #os-taskbar { border-top-color: ${accentColor} !important; }
      .apps .search-bar input { border-color: ${accentColor} !important; }
      .apps .search-bar input:focus { border-color: ${accentColor} !important; }
    `;
    document.head.appendChild(style);

    localStorage.setItem('os_accent_color', accentColor);
  };

  const handleWallpaperTypeChange = (type) => {
    setWallpaperType(type);
    setPreviewWallpaper(type === 'default' ? 'default' : customColor);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (wallpaperType === 'color') {
      setPreviewWallpaper(newColor);
    }
  };

  const applyAll = () => {
    applyWallpaper();
    applyAccentColor();
  };

  const resetToDefault = () => {
    setWallpaperType('default');
    setCustomColor('#1a5743');
    setAccentColor('#47b895');
    setPreviewWallpaper('default');

    localStorage.removeItem('os_wallpaper_type');
    localStorage.removeItem('os_wallpaper_color');
    localStorage.removeItem('os_accent_color');

    // Reset CSS variable to default
    document.documentElement.style.setProperty('--color-accent', '#47b895');

    const background = document.getElementById('os-background');
    if (background) {
      background.style.backgroundImage = 'url("/public/img/Wallpaper.webp")';
      background.style.backgroundColor = '';
    }

    const existingStyle = document.getElementById('custom-accent-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const menuSquares = document.querySelectorAll('.menu-square');
    menuSquares.forEach(square => {
      square.style.backgroundColor = '#47b895';
    });
  };

  return (
    <div className="personalization-app">
      <div className="personalization-header">
        <h2>Personalization</h2>
        <p>Customize your OnerOS experience</p>
      </div>

      <div className="personalization-content">
        <div className="personalization-sections">
          {/* Wallpaper Section */}
          <section className="personalization-section">
            <h3>Wallpaper</h3>
            <div className="wallpaper-options">
              <div className="option-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="wallpaper"
                    value="default"
                    checked={wallpaperType === 'default'}
                    onChange={() => handleWallpaperTypeChange('default')}
                  />
                  <span>Default Wallpaper</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="wallpaper"
                    value="color"
                    checked={wallpaperType === 'color'}
                    onChange={() => handleWallpaperTypeChange('color')}
                  />
                  <span>Solid Color</span>
                </label>
              </div>

              {wallpaperType === 'color' && (
                <div className="color-picker-group">
                  <label htmlFor="wallpaper-color">Choose Color:</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="wallpaper-color"
                      value={customColor}
                      onChange={handleColorChange}
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={handleColorChange}
                      className="color-text-input"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="wallpaper-preview">
              <p>Preview:</p>
              <div
                className="preview-box"
                style={{
                  backgroundColor: previewWallpaper === 'default' ? 'transparent' : previewWallpaper,
                  backgroundImage: previewWallpaper === 'default' ? 'url("/public/img/Wallpaper.webp")' : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {previewWallpaper === 'default' && <span className="preview-label">Default</span>}
              </div>
            </div>
          </section>

          {/* Accent Color Section */}
          <section className="personalization-section">
            <h3>Accent Color</h3>
            <p className="section-description">
              Change the accent color used across all applications
            </p>
            <div className="color-picker-group">
              <label htmlFor="accent-color">Choose Accent Color:</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  id="accent-color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="color-text-input"
                  placeholder="#47b895"
                />
              </div>
            </div>
            <div className="accent-preview">
              <div className="accent-preview-sample" style={{ backgroundColor: accentColor }}>
                <span>Sample</span>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="personalization-actions">
          <button className="btn-primary" onClick={applyAll}>
            Apply Changes
          </button>
          <button className="btn-secondary" onClick={resetToDefault}>
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

export default Personalization;
