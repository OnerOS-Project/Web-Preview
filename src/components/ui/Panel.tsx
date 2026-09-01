import React from 'react';

export interface PanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Panel: React.FC<PanelProps> = ({ children, title, className = '', style }) => {
  return (
    <div
      className={`panel ${className}`}
      style={{
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          className="panel-header"
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-default)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </div>
      )}
      <div className="panel-body" style={{ padding: '14px' }}>
        {children}
      </div>
    </div>
  );
};

export default Panel;
