import React, { useEffect, useState } from 'react';
import { Bootloader } from "./core/system/bootloader";
import { DesktopRuntime } from "./core/desktop";
import { SystemAlertProvider } from "./components/SystemAlert";

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
      <SystemAlertProvider>
        <DesktopRuntime isBooted={showBackground} />
        {!showBackground && <Bootloader />}
      </SystemAlertProvider>
    </div>
  );
}

export default App;
