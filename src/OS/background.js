import React, { useState } from "react";
import "./background.css";
var pjson = require("../../package.json");

function Background() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  // keep Background minimal: only track context menu visibility/position

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
          OnerOS Web (Preview) {pjson.version}
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
        <li className="disabled" tabIndex={-1} aria-disabled="true">
          -------------------
        </li>
        <li className="disabled" tabIndex={-1} aria-disabled="true">
          OnerOS - Web Preview
        </li>
      </ul>
    </div>
  );
}

export default Background;
