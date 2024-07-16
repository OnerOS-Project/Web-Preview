import React, { useState } from 'react';
import MenuStart from "./menu-start";
import Clock from "./time";
import Window from "./taskbar/buildWindow.tsx";
import AppSwitcher from './taskbar/appSwitcher.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {v4 as uuidv4} from 'uuid';

library.add(fab, fas);

function Taskbar() {
  const [windows, setWindows] = useState([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  const handleMenuClick = () => {
    setIsStartMenuOpen((prevState) => !prevState);
  };

  const toggleAppSwitcher = () => {
    setIsAppSwitcherOpen((prevState) => !prevState);
    document.querySelector("#os-background").classList.toggle("opacity");
    if(document.querySelector(".window.active")){
      document.querySelector(".window.active").classList.add("active");
    }
  }

  const handleAppClick = (app) => {
    const newWindow = {
      id: uuidv4(), // Unique ID for each window
      size: { width: 400, height: 500 },
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
      {isAppSwitcherOpen && <AppSwitcher />}
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
          <button style={{border: 'none', background: 'none', color: 'white'}}id="run-app-switcher" onClick={() => toggleAppSwitcher()}>
            <FontAwesomeIcon
              icon={faExpand}
              className="app"
            />
          </button>

          <FontAwesomeIcon
            icon={['fab', 'google']}
            className="app"
            id="run-google"
            onClick={() => handleAppClick("google")}
          />
          <FontAwesomeIcon
            icon={['fab', 'facebook']}
            className="app"
            id="run-facebook"
            onClick={() => handleAppClick("facebook")}
          />
          <FontAwesomeIcon
            icon={['fas', 'b']}
            className="app"
            id="run-bing"
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
