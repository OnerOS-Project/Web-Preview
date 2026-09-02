import React, { useRef, useEffect, useCallback } from 'react';

export type SystemPanelId = 'clock' | 'weather' | 'notifications' | null;

export interface QuickPanelProps {
  id: SystemPanelId;
  activePanel: SystemPanelId;
  onOpen: (id: SystemPanelId) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  className?: string;
  children: React.ReactNode;
}

const QuickPanel: React.FC<QuickPanelProps> = ({
  id,
  activePanel,
  onOpen,
  onClose,
  triggerRef,
  className = '',
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = activePanel === id;

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
      role="dialog"
      aria-label="System panel"
    >
      {children}
    </div>
  );
};

export function usePanelPosition(triggerRef: React.RefObject<HTMLElement>) {
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const panelWidth = 320;

    let left = rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(8, Math.min(left, vw - panelWidth - 8));

    const isRight = rect.right > vw / 2;
    const align = isRight ? 'right' : 'left';

    setStyle({
      position: 'fixed',
      top: '44px',
      ...(align === 'right'
        ? { right: Math.max(8, vw - rect.right) }
        : { left }),
      width: panelWidth,
    });
  }, [triggerRef]);

  return style;
}

export default QuickPanel;
