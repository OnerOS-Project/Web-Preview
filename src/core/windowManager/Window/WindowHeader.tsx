import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faXmark, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons';
import type { WindowHeaderProps } from './window.types';
import { WINDOW_CLASSES } from './window.constants';

const WindowHeader: React.FC<WindowHeaderProps> = ({
  title,
  externalUrl,
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
        {externalUrl && (
          <div
            className="window-action-external"
            onClick={(e) => { e.stopPropagation(); window.open(externalUrl, '_blank'); }}
            title="Open in browser"
          >
            <FontAwesomeIcon icon={faUpRightFromSquare} />
          </div>
        )}
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
