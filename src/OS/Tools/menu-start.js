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

function MenuStart( {onOpenSettings} ) {

  const powerOffOS = () => {
    document.body.innerHTML = "";
    document.body.style.background = "black";
    window.open(window.location, '_self').close();
  }

  const appUnavailable = () => {
    alert("App Unavailable on this time\nPlease wait for the next update");
  }

  const openRepo = () => {
    window.open("https://github.com/OnerOS-Project/Web-Preview");
  }

  return (
    <>
      <div id="menu-start" className="menu-layout">
        <p style={{ marginTop: "5px" }}>OnerOS - Menu Start</p>
        <div className="menu-apps-layout">
          <div className="menu-apps">
            <div className="list">
              <ul style={{ listStyleType: "none" }}>
                <li>Example App</li>
                <li>File Manager</li>
                <li>Tools App</li>
                <li>Browser</li>
                <li>Dialer</li>
                <li>Undefined app</li>
                <li>MPlayer</li>
                <li>My Store</li>
                <li>Personalization</li>
                <li>Dev Zone</li>
                <li>...</li>
                <li>...</li>
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
            <div className="menu-elm" onClick={onOpenSettings}>
              <FontAwesomeIcon icon={faGear} />
            </div>
            <div className="menu-elm" onClick={powerOffOS}>
              <FontAwesomeIcon icon={faPowerOff} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MenuStart;
