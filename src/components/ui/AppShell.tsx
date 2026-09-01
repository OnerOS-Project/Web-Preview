import React from 'react';

export interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({ children, header, sidebar, className = '' }) => {
  return (
    <div
      className={`app-shell ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'var(--font-family-sans)',
        fontSize: 'var(--text-base)',
        color: 'var(--text-primary)',
        background: 'var(--bg-secondary)',
      }}
    >
      {header && (
        <div
          className="app-shell-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-tertiary)',
            minHeight: '48px',
            flexShrink: 0,
          }}
        >
          {header}
        </div>
      )}
      <div
        className="app-shell-body"
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {sidebar && (
          <div
            className="app-shell-sidebar"
            style={{
              width: '200px',
              borderRight: '1px solid var(--border-default)',
              background: 'var(--bg-primary)',
              overflow: 'auto',
              flexShrink: 0,
            }}
          >
            {sidebar}
          </div>
        )}
        <div
          className="app-shell-content"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
