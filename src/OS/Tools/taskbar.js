import React, { useState } from 'react';
import MenuStart from "./menu-start";
import Clock from "./time";
import Window from "../Window/buildWindow.tsx";
import AppSwitcher from './taskbar/appSwitcher.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faSearch } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { v4 as uuidv4 } from 'uuid';

library.add(fab, fas);

function Taskbar() {
  const [windows, setWindows] = useState([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  const handleMenuClick = () => setIsStartMenuOpen(prev => !prev);

  const toggleAppSwitcher = () => setIsAppSwitcherOpen(prev => !prev);

  const handleAppClick = (app) => {
    const newWindow = {
      id: uuidv4(),
      size: { width: 400, height: 500 },
      title: app.charAt(0).toUpperCase() + app.slice(1).toLowerCase(),
    };
    switch (app) {
      // Internal apps
      case "settings":
        newWindow.src = window.location.href + "internal/app/settings";
        break;
        
      // Web apps
      case "calculator":
        newWindow.src = "https://www.calculator.net";
        break;
      case "google":
        newWindow.src = "https://next-gooogle.vercel.app/";
        break;
      case "facebook":
        newWindow.src = "https://clonedbook.vercel.app/";
        break;
      case "bing":
        newWindow.src = "https://www.bing.com/?q=something";
        break;
      default:
        newWindow.src = `https://bing.com?q=${app}`;
        break;
    }
    setWindows(prev => [...prev, newWindow]);
  };

  const removeWindow = (id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  return (
    <>
      {isAppSwitcherOpen && (
        <AppSwitcher
          isOpen={isAppSwitcherOpen}
          onClose={() => setIsAppSwitcherOpen(false)}
        />
      )}
      <div id="window-frame">
        {windows.map(win => (
          <Window key={win.id} windowData={win} onClose={removeWindow} />
        ))}
      </div>
      <div id="os-taskbar">
        <div className="apps">
          <div className="menu" onClick={handleMenuClick} aria-label="Open Start Menu">
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
          </div>
          <button id="run-app-switcher" onClick={toggleAppSwitcher} aria-label="Open App Switcher">
            <FontAwesomeIcon icon={faExpand} className="app" />
          </button>
          <button id="run-google" onClick={() => handleAppClick("google")} aria-label="Open Google">
            <FontAwesomeIcon icon={['fab', 'google']} className="app" />
          </button>
          <button id="run-facebook" onClick={() => handleAppClick("facebook")} aria-label="Open Facebook">
            <FontAwesomeIcon icon={['fab', 'facebook']} className="app" />
          </button>
          <button id="run-bing" onClick={() => handleAppClick("bing")} aria-label="Open Bing">
            <FontAwesomeIcon icon={faSearch} className="app" />
          </button>
        </div>
        <Clock />
        {isStartMenuOpen && <MenuStart onOpenSettings={() => handleAppClick("settings")} onClose={() => setIsStartMenuOpen(false) />}
      </div>
    </>
  );
}

export default Taskbar;
