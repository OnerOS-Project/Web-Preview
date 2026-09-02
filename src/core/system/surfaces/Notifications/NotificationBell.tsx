import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { subscribeNotifications, getUnreadCount } from '../../notifications';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(getUnreadCount());
    return subscribeNotifications(() => {
      setUnreadCount(getUnreadCount());
    });
  }, []);

  return (
    <div className="fv-notif-area">
      <button
        className="fv-notif-bell"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="fv-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      <NotificationPanel isOpen={isOpen} onToggle={() => setIsOpen(false)} />
    </div>
  );
};

export default NotificationBell;
