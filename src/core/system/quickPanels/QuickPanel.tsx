import React, { useRef, useEffect, useCallback } from 'react';

export type SystemPanelId = 'clock' | 'weather' | 'notifications' | null;

export interface QuickPanelProps {
  id: SystemPanelId;
  activePanel: SystemPanelId;
  onOpen: (id: SystemPanelId) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  align?: 'left' | 'right' | 'center';
  className?: string;
  children: React.ReactNode;
}

const QuickPanel: React.FC<QuickPanelProps> = ({
  id,
  activePanel,
  onOpen,
  onClose,
  triggerRef,
  align = 'center',
  className = '',
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = activePanel === id;
  const posStyle = usePanelPosition(triggerRef, align as 'left' | 'right' | 'center');

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      panelRef.current && !panelRef.current.contains(e.target as Node) &&
      triggerRef.current && !triggerRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`fv-quick-panel ${className}`}
      style={posStyle}
      role="dialog"
      aria-label="System panel"
    >
      {children}
    </div>
  );
};

export function usePanelPosition(triggerRef: React.RefObject<HTMLElement>, align: 'left' | 'right' | 'center' = 'center') {
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const panelWidth = 320;

    let left: number | undefined;
    let right: number | undefined;

    if (align === 'right') {
      right = Math.max(8, vw - rect.right);
    } else if (align === 'left') {
      left = Math.max(8, rect.left);
    } else {
      left = rect.left + rect.width / 2 - panelWidth / 2;
      left = Math.max(8, Math.min(left, vw - panelWidth - 8));
    }

    setStyle({
      position: 'fixed',
      top: '44px',
      ...(left !== undefined ? { left } : {}),
      ...(right !== undefined ? { right } : {}),
      width: panelWidth,
    });
  }, [triggerRef, align]);

  return style;
}

export default QuickPanel;
