import React, { useRef, useEffect, useState, useCallback } from 'react';
import interact from 'interactjs';
import type { WindowProps, WindowBounds } from './window.types';
import { WINDOW_CLASSES, WINDOW_DEFAULTS } from './window.constants';
import WindowHeader from './WindowHeader';
import WindowContent from './WindowContent';

const SNAP_THRESHOLD = 20;

function getSnapMode(x: number, y: number, w: number, h: number): string | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isTop = y <= SNAP_THRESHOLD;
  const isBottom = y + h >= vh - 52 - SNAP_THRESHOLD;
  const isLeft = x <= SNAP_THRESHOLD;
  const isRight = x + w >= vw - SNAP_THRESHOLD;

  if (isLeft && isTop) return 'top-left';
  if (isRight && isTop) return 'top-right';
  if (isLeft && isBottom) return 'bottom-left';
  if (isRight && isBottom) return 'bottom-right';
  if (isLeft) return 'left';
  if (isRight) return 'right';
  return null;
}

const Window: React.FC<WindowProps> = ({ windowData, onClose, onFocus, onMinimize, onSnap }) => {
  const AppWindowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [transitionClass, setTransitionClass] = useState('window--opening');
  const [snapPreview, setSnapPreview] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTransitionClass(''), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (windowData.isClosing) {
      setTransitionClass('window--closing');
    }
  }, [windowData.isClosing]);

  useEffect(() => {
    if (AppWindowRef.current) {
      AppWindowRef.current.focus();
      AppWindowRef.current.classList.add(WINDOW_CLASSES.ACTIVE);
    }
  }, []);

  // Apply layout from WindowManager state
  useEffect(() => {
    const el = AppWindowRef.current;
    if (!el) return;

    const mode = windowData.layoutMode;
    if (mode && mode !== 'floating') {
      const topBarHeight = document.getElementById('os-topbar') ? 40 : 0;
      const taskbarHeight = 52;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const h = vh - topBarHeight - taskbarHeight;

      let bounds: WindowBounds;
      switch (mode) {
        case 'left':
          bounds = { left: 0, top: topBarHeight, width: vw / 2, height: h }; break;
        case 'right':
          bounds = { left: vw / 2, top: topBarHeight, width: vw / 2, height: h }; break;
        case 'maximized':
          bounds = { left: 0, top: topBarHeight, width: vw, height: h }; break;
        case 'top-left':
          bounds = { left: 0, top: topBarHeight, width: vw / 2, height: h / 2 }; break;
        case 'top-right':
          bounds = { left: vw / 2, top: topBarHeight, width: vw / 2, height: h / 2 }; break;
        case 'bottom-left':
          bounds = { left: 0, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 }; break;
        case 'bottom-right':
          bounds = { left: vw / 2, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 }; break;
        default: return;
      }

      el.style.left = `${bounds.left}px`;
      el.style.top = `${bounds.top}px`;
      el.style.width = `${bounds.width}px`;
      el.style.height = `${bounds.height}px`;
      setIsMaximized(mode === 'maximized');
    } else if (mode === 'floating' && windowData.prevBounds) {
      const pb = windowData.prevBounds;
      el.style.left = `${pb.left}px`;
      el.style.top = `${pb.top}px`;
      el.style.width = `${pb.width}px`;
      el.style.height = `${pb.height}px`;
      setIsMaximized(false);
    }
  }, [windowData.layoutMode, windowData.prevBounds]);

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
      const margin = WINDOW_DEFAULTS.VIEWPORT_MARGIN;

      const minX = -target.offsetWidth + margin;
      const maxX = window.innerWidth - margin;
      const minY = 0;
      const maxY = window.innerHeight - taskbarHeight;

      x = Math.min(Math.max(x, minX), maxX);
      y = Math.min(Math.max(y, minY), maxY);

      target.style.left = `${x}px`;
      target.style.top = `${y}px`;

      // Snap preview detection
      const snapMode = getSnapMode(x, y, target.offsetWidth, target.offsetHeight);
      setSnapPreview(snapMode);
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
          // Apply snap on drag end
          if (snapPreview && onSnap) {
            onSnap(windowData.id, snapPreview as any);
          }
          setSnapPreview(null);
        });
    }

    return () => {
      if (resizableElement) interact(resizableElement).unset();
      if (draggableElement) interact(draggableElement).unset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaximized, snapPreview]);

  const window_exit = useCallback(() => {
    onClose(windowData.id);
  }, [onClose, windowData.id]);

  const window_maximize = () => {
    if (onSnap) {
      onSnap(windowData.id, isMaximized ? 'floating' : 'maximized');
    }
  };

  const window_handleActive = useCallback(() => {
    document.querySelectorAll('.window').forEach(w => w.classList.remove(WINDOW_CLASSES.ACTIVE));
    AppWindowRef.current?.classList.add(WINDOW_CLASSES.ACTIVE);
    onFocus(windowData.id);
  }, [onFocus, windowData.id]);

  const isActive = windowData.isFocused === true;
  const isMinimized = windowData.isMinimized === true;

  const snapPreviewBounds = snapPreview ? (() => {
    const topBarHeight = document.getElementById('os-topbar') ? 40 : 0;
    const taskbarHeight = 52;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = vh - topBarHeight - taskbarHeight;
    switch (snapPreview) {
      case 'left': return { left: 0, top: topBarHeight, width: vw / 2, height: h };
      case 'right': return { left: vw / 2, top: topBarHeight, width: vw / 2, height: h };
      case 'top-left': return { left: 0, top: topBarHeight, width: vw / 2, height: h / 2 };
      case 'top-right': return { left: vw / 2, top: topBarHeight, width: vw / 2, height: h / 2 };
      case 'bottom-left': return { left: 0, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 };
      case 'bottom-right': return { left: vw / 2, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 };
      default: return null;
    }
  })() : null;

  return (
    <>
      {/* Snap Preview Overlay */}
      {snapPreviewBounds && (
        <div
          className="window-snap-preview"
          style={{
            position: 'absolute',
            left: snapPreviewBounds.left,
            top: snapPreviewBounds.top,
            width: snapPreviewBounds.width,
            height: snapPreviewBounds.height,
            background: 'var(--color-accent-subtle, rgba(71, 184, 149, 0.12))',
            border: '2px solid var(--color-accent, #47b895)',
            borderRadius: '8px',
            zIndex: 700,
            pointerEvents: 'none',
            transition: 'all 150ms ease',
          }}
        />
      )}

      <div
        id={windowData.id}
        className={`${WINDOW_CLASSES.WINDOW} ${isMaximized || windowData.layoutMode !== 'floating' ? 'window--snapped' : ''} ${transitionClass}`}
        ref={AppWindowRef}
        style={{
          position: 'absolute',
          left: WINDOW_DEFAULTS.INITIAL_X,
          top: WINDOW_DEFAULTS.INITIAL_Y,
          width: windowData.size.width,
          height: windowData.size.height,
          display: isMinimized ? 'none' : undefined,
          transition: transitionClass ? undefined : 'left 200ms ease, top 200ms ease, width 200ms ease, height 200ms ease',
        }}
        onClick={window_handleActive}
        onFocus={window_handleActive}
        tabIndex={0}
      >
        <div className={WINDOW_CLASSES.BORDER}>
          <div ref={draggableRef} style={{ position: 'relative', zIndex: 11 }}>
            <WindowHeader
              title={windowData.title}
              onDoubleClick={window_maximize}
              onMinimize={() => onMinimize(windowData.id)}
              onMaximize={window_maximize}
              onClose={window_exit}
            />
          </div>
          <WindowContent
            windowData={windowData}
            onFocus={window_handleActive}
          />
          {!isActive && (
            <div
              className="window-click-blocker"
              onClick={window_handleActive}
              onMouseDown={(e) => { e.preventDefault(); window_handleActive(); }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                cursor: 'default',
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Window;
