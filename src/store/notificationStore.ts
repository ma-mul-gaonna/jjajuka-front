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

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notificationId: 50,
    title: "교대 근무 응답 알림",
    message: "김철수님이 2026-04-15(주간) 근무 교대를 수락했습니다.",
    notiType: "SWAP_RESULT",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    relatedId: 100,
    relatedType: "SWAP",
  },
  {
    notificationId: 48,
    title: "결원 발생 알림",
    message: "2026-04-20(야간) 근무에 결원이 발생했습니다.",
    notiType: "VACANCY_ALERT",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    relatedId: 5,
    relatedType: "VACANCY",
  },
  {
    notificationId: 47,
    title: "요청 승인 알림",
    message: "이서연님의 대타 요청이 승인되었습니다.",
    notiType: "REQUEST_APPROVED",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    relatedId: 22,
    relatedType: "REQUEST",
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,

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
