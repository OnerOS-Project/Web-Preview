import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTriangleExclamation, faCheckCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import './SystemAlert.css';

export type AlertType = 'info' | 'warning' | 'success';

interface AlertState {
  message: string;
  type: AlertType;
  visible: boolean;
}

let setAlertStateFn: React.Dispatch<React.SetStateAction<AlertState>> | null = null;

export function systemAlert(message: string, type: AlertType = 'info') {
  if (setAlertStateFn) {
    setAlertStateFn({ message, type, visible: true });
  }
}

const ICONS: Record<AlertType, any> = {
  info: faInfoCircle,
  warning: faTriangleExclamation,
  success: faCheckCircle,
};

const SystemAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({ message: '', type: 'info', visible: false });

  useEffect(() => {
    setAlertStateFn = setAlert;
    return () => { setAlertStateFn = null; };
  }, []);

  const close = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (alert.visible) {
      const timer = setTimeout(close, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.visible, close]);

  return (
    <>
      {children}
      {alert.visible && (
        <div className="system-alert-overlay" onClick={close}>
          <div className={`system-alert system-alert-${alert.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="system-alert-icon">
              <FontAwesomeIcon icon={ICONS[alert.type]} />
            </div>
            <div className="system-alert-message">{alert.message}</div>
            <button className="system-alert-close" onClick={close}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export { SystemAlertProvider };
export default systemAlert;
