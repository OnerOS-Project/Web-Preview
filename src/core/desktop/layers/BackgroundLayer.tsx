import React, { useState } from "react";
import "../../../OS/background.css";

export interface BackgroundLayerProps {
  children?: React.ReactNode;
}

/**
 * BackgroundLayer - Wallpaper and background effects layer.
 *
 * This component preserves the exact behavior from the original background.js:
 * - Context menu (right-click)
 * - Version display
 * - Reload and start menu events
 * - All existing interactions
 */
const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleReload = () => {
    setMenuVisible(false);
    setMenuPosition({ x: 0, y: 0 });
    // notify components that reload started (they should hide)
    window.dispatchEvent(new CustomEvent('os:reload'));

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('os:reload_complete'));
    }, 900);
  };

  const handleMenu = () => {
    alert("cmd_open_start_menu");
    setMenuVisible(false);
    window.dispatchEvent(new CustomEvent('os:open_menu'));
  }

  return (
    <div>
      <div
        id="os-background"
        tabIndex={0}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPosition({ x: e.pageX, y: e.pageY });
          setMenuVisible(true);
        }}
        onClick={() => setMenuVisible(false)}
      >
        <p className="os-version">
          OnerOS Web (Preview) 3.0.0
        </p>
      </div>

      <ul
        className="os-context-menu"
        style={{
          top: menuPosition.y,
          left: menuPosition.x,
          position: "absolute",
          display: menuVisible ? "block" : "none",
        }}
      >
        <li onClick={handleReload}>Reload UI</li>
        <li onClick={handleMenu}>Start Menu</li>
        <li className="disabled" tabIndex={-1}>
          -------------------
        </li>
        <li className="disabled" tabIndex={-1}>
          OnerOS - Web Preview
        </li>
      </ul>

      {children}
    </div>
  );
};

export default BackgroundLayer;
