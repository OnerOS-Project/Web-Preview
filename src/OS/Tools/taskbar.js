import React, { useState, useEffect, useMemo} from 'react';
import MenuStart from "./menu-start"
import Clock from "./time"
import Window from "../buildWindow"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faExpand} from "@fortawesome/free-solid-svg-icons";
// import { faGoogleLogo} from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
// import ReactDOM from 'react-dom/client';
import ReactDOM from 'react-dom';

// library.add(faGoogleLogo)
library.add(fab, fas)
function Taskbar(){
    const [setWindows] = useState([]);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    // const [activeApp, setActiveApp] = useState(null);
  
    const handleMenuClick = () => {
        setIsStartMenuOpen((prevState) => !prevState);
    };

    const handleAppClick = (app) => {
        // setActiveApp(app);
        setIsWindowOpen(true);
    }

    // const closeWindow = () => {
    //     setIsWindowOpen(false);
    // }
    const windowsData = useMemo(
      () => [
        {
          id: 1,
          size: { width: 400, height: 300 },
          position: { x: 20, y: 20 },
          src: 'https://bing.com',
        },
      ],
      []
    );

    useEffect(() => {
        setWindows(windowsData);
        if (isWindowOpen) {
          windowsData.forEach((windowData) => {
            const container = document.createElement('div');
            container.setAttribute('id', `window-${windowData.id}`);
            document.getElementById('os-background').appendChild(container);
    
            ReactDOM.render(
              <Window key={windowData.id} windowData={windowData} />,
              container
            );
          });
        } else {
          windowsData.forEach((windowData) => {
            const container = document.getElementById(`window-${windowData.id}`);
            if (container) {
              ReactDOM.unmountComponentAtNode(container);
              container.parentNode.removeChild(container);
            }
          });
        }
      }, [isWindowOpen, windowsData]);
    
    return (
        <>
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
                onClick={() => handleAppClick("expand")}
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
                onClick={() => handleAppClick("b")}
              />
            </div>
            <Clock />
            {isStartMenuOpen && <MenuStart />}
          </div>
        </>
      );
    }

export default Taskbar;