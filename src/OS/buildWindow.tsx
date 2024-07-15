import React, { useRef, useEffect } from 'react';
import interact from 'interactjs';

interface WindowProps {
  windowData: {
    id: number;
    title: string;
    src: string;
  };
  onClose: (id: number) => void;
}

const Window: React.FC<WindowProps> = ({ windowData, onClose }) => {
  const AppWindowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const WindowFrameRef = useRef<HTMLEmbedElement>(null);
  const movePositionWindowX = useRef<number>(0);
  const movePositionWindowY = useRef<number>(0);

  useEffect(() => {
    const resizableElement = AppWindowRef.current;
    const draggableElement = draggableRef.current;

    const handleResizeStart = (event: any) => {
      const target = event.target;
      target.setAttribute('data-x', movePositionWindowX.current || 0);
      target.setAttribute('data-y', movePositionWindowY.current || 0);
      WindowFrameRef.current?.style.setProperty('pointer-events', 'none');
      document.querySelectorAll("embed").forEach(embed => {
        embed.style.pointerEvents = 'none';
      });
      window_handleActive();
    };

    const handleResizeMove = (event: any) => {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;

      target.style.width = `${event.rect.width}px`;
      target.style.height = `${event.rect.height}px`;
      target.style.transform = `translate(${x}px, ${y}px)`;

      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    };

    const handleResizeEnd = () => {
      WindowFrameRef.current?.style.setProperty('pointer-events', 'auto');
      document.querySelectorAll("embed").forEach(embed => {
        embed.style.pointerEvents = 'auto';
      });
    };

    const handleDragMoveStart = () => {
      WindowFrameRef.current?.style.setProperty('pointer-events', 'none');
    };

    const handleDragMoveEnd = () => {
      WindowFrameRef.current?.style.setProperty('pointer-events', 'auto');
    };

    const dragMoveListener = (event: any) => {
      const target = event.target.closest('.window');
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      target.style.transform = `translate(${x}px, ${y}px)`;
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
      movePositionWindowX.current = x;
      movePositionWindowY.current = y;
    };

    if (resizableElement && draggableElement) {
      interact(resizableElement)
        .resizable({
          edges: { left: true, right: true, bottom: true },
          inertia: true,
        })
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
          ],
          autoScroll: true,
          listeners: {
            move: dragMoveListener,
          },
        })
        .on('dragstart', handleDragMoveStart)
        .on('dragend', handleDragMoveEnd);
    }

    return () => {
      if (resizableElement) {
        interact(resizableElement).unset();
      }
      if (draggableElement) {
        interact(draggableElement).unset();
      }
    };
  }, []);

  const window_exit = () => {
    onClose(windowData.id);
  };

  const window_maximize = (event: any) => {
    event.target.closest('.window').classList.toggle('maximized');
  };

  const window_handleMoveStart = (event: any) => {
    event.target.closest('.window').classList.add('moved');
  };

  const window_handleMoveStop = (event: any) => {
    event.target.closest('.window').classList.remove('moved');
  };

  const window_handleActive = () => {
    document.querySelectorAll(".window").forEach(window => {
      window.classList.remove('active')
    });
    AppWindowRef.current?.classList.add('active')
  }

  return (
    <div className="window" ref={AppWindowRef} style={{ transform: 'translate(0px, 0px)' }} onClick={window_handleActive} onMouseDown={window_handleMoveStart} onMouseUp={window_handleMoveStop}>
      <div className='border-window' onFocusCapture={window_handleActive} onFocus={window_handleActive}>
        <div className="draggable-window" ref={draggableRef}>
          <span>{windowData.title}</span>
          <div className="actions">
            <div id='a1' onClick={window_handleActive}>⎯</div>
            <div id='a2' onClick={window_maximize}>❐</div>
            <div id='a3' onClick={window_exit}>⤬</div>
          </div>
        </div>
        <embed src={windowData.src} ref={WindowFrameRef}></embed>
      </div>
    </div>
  );
};

export default Window;
