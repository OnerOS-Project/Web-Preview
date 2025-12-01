import React, { useRef, useEffect, useState } from 'react';
import interact from 'interactjs';

interface SizeProps {
  width: number;
  height: number;
}

interface WindowProps {
  windowData: {
    id: string;
    title: string;
    size: SizeProps;
    src: string;
    type?: 'iframe' | 'embed';
  };
  onClose: (id: string) => void;
}

const Window: React.FC<WindowProps> = ({ windowData, onClose }) => {
  const AppWindowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const FrameRef = useRef<HTMLIFrameElement | HTMLEmbedElement>(null);

  // store previous position/size for restore after maximize
  const [prevBounds, setPrevBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (AppWindowRef.current) {
      AppWindowRef.current.focus();       // focus the new window
      AppWindowRef.current.classList.add("active"); // mark it active
    }
  }, []);

  useEffect(() => {
    const resizableElement = AppWindowRef.current;
    const draggableElement = draggableRef.current;

    const handleResizeStart = () => {
      if (isMaximized) return;
      // disable all interactions inside iframe/embed
      if (FrameRef.current) {
        FrameRef.current.style.pointerEvents = 'none';
      }
      window_handleActive();
    };

    const handleResizeMove = (event: any) => {
      if (isMaximized) return; // disable resize when maximized
      const target = event.target;
      const x = (parseFloat(target.style.left) || 0) + event.deltaRect.left;
      const y = (parseFloat(target.style.top) || 0) + event.deltaRect.top;

      // prevent resizing outside viewport
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
      // restore iframe/embed interactivity
      if (FrameRef.current) {
        FrameRef.current.style.pointerEvents = 'auto';
      }
    };

    const dragMoveListener = (event: any) => {
      if (isMaximized) return; // disable drag when maximized
      const target = event.target.closest('.window');
      let x = (parseFloat(target.style.left) || 0) + event.dx;
      let y = (parseFloat(target.style.top) || 0) + event.dy;

      // allow only 20px border outside viewport
      const maxX = window.innerWidth - 20;
      const maxY = window.innerHeight - 20;
      const minX = -target.offsetWidth + 20;
      const minY = -target.offsetHeight + 20;

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
        .on('dragstart', () => FrameRef.current?.style.setProperty('pointer-events', 'none'))
        .on('dragend', () => FrameRef.current?.style.setProperty('pointer-events', 'auto'));
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
      // save current bounds
      setPrevBounds({
        left: parseFloat(target.style.left) || 0,
        top: parseFloat(target.style.top) || 0,
        width: parseFloat(target.style.width) || windowData.size.width,
        height: parseFloat(target.style.height) || windowData.size.height,
      });

      // maximize
      target.style.left = `0px`;
      target.style.top = `0px`;
      target.style.width = `${window.innerWidth}px`;
      target.style.height = `${window.innerHeight}px`;
      setIsMaximized(true);
    } else {
      // restore
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
    document.querySelectorAll(".window").forEach(w => w.classList.remove('active'));
    AppWindowRef.current?.classList.add('active');
  };

  return (
  <div
    id={windowData.id}
    className={`window ${isMaximized ? 'maximized' : ''}`}
    ref={AppWindowRef}
    style={{
      position: 'absolute',
      left: 50,
      top: 50,
      width: windowData.size.width,
      height: windowData.size.height,
    }}
    onClick={window_handleActive}
    onFocus={window_handleActive}
    tabIndex={0}   // makes div focusable
  >
    <div className="border-window">
      <div className="draggable-window" ref={draggableRef} onDoubleClick={window_maximize}>
        <span>{windowData.title}</span>
        <div className="actions">
          <div style={{position: 'relative', bottom: '9px'}} onClick={window_handleActive}>⎯</div>
          <div onClick={window_maximize}>❐</div>
          <div style={{position: 'relative', bottom: '1px'}} onClick={window_exit}>⤬</div>
        </div>
      </div>
      {windowData.type === 'embed' ? (
        <embed
          src={windowData.src}
          ref={FrameRef as React.RefObject<HTMLEmbedElement>}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={windowData.title || `window-${windowData.id}`}
          onFocus={window_handleActive} // also mark active when embed gets focus
        />
      ) : (
        <iframe
          src={windowData.src}
          ref={FrameRef as React.RefObject<HTMLIFrameElement>}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={windowData.title || `window-${windowData.id}`}
          onFocus={window_handleActive} // mark active when iframe gets focus
        />
      )}
    </div>
  </div>
  );
};

export default Window;
