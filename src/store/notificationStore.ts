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
  markOneRead: (notificationId: number) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markOneRead: (notificationId) => {
    const { notifications } = get();
    const target = notifications.find((n) => n.notificationId === notificationId);
    if (!target || target.isRead) return;

    fetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" }).catch(() => {});

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: () => {
    const { notifications } = get();
    const unread = notifications.filter((n) => !n.isRead);

    unread.forEach((n) => {
      fetch(`/api/notifications/${n.notificationId}/read`, { method: "PATCH" }).catch(() => {});
    });

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
