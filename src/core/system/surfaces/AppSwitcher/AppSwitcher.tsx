import React, { useRef, useState } from "react";
import type { WindowData } from "../../../windowManager/Window/window.types";

export interface AppSwitcherProps {
  isOpen: boolean;
  windows: WindowData[];
  focusedWindowId?: string | null;
  focusWindow: (id: string) => void;
  onClose: () => void;
}

const AppSwitcher: React.FC<AppSwitcherProps> = ({
  isOpen,
  windows,
  focusedWindowId,
  focusWindow,
  onClose,
}) => {
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  const displayToggledApp = (id: string) => {
    focusWindow(id);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, windows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = windows[highlightIndex];
      if (item) displayToggledApp(item.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="app-switcher-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="app-switcher"
        role="menu"
        aria-label="App Switcher"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        ref={listRef}
      >
        <h3>Select app to switch</h3>

        {windows.length === 0 ? (
          <div className="app no-apps">No open apps</div>
        ) : (
          windows.map((w, idx) => {
            const isHighlighted = idx === highlightIndex;
            const isFocused = w.id === focusedWindowId;
            return (
              <div
                key={w.id}
                role="menuitem"
                tabIndex={0}
                className={`app${isHighlighted ? " highlight" : ""}${isFocused ? " active" : ""}`}
                onClick={() => displayToggledApp(w.id)}
                onMouseEnter={() => setHighlightIndex(idx)}
                onKeyDown={(e) => e.key === "Enter" && displayToggledApp(w.id)}
                aria-current={isHighlighted}
              >
                <div className="title">{w.title}</div>
                <div className="meta">{w.appId || w.id}</div>
              </div>
            );
          })
        )}

        <div className="switcher-actions">
          <button className="close-switcher" onClick={handleClose} aria-label="Close App Switcher">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppSwitcher;
