"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";

export function useNotifications() {
  const { user, authority } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const notiEsRef = useRef<EventSource | null>(null);
  const vacancyEsRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?.id || authority !== "ADMIN") return;

    // 초기 알림 목록 fetch
    fetch(`/api/notifications?receiverId=${user.id}`)
      .then((res) => res.json())
      .then((body) => {
        if (body.success) {
          setNotifications(body.data.notifications, body.data.unreadCount);
        }
      })
      .catch(() => {});

    // 알림 SSE 구독
    const notiEs = new EventSource(`/api/notifications/subscribe?receiverId=${user.id}`);
    notiEsRef.current = notiEs;

    notiEs.onmessage = (e) => {
      try {
        const notification: Notification = JSON.parse(e.data);
        addNotification(notification);
      } catch {}
    };
    notiEs.onerror = () => notiEs.close();

    // 결원 SSE 구독
    const vacancyEs = new EventSource(`/api/vacancies/subscribe`);
    vacancyEsRef.current = vacancyEs;

    vacancyEs.addEventListener("message", (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (!payload?.vacancy) return;

        const { vacancy } = payload;
        const notification: Notification = {
          notificationId: vacancy.vacancyId,
          title: payload.title ?? "새로운 결원 요청",
          message: payload.message ?? "",
          notiType: "VACANCY_ALERT",
          isRead: false,
          createdAt: vacancy.createdAt ?? new Date().toISOString(),
          relatedId: vacancy.vacancyId,
          relatedType: "VACANCY",
        };
        addNotification(notification);
      } catch {}
    });
    vacancyEs.onerror = () => vacancyEs.close();

    return () => {
      notiEs.close();
      vacancyEs.close();
    };
  }, [user?.id]);
}
