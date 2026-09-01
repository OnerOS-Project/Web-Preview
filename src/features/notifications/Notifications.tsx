import React from 'react';

export interface NotificationsProps {
  notifications?: any[];
  onDismiss?: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications = [], onDismiss }) => {
  return (
    <div className="os-notifications">
      {notifications.map((notification) => (
        <div key={notification.id} className="os-notification">
          <span>{notification.message}</span>
          <button onClick={() => onDismiss?.(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
