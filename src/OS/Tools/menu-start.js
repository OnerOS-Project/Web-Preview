import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPowerOff,
  faGear,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

function MenuStart({ onOpenSettings, onClose }) {
  const menuRef = useRef(null);

  const powerOffOS = () => {
    document.body.innerHTML = "";
    document.body.style.background = "black";
    window.open(window.location, "_self").close();
  };

  const appUnavailable = () => {
    alert("App Unavailable on this time\nPlease wait for the next update");
  };

  const openRepo = () => {
    window.open("https://github.com/OnerOS-Project/Web-Preview");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div id="menu-start" className="menu-layout" ref={menuRef}>
      <p style={{ marginTop: "5px" }}>OnerOS - Menu Start</p>
      <div className="menu-apps-layout">
        <div className="menu-apps">
          <div className="list">
            <ul style={{ listStyleType: "none" }}>
              <li onClick={appUnavailable}>Example App</li>
              <li onClick={appUnavailable}>File Manager</li>
              <li onClick={appUnavailable}>Tools App</li>
              <li onClick={appUnavailable}>Browser</li>
              <li onClick={appUnavailable}>KDialer</li>
              <li onClick={appUnavailable}>Undefined app</li>
              <li onClick={appUnavailable}>MPlayer</li>
              <li onClick={appUnavailable}>My Store</li>
              <li onClick={appUnavailable}>Personalization</li>
              <li onClick={appUnavailable}>Dev Zone</li>
              <li onClick={appUnavailable}>Linux Mode</li>
              <li onClick={appUnavailable}>WinSync</li>
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
  );
}

export default MenuStart;
