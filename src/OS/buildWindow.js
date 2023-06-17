import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';

function Window({ windowData }) {
  const [windowSize, setWindowSize] = useState(windowData.size);
  const [windowPosition, setWindowPosition] = useState(windowData.position);
  const embedRef = useRef(null);

  const handleDragStop = (e, d) => {
    const isDraggingEmbed = e.target.tagName.toLowerCase() === 'embed';
    if (isDraggingEmbed) {
      return; // Do not allow dragging when interacting with the embed element
    }

    const { parentNode } = e.target;
    const parentRect = parentNode.getBoundingClientRect();
    const newX = Math.max(d.x, parentRect.left);
    const newY = Math.max(d.y, parentRect.top);
    const maxWidth = parentRect.width - windowSize.width;
    const maxHeight = parentRect.height - windowSize.height;
    const clampedX = Math.min(newX, parentRect.left + maxWidth);
    const clampedY = Math.min(newY, parentRect.top + maxHeight);
    setWindowPosition({ x: clampedX, y: clampedY });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const { width, height } = ref.style;
    setWindowSize({
      width,
      height,
      ...position,
    });
  };

  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'solid 1px #ddd',
    background: '#f0f0f0',
  };

  const resizeHandleStyles = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.2)',
  };

  return (
    <Rnd
      style={style}
      size={windowSize}
      position={windowPosition}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="#os-background"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      // dragHandleClassName="window-drag-handle"
    >
      <div style={resizeHandleStyles} className="window-resize-handle" />
      <embed
        ref={embedRef}
        src={windowData.src}
        style={{ width: '100%', height: '100%' }}
        draggable="false" // Disable dragging inside the embed element
      />
    </Rnd>
  );
}

export default Window;
