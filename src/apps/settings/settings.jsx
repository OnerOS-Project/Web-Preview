import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faWrench, faInfoCircle, faExternalLinkAlt, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import '../../apps/shared/os-theme.css';
import './settings.css';

const SNAP_STORAGE_KEY = 'os_snap_enabled';

function Settings() {
  const [snapEnabled, setSnapEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SNAP_STORAGE_KEY);
    setSnapEnabled(stored !== 'false');
  }, []);

  const toggleSnap = () => {
    const next = !snapEnabled;
    setSnapEnabled(next);
    localStorage.setItem(SNAP_STORAGE_KEY, String(next));
    window.dispatchEvent(new CustomEvent('fv:snap-setting-changed', { detail: { enabled: next } }));
  };

  const openApp = (appId) => {
    window.dispatchEvent(new CustomEvent('os:app_run', { detail: { app: appId } }));
  };

  return (
    <div className="settings-app">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>System configuration and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          <div className="settings-card clickable" onClick={() => openApp('personalization')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openApp('personalization')}>
            <div className="settings-card-icon"><FontAwesomeIcon icon={faPalette} /></div>
            <div className="settings-card-info"><h3>Personalization</h3><p>Wallpaper, accent color, and appearance</p></div>
            <div className="settings-card-arrow"><FontAwesomeIcon icon={faExternalLinkAlt} /></div>
          </div>

          <div className="settings-card clickable" onClick={() => openApp('toolsapp')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openApp('toolsapp')}>
            <div className="settings-card-icon"><FontAwesomeIcon icon={faWrench} /></div>
            <div className="settings-card-info"><h3>Tools</h3><p>System utilities and developer tools</p></div>
            <div className="settings-card-arrow"><FontAwesomeIcon icon={faExternalLinkAlt} /></div>
          </div>

          <div className="settings-card">
            <div className="settings-card-icon"><FontAwesomeIcon icon={faInfoCircle} /></div>
            <div className="settings-card-info"><h3>About</h3><p>OnerOS Web Preview v3.0</p></div>
          </div>
        </div>

        {/* Advanced Section */}
        <div className="settings-section">
          <div className="settings-section-label">
            <FontAwesomeIcon icon={faSlidersH} />
            <span>Advanced</span>
          </div>

          <div className="settings-card">
            <div className="settings-card-info" style={{ flex: 1 }}>
              <h3>Auto-snap windows</h3>
              <p>Automatically snap windows when dragged to screen edges. Ctrl+Arrow shortcuts always work.</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" checked={snapEnabled} onChange={toggleSnap} />
              <span className="settings-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <p>&copy; 2025 - OnerOS Project by <a href="https://klubuntu.eu.org/">Klubuntu</a></p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
