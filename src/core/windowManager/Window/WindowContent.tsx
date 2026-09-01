import React, { useRef } from 'react';
import type { WindowContentProps } from './window.types';

const WindowContent: React.FC<WindowContentProps> = ({ windowData, onFocus }) => {
  const FrameRef = useRef<HTMLIFrameElement | HTMLEmbedElement | null>(null);

  if (windowData.type === 'internal-component' && windowData.component) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        {React.createElement(windowData.component)}
      </div>
    );
  }

  if (windowData.type === 'embed') {
    return (
      <embed
        src={windowData.src}
        ref={FrameRef as React.RefObject<HTMLEmbedElement>}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title={windowData.title || `window-${windowData.id}`}
        onFocus={onFocus}
      />
    );
  }

  return (
    <iframe
      src={windowData.src}
      ref={FrameRef as React.RefObject<HTMLIFrameElement>}
      style={{ width: '100%', height: '100%', border: 'none' }}
      title={windowData.title || `window-${windowData.id}`}
      onFocus={onFocus}
    />
  );
};

export default WindowContent;
