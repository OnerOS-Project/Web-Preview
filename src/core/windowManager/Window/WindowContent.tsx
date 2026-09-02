import React, { Suspense, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import type { WindowContentProps } from './window.types';

const WindowContent: React.FC<WindowContentProps> = ({ windowData, onFocus }) => {
  const FrameRef = useRef<HTMLIFrameElement | HTMLEmbedElement | null>(null);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #0f1115)',
        color: 'var(--text-primary, #f0f0f3)',
        gap: '12px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: 32, color: 'var(--color-warning, #f59e0b)', opacity: 0.8 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>OS Error</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted, #8b8d94)', maxWidth: 300, lineHeight: 1.5 }}>
          Your device doesn&apos;t support this application. The content could not be loaded.
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted, #8b8d94)', opacity: 0.6 }}>
          {windowData.title || windowData.src || 'Unknown application'}
        </div>
      </div>
    );
  }

  if (windowData.type === 'internal-component' && windowData.component) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <Suspense
          fallback={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: 'var(--bg-primary, #0f1115)',
              color: 'var(--text-muted, #8b8d94)',
              fontSize: '14px',
            }}>
              Loading...
            </div>
          }
        >
          {React.createElement(windowData.component)}
        </Suspense>
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
      onError={() => setHasError(true)}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  );
};

export default WindowContent;
