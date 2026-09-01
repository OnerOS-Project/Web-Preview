import React, { useRef, useEffect, useState } from 'react';
import interact from 'interactjs';
import type { WindowProps } from './window.types';
import { WINDOW_CLASSES, WINDOW_DEFAULTS } from './window.constants';
import WindowHeader from './WindowHeader';
import WindowContent from './WindowContent';

const Window: React.FC<WindowProps> = ({ windowData, onClose }) => {
  const AppWindowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  const [prevBounds, setPrevBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (AppWindowRef.current) {
      AppWindowRef.current.focus();
      AppWindowRef.current.classList.add(WINDOW_CLASSES.ACTIVE);
    }
  }, []);

  useEffect(() => {
    const resizableElement = AppWindowRef.current;
    const draggableElement = draggableRef.current;

    const handleResizeStart = () => {
      if (isMaximized) return;
      document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(frame => {
        frame.style.pointerEvents = 'none';
      });
      window_handleActive();
    };

    const handleResizeMove = (event: any) => {
      if (isMaximized) return;
      const target = event.target;
      const x = (parseFloat(target.style.left) || 0) + event.deltaRect.left;
      const y = (parseFloat(target.style.top) || 0) + event.deltaRect.top;

      const maxWidth = window.innerWidth - x;
      const maxHeight = window.innerHeight - y;

      const newWidth = Math.min(event.rect.width, maxWidth);
      const newHeight = Math.min(event.rect.height, maxHeight);

      target.style.width = `${newWidth}px`;
      target.style.height = `${newHeight}px`;
      target.style.left = `${Math.max(x, 0)}px`;
      target.style.top = `${Math.max(y, 0)}px`;
    };

    const handleResizeEnd = () => {
      document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(frame => {
        frame.style.pointerEvents = 'auto';
      });
    };

    const dragMoveListener = (event: any) => {
      if (isMaximized) return;
      const target = event.target.closest('.window');
      let x = (parseFloat(target.style.left) || 0) + event.dx;
      let y = (parseFloat(target.style.top) || 0) + event.dy;

      const taskbarHeight = 52;
      const topbarHeight = document.getElementById('os-topbar') ? 40 : 0;
      const margin = WINDOW_DEFAULTS.VIEWPORT_MARGIN;

      const minX = -target.offsetWidth + margin;
      const maxX = window.innerWidth - margin;
      const minY = topbarHeight;
      const maxY = window.innerHeight - taskbarHeight;

      x = Math.min(Math.max(x, minX), maxX);
      y = Math.min(Math.max(y, minY), maxY);

      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    };

    if (resizableElement && draggableElement) {
      interact(resizableElement)
        .resizable({ edges: { left: true, right: true, bottom: true }, inertia: true })
        .on('resizestart', handleResizeStart)
        .on('resizemove', handleResizeMove)
        .on('resizeend', handleResizeEnd);

      interact(draggableElement)
        .draggable({
          inertia: true,
          autoScroll: true,
          listeners: { move: dragMoveListener },
        })
        .on('dragstart', () => {
          document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(frame => {
            frame.style.pointerEvents = 'none';
          });
        })
        .on('dragend', () => {
          document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(frame => {
            frame.style.pointerEvents = 'auto';
          });
        });
    }

    return () => {
      if (resizableElement) interact(resizableElement).unset();
      if (draggableElement) interact(draggableElement).unset();
    };
  }, [isMaximized]);

  const window_exit = () => onClose(windowData.id);

  const window_maximize = () => {
    const target = AppWindowRef.current;
    if (!target) return;

    if (!isMaximized) {
      setPrevBounds({
        left: parseFloat(target.style.left) || 0,
        top: parseFloat(target.style.top) || 0,
        width: parseFloat(target.style.width) || windowData.size.width,
        height: parseFloat(target.style.height) || windowData.size.height,
      });

      const topbarHeight = document.getElementById('os-topbar') ? 40 : 0;
      const taskbarHeight = 52;

      target.style.left = '0px';
      target.style.top = `${topbarHeight}px`;
      target.style.width = `${window.innerWidth}px`;
      target.style.height = `${window.innerHeight - topbarHeight - taskbarHeight}px`;
      setIsMaximized(true);
    } else {
      if (prevBounds) {
        target.style.left = `${prevBounds.left}px`;
        target.style.top = `${prevBounds.top}px`;
        target.style.width = `${prevBounds.width}px`;
        target.style.height = `${prevBounds.height}px`;
      }
      setIsMaximized(false);
    }
  };

  const window_handleActive = () => {
    document.querySelectorAll('.window').forEach(w => w.classList.remove(WINDOW_CLASSES.ACTIVE));
    AppWindowRef.current?.classList.add(WINDOW_CLASSES.ACTIVE);
  };

  return (
    <div
      id={windowData.id}
      className={`${WINDOW_CLASSES.WINDOW} ${isMaximized ? WINDOW_CLASSES.MAXIMIZED : ''}`}
      ref={AppWindowRef}
      style={{
        position: 'absolute',
        left: WINDOW_DEFAULTS.INITIAL_X,
        top: WINDOW_DEFAULTS.INITIAL_Y,
        width: windowData.size.width,
        height: windowData.size.height,
      }}
      onClick={window_handleActive}
      onFocus={window_handleActive}
      tabIndex={0}
    >
      <div className={WINDOW_CLASSES.BORDER}>
        <div ref={draggableRef}>
          <WindowHeader
            title={windowData.title}
            onDoubleClick={window_maximize}
            onMinimize={window_handleActive}
            onMaximize={window_maximize}
            onClose={window_exit}
          />
        </div>
        <WindowContent
          windowData={windowData}
          onFocus={window_handleActive}
        />
      </div>
    </div>
  );
};

export default Window;
