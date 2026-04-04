import { create } from "zustand";

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  notiType: string;
  isRead: boolean;
  createdAt: string;
  relatedId: number;
  relatedType: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  addNotification: (notification: Notification) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
