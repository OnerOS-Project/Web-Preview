import React, { useRef, useEffect, useState, useCallback } from 'react';
import interact from 'interactjs';
import type { WindowProps, WindowBounds } from './window.types';
import { WINDOW_CLASSES, WINDOW_DEFAULTS } from './window.constants';
import WindowHeader from './WindowHeader';
import WindowContent from './WindowContent';

const SNAP_THRESHOLD = 4;
const SNAP_PREVIEW_DELAY = 150;

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

function computeBounds(mode: string): WindowBounds | null {
  const topBarHeight = document.getElementById('os-topbar') ? 40 : 0;
  const taskbarHeight = 52;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const h = vh - topBarHeight - taskbarHeight;

  switch (mode) {
    case 'left':       return { left: 0, top: topBarHeight, width: vw / 2, height: h };
    case 'right':      return { left: vw / 2, top: topBarHeight, width: vw / 2, height: h };
    case 'maximized':  return { left: 0, top: topBarHeight, width: vw, height: h };
    case 'top-left':   return { left: 0, top: topBarHeight, width: vw / 2, height: h / 2 };
    case 'top-right':  return { left: vw / 2, top: topBarHeight, width: vw / 2, height: h / 2 };
    case 'bottom-left':  return { left: 0, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 };
    case 'bottom-right': return { left: vw / 2, top: topBarHeight + h / 2, width: vw / 2, height: h / 2 };
    default: return null;
  }
}

