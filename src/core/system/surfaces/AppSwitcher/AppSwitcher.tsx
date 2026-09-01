import React, { useRef, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWindowRestore,
  faArrowRight,
  faXmark,
  faArrowsUpDownLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import type { WindowData } from "../../../windowManager/Window/window.types";
import { resolveAppIcon } from '../../../apps/iconResolver';
import { getApp } from '../../../apps';
import "./AppSwitcher.css";

export interface AppSwitcherProps {
  isOpen: boolean;
  windows: WindowData[];
  focusedWindowId?: string | null;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  onClose: () => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  windowId: string;
  windowTitle: string;
}

const AppSwitcher: React.FC<AppSwitcherProps> = ({
  isOpen,
  windows,
  focusedWindowId,
  focusWindow,
  closeWindow,
  onClose,
}) => {
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, windowId: '', windowTitle: '',
  });
  const listRef = useRef<HTMLDivElement | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && windows.length > 0) {
      const focusedIdx = windows.findIndex(w => w.id === focusedWindowId);
      setHighlightIndex(focusedIdx >= 0 ? focusedIdx : 0);
    }
  }, [isOpen, windows, focusedWindowId]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightIndex(0);
      setContextMenu(prev => ({ ...prev, visible: false }));
    }
  }, [isOpen]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (contextMenu.visible) {
      const handler = (e: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
          closeContextMenu();
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [contextMenu.visible, closeContextMenu]);

  const selectWindow = (id: string) => {
    focusWindow(id);
    onClose();
  };

  const handleContextMenu = (e: React.MouseEvent, w: WindowData) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      windowId: w.id,
      windowTitle: w.title,
    });
  };

  const handleContextSwitch = () => {
    selectWindow(contextMenu.windowId);
  };

  const handleClose = () => {
    closeWindow(contextMenu.windowId);
    closeContextMenu();
  };

  const handleCenterOnScreen = () => {
    const el = document.getElementById(contextMenu.windowId);
    if (el) {
      const width = parseFloat(el.style.width) || el.offsetWidth;
      const height = parseFloat(el.style.height) || el.offsetHeight;
      const taskbarHeight = 52;
      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - taskbarHeight - height) / 2;
      el.style.left = `${Math.max(0, x)}px`;
      el.style.top = `${Math.max(0, y)}px`;
      focusWindow(contextMenu.windowId);
    }
    closeContextMenu();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (contextMenu.visible) {
        closeContextMenu();
      } else {
        onClose();
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, windows.length - 1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = windows[highlightIndex];
      if (item) selectWindow(item.id);
    }
  };

  if (!isOpen || windows.length === 0) return null;

  return (
    <div
      className="app-switcher-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="app-switcher"
        role="menu"
        aria-label="Switch Application"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        ref={listRef}
      >
        <div className="app-switcher-title">
          <FontAwesomeIcon icon={faWindowRestore} />
          <span>Switch Application</span>
        </div>

        <div className="app-switcher-list">
          {windows.filter(w => !w.isClosing).map((w, idx) => {
            const isHighlighted = idx === highlightIndex;
            const isFocused = w.id === focusedWindowId;
            const app = w.appId ? getApp(w.appId) : null;
            const iconDef = resolveAppIcon(w.icon || app?.icon);

            return (
              <div
                key={w.id}
                role="menuitem"
                tabIndex={0}
                className={`app-switcher-item${isHighlighted ? ' highlight' : ''}${isFocused ? ' focused' : ''}`}
                onClick={() => selectWindow(w.id)}
                onContextMenu={(e) => handleContextMenu(e, w)}
                onMouseEnter={() => setHighlightIndex(idx)}
                aria-current={isHighlighted}
              >
                <div className="app-switcher-item-icon">
                  <FontAwesomeIcon icon={iconDef} />
                </div>
                <div className="app-switcher-item-text">
                  <div className="app-switcher-item-name">{w.title}</div>
                  <div className="app-switcher-item-id">{app?.name || w.appId || w.id}</div>
                </div>
                {isFocused && <div className="app-switcher-item-active-dot" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="app-switcher-context-menu"
          ref={contextMenuRef}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="context-menu-title">{contextMenu.windowTitle}</div>
          <button className="context-menu-item" onClick={handleContextSwitch}>
            <FontAwesomeIcon icon={faArrowRight} />
            <span>Switch to this app</span>
          </button>
          <button className="context-menu-item" onClick={handleCenterOnScreen}>
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
            <span>Move to center screen</span>
          </button>
          <div className="context-menu-separator" />
          <button className="context-menu-item context-menu-danger" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
            <span>Close this app</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AppSwitcher;
