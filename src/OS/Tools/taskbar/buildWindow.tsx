import React, { useRef, useEffect } from 'react';
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
    type?: 'iframe' | 'embed'; // wybór rodzaju ramki
  };
  onClose: (id: string) => void;
}

const Window: React.FC<WindowProps> = ({ windowData, onClose }) => {
  const AppWindowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const FrameRef = useRef<HTMLIFrameElement | HTMLEmbedElement>(null);

  useEffect(() => {
    const resizableElement = AppWindowRef.current;
    const draggableElement = draggableRef.current;

    const handleResizeStart = () => {
      FrameRef.current?.style.setProperty('pointer-events', 'none');
      window_handleActive();
    };

    const handleResizeMove = (event: any) => {
      const target = event.target;
      const x = (parseFloat(target.style.left) || 0) + event.deltaRect.left;
      const y = (parseFloat(target.style.top) || 0) + event.deltaRect.top;

      target.style.width = `${event.rect.width}px`;
      target.style.height = `${event.rect.height}px`;
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
    };

    const handleResizeEnd = () => {
      FrameRef.current?.style.setProperty('pointer-events', 'auto');
    };

    const dragMoveListener = (event: any) => {
      const target = event.target.closest('.window');
      const x = (parseFloat(target.style.left) || 0) + event.dx;
      const y = (parseFloat(target.style.top) || 0) + event.dy;

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
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: 'parent',
              endOnly: true,
            }),
            interact.modifiers.snap({
              targets: [
                interact.snappers.grid({ x: 20, y: 20 }) // siatka co 20px
              ],
              range: 15, // odległość w której okno „przyciąga się”
              relativePoints: [{ x: 0, y: 0 }]
            })
          ],
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
  }, []);

  const window_exit = () => onClose(windowData.id);
  const window_maximize = (event: any) => {
    event.target.closest('.window').classList.toggle('maximized');
  };
  const window_handleActive = () => {
    document.querySelectorAll(".window").forEach(w => w.classList.remove('active'));
    AppWindowRef.current?.classList.add('active');
  };

  return (
    <div
      id={windowData.id}
      className="window"
      ref={AppWindowRef}
      style={{
        position: 'absolute',
        left: 50,
        top: 50,
        width: windowData.size.width,
        height: windowData.size.height,
      }}
      onClick={window_handleActive}
    >
      <div className="border-window">
        <div className="draggable-window" ref={draggableRef}>
          <span>{windowData.title}</span>
          <div className="actions">
            <div onClick={window_handleActive}>⎯</div>
            <div onClick={window_maximize}>❐</div>
            <div onClick={window_exit}>⤬</div>
          </div>
        </div>
        {windowData.type === 'embed' ? (
          <embed
            src={windowData.src}
            ref={FrameRef as React.RefObject<HTMLEmbedElement>}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={windowData.title || `window-${windowData.id}`}
          />
        ) : (
          <iframe
            src={windowData.src}
            ref={FrameRef as React.RefObject<HTMLIFrameElement>}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={windowData.title || `window-${windowData.id}`}
          />
        )}
      </div>
    </div>
  );
};

export default Window;
