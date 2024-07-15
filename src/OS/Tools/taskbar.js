import React, { useState } from 'react';
import MenuStart from "./menu-start";
import Clock from "./time";
import Window from "../buildWindow.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fab, fas);

function Taskbar() {
  const [windows, setWindows] = useState([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsStartMenuOpen((prevState) => !prevState);
  };

  const handleAppClick = (app) => {
    const newWindow = {
      id: Date.now(), // Unique ID for each window
      size: { width: 400, height: 300 },
      position: { x: 20, y: 20 },
      title: `${app.substring(0, 1).toUpperCase() + app.substring(1).toLowerCase()}`,
    };
    switch (app){
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
        newWindow.src = `https://bing.com?q=${app}`
        break;
    }
    setWindows((prevWindows) => [...prevWindows, newWindow]);
  };

  const removeWindow = (id) => {
    setWindows((prevWindows) => prevWindows.filter((window) => window.id !== id));
  };

  return (
    <>
        {windows.map((windowData) => (
          <Window
            key={windowData.id}
            windowData={windowData}
            onClose={removeWindow}
          />
        ))}
      <div id="os-taskbar">
        <div className="apps">
          <div className="menu" onClick={handleMenuClick}>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
            <div className="menu-square"></div>
          </div>
          <FontAwesomeIcon
            icon={faExpand}
            className="app"
            onClick={() => handleAppClick("switch_apps")}
          />
          <FontAwesomeIcon
            icon={['fab', 'google']}
            className="app"
            onClick={() => handleAppClick("google")}
          />
          <FontAwesomeIcon
            icon={['fab', 'facebook']}
            className="app"
            onClick={() => handleAppClick("facebook")}
          />
          <FontAwesomeIcon
            icon={['fas', 'b']}
            className="app"
            onClick={() => handleAppClick("bing")}
          />
        </div>
        <Clock />
        {isStartMenuOpen && <MenuStart />}
      </div>
    </>
  );
}

export default Taskbar;
