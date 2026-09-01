import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faRectangleList, faImage, faPalette } from '@fortawesome/free-solid-svg-icons';
import { faUbuntu, faWindows, faApple } from '@fortawesome/free-brands-svg-icons';
import './personalization.css';

const THEMES = [
  { id: 0, name: 'Modern', icon: faDesktop, taskbarClass: '', bodyClass: '', preview: 'default' },
  { id: 1, name: 'Centered', icon: faRectangleList, taskbarClass: 'center', bodyClass: '', preview: 'centered' },
  { id: 2, name: 'Win95', icon: faWindows, taskbarClass: 'win95-theme', bodyClass: 'win95-mode', preview: 'win95' },
  { id: 3, name: 'WinXP', icon: faWindows, taskbarClass: 'winxp-theme', bodyClass: 'winxp-mode', preview: 'winxp' },
  { id: 4, name: 'macOS', icon: faApple, taskbarClass: 'macos-theme', bodyClass: 'macos-mode', preview: 'macos' },
  { id: 5, name: 'Ubuntu', icon: faUbuntu, taskbarClass: 'ubuntu-theme', bodyClass: 'ubuntu-mode', preview: 'ubuntu' },
];

const ACCENT_PRESETS = [
  { name: 'Green', color: '#47b895' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Orange', color: '#f59e0b' },
  { name: 'Pink', color: '#ec4899' },
];

const WIN95_CURSOR = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABNSURBVCiRY/j//z8DGYCFgYRQj5q4cePG/4yMjAwUaWRkZPz//z/jgQMHyNaIyyA8NpLiHKLdMFo1DAY1DA41DA41DA41DA41DA41DBU1AADTTR0xqm6CzAAAAABJRU5ErkJggg=="), auto';

function Personalization() {
  const [wallpaperType, setWallpaperType] = useState('default');
  const [customColor, setCustomColor] = useState('#1a5743');
  const [accentColor, setAccentColor] = useState('#47b895');
  const [previewWallpaper, setPreviewWallpaper] = useState('');
  const [activeTheme, setActiveTheme] = useState(0);

  useEffect(() => {
    const savedWallpaperType = localStorage.getItem('os_wallpaper_type') || 'default';
    const savedCustomColor = localStorage.getItem('os_wallpaper_color') || '#1a5743';
    const savedAccentColor = localStorage.getItem('os_accent_color') || '#47b895';
    const savedTheme = parseInt(localStorage.getItem('os_theme') || '0', 10);

    setWallpaperType(savedWallpaperType);
    setCustomColor(savedCustomColor);
    setAccentColor(savedAccentColor);

    if (savedWallpaperType === 'color') {
      setPreviewWallpaper(savedCustomColor);
    } else {
      setPreviewWallpaper('default');
    }

    document.documentElement.style.setProperty('--color-accent', savedAccentColor);
    applyTheme(savedTheme);
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
    document.documentElement.style.setProperty('--color-accent', accentColor);
    const style = document.createElement('style');
    style.id = 'custom-accent-style';
    const existingStyle = document.getElementById('custom-accent-style');
    if (existingStyle) existingStyle.remove();
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

  const applyTheme = (themeId) => {
    const taskbar = document.getElementById('os-taskbar');
    const body = document.body;
    if (!taskbar || !body) return;
    taskbar.classList.remove('center', 'win95-theme', 'winxp-theme', 'macos-theme', 'ubuntu-theme');
    body.classList.remove('win95-mode', 'winxp-mode', 'macos-mode', 'ubuntu-mode');
    const theme = THEMES[themeId];
    if (theme.taskbarClass) taskbar.classList.add(theme.taskbarClass);
    if (theme.bodyClass) body.classList.add(theme.bodyClass);
    body.style.cursor = themeId === 2 ? WIN95_CURSOR : 'default';
    setActiveTheme(themeId);
    localStorage.setItem('os_theme', String(themeId));
  };

  const handleWallpaperTypeChange = (type) => {
    setWallpaperType(type);
    setPreviewWallpaper(type === 'default' ? 'default' : customColor);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (wallpaperType === 'color') setPreviewWallpaper(newColor);
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
    document.documentElement.style.setProperty('--color-accent', '#47b895');
    const existingStyle = document.getElementById('custom-accent-style');
    if (existingStyle) existingStyle.remove();
    const background = document.getElementById('os-background');
    if (background) {
      background.style.backgroundImage = 'url("/public/img/Wallpaper.webp")';
      background.style.backgroundColor = '';
    }
    const menuSquares = document.querySelectorAll('.menu-square');
    menuSquares.forEach(sq => { sq.style.backgroundColor = '#47b895'; });
    applyTheme(0);
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
                onClick={() => applyTheme(theme.id)}
                className={`p-theme-card${activeTheme === theme.id ? ' active' : ''}`}
              >
                <div className={`p-theme-preview p-theme-${theme.preview}`}>
                  <FontAwesomeIcon icon={theme.icon} className="p-theme-icon" />
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
