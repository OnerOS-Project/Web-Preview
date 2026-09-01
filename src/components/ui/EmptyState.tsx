import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          fontSize: '40px',
          marginBottom: '12px',
          opacity: 0.5,
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        margin: '0 0 6px 0',
        fontSize: 'var(--text-md)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          maxWidth: '300px',
        }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
