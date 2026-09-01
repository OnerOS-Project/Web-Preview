import React from 'react';

export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, title, description, className = '' }) => {
  return (
    <div className={`section ${className}`} style={{ marginBottom: '20px' }}>
      {title && (
        <h3 style={{
          margin: '0 0 4px 0',
          fontSize: 'var(--text-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text-primary)',
        }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{
          margin: '0 0 12px 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};

export default Section;
