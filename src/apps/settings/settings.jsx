import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faWrench, faInfoCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import '../../apps/shared/os-theme.css';
import './settings.css';

function Settings() {
  const openApp = (appId) => {
    window.dispatchEvent(new CustomEvent('os:app_run', { detail: { app: appId } }));
  };

  const settingsItems = [
    {
      id: 'personalization',
      icon: faPalette,
      title: 'Personalization',
      description: 'Wallpaper, accent color, and appearance',
      action: () => openApp('personalization'),
    },
    {
      id: 'tools',
      icon: faWrench,
      title: 'Tools',
      description: 'System utilities and developer tools',
      action: () => openApp('toolsapp'),
    },
    {
      id: 'about',
      icon: faInfoCircle,
      title: 'About',
      description: 'OnerOS Web Preview v3.0',
      action: null,
    },
  ];

  return (
    <div className="settings-app">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>System configuration and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          {settingsItems.map((item) => (
            <div
              key={item.id}
              className={`settings-card ${item.action ? 'clickable' : ''}`}
              onClick={item.action}
              role={item.action ? 'button' : undefined}
              tabIndex={item.action ? 0 : undefined}
              onKeyDown={item.action ? (e) => e.key === 'Enter' && item.action() : undefined}
            >
              <div className="settings-card-icon">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div className="settings-card-info">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              {item.action && (
                <div className="settings-card-arrow">
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="settings-footer">
          <p>&copy; 2025 - OnerOS Project by <a href="https://klubuntu.eu.org/">Klubuntu</a></p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
