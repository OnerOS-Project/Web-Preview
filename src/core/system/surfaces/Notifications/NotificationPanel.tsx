import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faInfoCircle, faExclamationTriangle, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { subscribeNotifications, getNotifications, dismissNotification, clearNotifications, markAllAsRead } from '../../notifications';
import type { SystemNotification } from '../../notifications';

const TYPE_ICONS = {
  info: faInfoCircle,
  success: faCheck,
  warning: faExclamationTriangle,
  error: faCircleExclamation,
} as const;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onToggle }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
    return subscribeNotifications(setNotifications);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fv-notif-panel" role="dialog" aria-label="Notifications">
      <div className="fv-notif-header">
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <button className="fv-notif-clear" onClick={() => { clearNotifications(); markAllAsRead(); }}>
            Clear all
          </button>
        )}
      </div>

      <div className="fv-notif-list">
        {notifications.length === 0 ? (
          <div className="fv-notif-empty">No notifications</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`fv-notif-item ${!n.read ? 'fv-notif-item--unread' : ''}`}
              role="article"
              aria-label={n.title}
            >
              <div className={`fv-notif-icon fv-notif-icon--${n.type}`}>
                <FontAwesomeIcon icon={TYPE_ICONS[n.type]} />
              </div>
              <div className="fv-notif-content">
                <div className="fv-notif-title">{n.title}</div>
                {n.message && <div className="fv-notif-message">{n.message}</div>}
                <div className="fv-notif-time">{timeAgo(n.createdAt)}</div>
              </div>
              <button
                className="fv-notif-dismiss"
                onClick={() => dismissNotification(n.id)}
                aria-label={`Dismiss notification: ${n.title}`}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
