/**
 * Notification Store
 *
 * Lightweight reactive notification state.
 * Uses a simple subscriber pattern — no external state library.
 */

import type { SystemNotification, NotificationType } from './notification.types';

type Listener = (notifications: SystemNotification[]) => void;

let notifications: SystemNotification[] = [];
let idCounter = 0;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(fn => fn([...notifications]));
}

function generateId(): string {
  return `notif-${Date.now()}-${++idCounter}`;
}

export function subscribeNotifications(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getNotifications(): SystemNotification[] {
  return [...notifications];
}

export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length;
}

export function notify(title: string, message?: string, type: NotificationType = 'info'): SystemNotification {
  const notif: SystemNotification = {
    id: generateId(),
    title,
    message,
    type,
    createdAt: Date.now(),
    read: false,
  };
  notifications = [notif, ...notifications];
  notifyListeners();
  return notif;
}

export function dismissNotification(id: string): void {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
}

export function clearNotifications(): void {
  notifications = [];
  notifyListeners();
}

export function markAsRead(id: string): void {
  notifications = notifications.map(n =>
    n.id === id ? { ...n, read: true } : n
  );
  notifyListeners();
}

export function markAllAsRead(): void {
  notifications = notifications.map(n => ({ ...n, read: true }));
  notifyListeners();
}
