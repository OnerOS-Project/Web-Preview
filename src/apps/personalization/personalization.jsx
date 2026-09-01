import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faRectangleList } from '@fortawesome/free-solid-svg-icons';
import { faUbuntu, faWindows, faApple } from '@fortawesome/free-brands-svg-icons';
import './personalization.css';

const THEMES = [
  { id: 0, name: 'Modern', icon: faDesktop, taskbarClass: '', bodyClass: '' },
  { id: 1, name: 'Centered', icon: faRectangleList, taskbarClass: 'center', bodyClass: '' },
  { id: 2, name: 'Win95', icon: faWindows, taskbarClass: 'win95-theme', bodyClass: 'win95-mode' },
  { id: 3, name: 'WinXP', icon: faWindows, taskbarClass: 'winxp-theme', bodyClass: 'winxp-mode' },
  { id: 4, name: 'macOS', icon: faApple, taskbarClass: 'macos-theme', bodyClass: 'macos-mode' },
  { id: 5, name: 'Ubuntu', icon: faUbuntu, taskbarClass: 'ubuntu-theme', bodyClass: 'ubuntu-mode' },
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

    applyTheme(0);
  };

  return (
    <div className="personalization-app">
      <div className="personalization-header">
        <h2>Personalization</h2>
        <p>Customize your OnerOS experience</p>
      </div>

      <div className="personalization-content">
        <div className="personalization-sections">
          <section className="personalization-section">
            <h3>Themes</h3>
            <p className="section-description">
              Choose a system theme that changes the look of the taskbar and desktop
            </p>
            <div className="theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '15px' }}>
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  className="theme-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: activeTheme === theme.id ? '2px solid var(--color-accent)' : '2px solid var(--border-default)',
                    backgroundColor: activeTheme === theme.id ? 'rgba(71, 184, 149, 0.1)' : 'var(--bg-tertiary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <FontAwesomeIcon icon={theme.icon} style={{ fontSize: '22px', color: activeTheme === theme.id ? 'var(--color-accent)' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: activeTheme === theme.id ? 'bold' : 'normal', color: activeTheme === theme.id ? 'var(--color-accent)' : 'var(--text-secondary)' }}>
                    {theme.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

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
