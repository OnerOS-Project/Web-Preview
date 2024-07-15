import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPowerOff,
  faGear,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
// import ReactDOM from 'react-dom/client';

function MenuStart() {
  const powerOffOS = () => {
    document.body.innerHTML = "";
    document.body.style.background = "black"
    window.open(window.location, '_self').close();
  }

  return (
    <>
      <div id="menu-start" className="menu-layout">
        <p style={{ 'margin-top': "5px" }}>OnerOS - Menu Start</p>
        <div className="menu-apps-layout">
          <div className="menu-apps">
            <div className="list">
                <ul>
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
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faGear} />
            </div>
            <div className="menu-elm">
              <FontAwesomeIcon icon={faPowerOff} onClick={powerOffOS}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MenuStart;
