import React, { useEffect, useState } from 'react';
import { Bootloader } from "./core/system/bootloader";
import { DesktopRuntime } from "./core/desktop";

function App(){
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showBackground) {
      document.getElementById("os-loader")?.remove()
    }
  }, [showBackground]);

  return (
    <div style={{background: "#181818"}}>
      <DesktopRuntime isBooted={showBackground} />
      {!showBackground && <Bootloader />}
    </div>
  );
}

export default App;
