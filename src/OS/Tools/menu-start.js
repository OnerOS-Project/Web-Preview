import React, { useState } from "react";
import ReactDOM from 'react-dom';
import Window from "../Window/buildWindow.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPowerOff,
  faGear,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

function MenuStart() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const powerOffOS = () => {
    document.body.innerHTML = "";
    document.body.style.background = "black";
    window.open(window.location, '_self').close();
  }

  const appUnavailable = () => {
    alert("App Unavailable, please wait for the next update.");
  }

  const renderSettingsWindow = () => {
    setIsSettingsOpen(true);
  }

  const closeSettingsWindow = () => {
    setIsSettingsOpen(false);
  }

  const openRepo = () => {
    window.open("https://github.com/OnerOS-Project/Web-Preview");
  }

  const windowData = {
    id: "settings-window",
    title: "Settings",
    size: { width: 400, height: 500 },
    position: { x: 20, y: 20 },
    src: window.location.href + "internal/app/settings",
  }

  const settingsWindow = (
    <Window
      windowData={windowData}
      onClose={closeSettingsWindow}
    />
  );

  return (
    <>
      <div id="menu-start" className="menu-layout">
        <p style={{ marginTop: "5px" }}>OnerOS - Menu Start</p>
        <div className="menu-apps-layout">
          <div className="menu-apps">
            <div className="list">
              <ul style={{ listStyleType: "none" }}>
                <li>App Name 1</li>
                <li>App Name 2</li>
                <li>App Name 3</li>
                <li>App Name 4</li>
                <li>App Name 5</li>
                <li>App Name 6</li>
                <li>App Name 7</li>
                <li>App Name 8</li>
                <li>App Name 9</li>
                <li>App Name 10</li>
                <li>App Name 11</li>
                <li>App Name 12</li>
              </ul>
            </div>
            <div className="search">
              <input type="text" placeholder="Search favourite app"></input>
            </div>
          </div>
          <div className="menu-col">
            <div className="menu-elm" onClick={appUnavailable}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm" onClick={appUnavailable}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm" onClick={appUnavailable}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm" onClick={appUnavailable}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm" onClick={appUnavailable}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm" onClick={appUnavailable}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm" onClick={openRepo}>
              <FontAwesomeIcon icon={faGithub} />
            </div>
            <div className="menu-elm" onClick={renderSettingsWindow}>
              <FontAwesomeIcon icon={faGear} />
            </div>
            <div className="menu-elm" onClick={powerOffOS}>
              <FontAwesomeIcon icon={faPowerOff} />
            </div>
          </div>
        </div>
      </div>
      {isSettingsOpen && ReactDOM.createPortal(settingsWindow, document.getElementById('window-frame'))}
    </>
  );
}

export default MenuStart;
