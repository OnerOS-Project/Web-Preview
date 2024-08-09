// import React from "react";
import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom/client';
import LoadOS from "./OS/bootloader"
import Background from "./OS/background"
import Taskbar from "./OS/Tools/taskbar";

function App(){
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showBackground) {
      // document.body.classList.add('margin')
      document.getElementById("os-loader").remove()
    } else {
      document.body.classList.remove('margin');
    }
  }, [showBackground]);

  return (
    <div style={{background: "#181818"}}>
      {showBackground &&
        <>
        <Taskbar />
        <Background />
        </>
      }
      <LoadOS />
    </div>
  );
}

export default App;
