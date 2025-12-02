import React, { useState, useEffect } from 'react';
import MenuStart from "./menuStart";
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
  const [isCentered, setIsCentered] = useState(false);
  const [hiddenByReload, setHiddenByReload] = useState(false);
  const menuButtonRef = React.useRef(null);

  // Listen for global reload event and reset taskbar state
  useEffect(() => {
    const handleOsReload = () => {
      setIsStartMenuOpen(false);
      setIsAppSwitcherOpen(false);
      setWindows([]);
      setIsCentered(false);
      setHiddenByReload(false);
      console.log('[OS] Reloading OS - reload complete');
    };

    window.addEventListener('os:reload_complete', handleOsReload);
    return () => window.removeEventListener('os:reload_complete', handleOsReload);
  }, []);

  // hide Taskbar while reload is in progress
  useEffect(() => {
    const handleOsReloading = () => {
      console.log('[OS] Reloading OS - please wait');
      setHiddenByReload(true);
    };

    window.addEventListener('os:reload', handleOsReloading);
    return () => window.removeEventListener('os:reload', handleOsReloading);
  }, []);

  // Listen for requests to open the start menu (from Background or other components)
  useEffect(() => {
    const handleOsOpenMenu = () => {
      setIsStartMenuOpen(true);
      // focus the menu button if available
      try {
        menuButtonRef.current && menuButtonRef.current.focus && menuButtonRef.current.focus();
      } catch (e) {}
    };

    window.addEventListener('os:open_menu', handleOsOpenMenu);
    return () => window.removeEventListener('os:open_menu', handleOsOpenMenu);
  }, [menuButtonRef]);

  const handleMenuClick = () => setIsStartMenuOpen(prev => !prev);

  const toggleAppSwitcher = () => setIsAppSwitcherOpen(prev => !prev);

  const toggleTaskbarAlignment = () => setIsCentered(prev => !prev);

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
      <div
        id="os-taskbar"
        className={isCentered ? "center" : ""}
        style={{ display: hiddenByReload ? 'none' : undefined }}
      >
        <div className="apps">
          <div
            className="menu"
            ref={menuButtonRef}
            onClick={handleMenuClick}
            onMouseDown={(e) => e.stopPropagation()}
            data-menu-button
            aria-label="Open Start Menu"
          >
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
          </div>
          
          <div className="taskbar-separator"></div>

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
        <Clock className={isCentered ? "right" : ""} />
        {isStartMenuOpen && 
          <MenuStart 
            onOpenSettings={() => handleAppClick("settings")} 
            onToggle={setIsStartMenuOpen}
            alignmentApp={toggleTaskbarAlignment}
            menuButtonRef={menuButtonRef}
          />
        }
      </div>
    </>
  );
}

export default Taskbar;