const Window: React.FC<WindowProps> = ({ windowData, onClose, onFocus, onMinimize, onSnap }) => {
  const AppWindowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const [transitionClass, setTransitionClass] = useState('window--opening');
  const [snapPreview, setSnapPreview] = useState<string | null>(null);
  const snapDelayRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSnapRef = useRef<string | null>(null);

  const layoutMode = windowData.layoutMode || 'floating';
  const isMaximized = layoutMode === 'maximized';
  const isSnapped = layoutMode !== 'floating';

  // Opening animation
  useEffect(() => {
    const timer = setTimeout(() => setTransitionClass(''), 200);
    return () => clearTimeout(timer);
  }, []);

  // Closing animation
  useEffect(() => {
    if (windowData.isClosing) setTransitionClass('window--closing');
  }, [windowData.isClosing]);

  // Initial mount focus
  useEffect(() => {
    if (AppWindowRef.current) {
      AppWindowRef.current.focus();
      AppWindowRef.current.classList.add(WINDOW_CLASSES.ACTIVE);
    }
  }, []);

  // Apply layout from WindowManager state (layoutMode)
  useEffect(() => {
    const el = AppWindowRef.current;
    if (!el) return;

    if (layoutMode === 'floating') {
      // Restore to prevBounds
      const pb = windowData.prevBounds;
      if (pb) {
        el.style.left = `${pb.left}px`;
        el.style.top = `${pb.top}px`;
        el.style.width = `${pb.width}px`;
        el.style.height = `${pb.height}px`;
      }
      return;
    }

    const bounds = computeBounds(layoutMode);
    if (!bounds) return;

    el.style.left = `${bounds.left}px`;
    el.style.top = `${bounds.top}px`;
    el.style.width = `${bounds.width}px`;
    el.style.height = `${bounds.height}px`;
  }, [layoutMode, windowData.prevBounds]);

  // interact.js setup — re-bind when isMaximized changes
  useEffect(() => {
    const resizableElement = AppWindowRef.current;
    const draggableElement = draggableRef.current;

    const handleResizeStart = () => {
      if (isMaximized) return;
      document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(f => f.style.pointerEvents = 'none');
      window_handleActive();
    };

    const handleResizeMove = (event: any) => {
      if (isMaximized) return;
      const t = event.target;
      const x = (parseFloat(t.style.left) || 0) + event.deltaRect.left;
      const y = (parseFloat(t.style.top) || 0) + event.deltaRect.top;
      t.style.width = `${Math.min(event.rect.width, window.innerWidth - x)}px`;
      t.style.height = `${Math.min(event.rect.height, window.innerHeight - y)}px`;
      t.style.left = `${Math.max(x, 0)}px`;
      t.style.top = `${Math.max(y, 0)}px`;
    };

    const handleResizeEnd = () => {
      document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(f => f.style.pointerEvents = 'auto');
    };

    const dragMoveListener = (event: any) => {
      const target = event.target.closest('.window');
      let x = (parseFloat(target.style.left) || 0) + event.dx;
      let y = (parseFloat(target.style.top) || 0) + event.dy;

      const taskbarHeight = 52;
      const margin = WINDOW_DEFAULTS.VIEWPORT_MARGIN;
      x = Math.min(Math.max(x, -target.offsetWidth + margin), window.innerWidth - margin);
      y = Math.min(Math.max(y, 0), window.innerHeight - taskbarHeight);

      target.style.left = `${x}px`;
      target.style.top = `${y}px`;

      // Delayed snap preview — only show after cursor dwells at edge
      const snapMode = getSnapMode(x, y, target.offsetWidth, target.offsetHeight);
      if (snapMode !== pendingSnapRef.current) {
        pendingSnapRef.current = snapMode;
        if (snapDelayRef.current) clearTimeout(snapDelayRef.current);
        if (snapMode) {
          snapDelayRef.current = setTimeout(() => {
            setSnapPreview(snapMode);
          }, SNAP_PREVIEW_DELAY);
        } else {
          setSnapPreview(null);
        }
      }
    };

    if (resizableElement && draggableElement) {
      interact(resizableElement)
        .resizable({ edges: { left: true, right: true, bottom: true }, inertia: true })
        .on('resizestart', handleResizeStart)
        .on('resizemove', handleResizeMove)
        .on('resizeend', handleResizeEnd);

      interact(draggableElement)
        .draggable({ inertia: true, autoScroll: true, listeners: { move: dragMoveListener } })
        .on('dragstart', (event) => {
          document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(f => f.style.pointerEvents = 'none');

          // If maximized, restore to centered floating on drag start
          if (isMaximized && onSnap) {
            const target = event.target.closest('.window');
            const w = parseFloat(target?.style.width) || windowData.size.width;
            const h = parseFloat(target?.style.height) || windowData.size.height;
            const left = (window.innerWidth - w) / 2;
            const top = Math.max(0, (window.innerHeight - h) / 3);
            if (target) {
              target.style.width = `${w}px`;
              target.style.height = `${h}px`;
              target.style.left = `${left}px`;
              target.style.top = `${top}px`;
            }
            onSnap(windowData.id, 'floating');
          }
        })
        .on('dragend', () => {
          document.querySelectorAll<HTMLElement>('.window iframe, .window embed').forEach(f => f.style.pointerEvents = 'auto');
          if (snapPreview && onSnap) onSnap(windowData.id, snapPreview as any);
          setSnapPreview(null);
        });
    }

    return () => {
      if (resizableElement) interact(resizableElement).unset();
      if (draggableElement) interact(draggableElement).unset();
      if (snapDelayRef.current) clearTimeout(snapDelayRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaximized, snapPreview]);

  const window_exit = useCallback(() => {
    onClose(windowData.id);
  }, [onClose, windowData.id]);

  const window_maximize = useCallback(() => {
    if (onSnap) onSnap(windowData.id, isMaximized ? 'floating' : 'maximized');
  }, [onSnap, windowData.id, isMaximized]);

  const window_handleActive = useCallback(() => {
    document.querySelectorAll('.window').forEach(w => w.classList.remove(WINDOW_CLASSES.ACTIVE));
    AppWindowRef.current?.classList.add(WINDOW_CLASSES.ACTIVE);
    onFocus(windowData.id);
  }, [onFocus, windowData.id]);

  const isActive = windowData.isFocused === true;
  const isMinimized = windowData.isMinimized === true;

  const snapPreviewBounds = snapPreview ? computeBounds(snapPreview) : null;

  return (
    <>
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
        className={`${WINDOW_CLASSES.WINDOW} ${isSnapped ? 'window--snapped' : ''} ${transitionClass}`}
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
