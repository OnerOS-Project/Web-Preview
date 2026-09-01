import React, { useEffect, useState } from 'react';
import LoadOS from "./OS/bootloader"
import { DesktopRuntime } from "./core/desktop";

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
      <DesktopRuntime isBooted={showBackground} />
      <LoadOS />
    </div>
  );
}

export default App;
