import React from 'react';
import type { WindowHeaderProps } from './window.types';
import { WINDOW_CLASSES } from './window.constants';

const WindowHeader: React.FC<WindowHeaderProps> = ({
  title,
  onDoubleClick,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div
      className={WINDOW_CLASSES.DRAGGABLE}
      onDoubleClick={onDoubleClick}
    >
      <span>{title}</span>
      <div className={WINDOW_CLASSES.ACTIONS}>
        <div className={WINDOW_CLASSES.ACTION_MINIMIZE} onClick={onMinimize}>⎯</div>
        <div className={WINDOW_CLASSES.ACTION_MAXIMIZE} onClick={onMaximize}>❐</div>
        <div className={WINDOW_CLASSES.ACTION_CLOSE} onClick={onClose}>⤬</div>
      </div>
    </div>
  );
};

export default WindowHeader;
