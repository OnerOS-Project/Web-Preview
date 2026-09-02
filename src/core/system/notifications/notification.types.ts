export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface SystemNotification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  createdAt: number;
  read: boolean;
}
