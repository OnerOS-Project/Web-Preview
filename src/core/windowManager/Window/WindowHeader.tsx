import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons';
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
        <div className={WINDOW_CLASSES.ACTION_MINIMIZE} onClick={onMinimize}>
          <FontAwesomeIcon icon={faMinus} />
        </div>
        <div className={WINDOW_CLASSES.ACTION_MAXIMIZE} onClick={onMaximize}>
          <FontAwesomeIcon icon={faWindowMaximize} />
        </div>
        <div className={WINDOW_CLASSES.ACTION_CLOSE} onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </div>
      </div>
    </div>
  );
};

export default WindowHeader;
