"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";

function openSSE(
  url: string,
  eventName: string,
  onMessage: (e: MessageEvent) => void,
  retryRef: { current: ReturnType<typeof setTimeout> | null },
): EventSource {
  const es = new EventSource(url);

  es.addEventListener(eventName, onMessage as EventListener);

  es.onerror = () => {
    es.close();
    retryRef.current = setTimeout(() => {
      openSSE(url, eventName, onMessage, retryRef);
    }, 5000);
  };

  return es;
}

export function useNotifications() {
  const { user, authority } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const notiEsRef    = useRef<EventSource | null>(null);
  const vacancyEsRef = useRef<EventSource | null>(null);
  const notiRetry    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vacancyRetry = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.id || authority !== "ADMIN") return;

    // 초기 알림 목록 fetch
    fetch(`/api/notifications`)
      .then((res) => res.json())
      .then((body) => {
        if (body.success) {
          setNotifications(body.data.notifications, body.data.unreadCount);
        }
      })
      .catch(() => {});

    // 알림 SSE (message 이벤트)
    notiEsRef.current = openSSE(
      `/api/notifications/subscribe`,
      "message",
      (e) => {
        try {
          const notification: Notification = JSON.parse(e.data);
          addNotification(notification);
        } catch {}
      },
      notiRetry,
    );

    // 결원 SSE (vacancy-update 이벤트)
    vacancyEsRef.current = openSSE(
      `/api/vacancies/subscribe`,
      "vacancy-update",
      (e) => {
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
      },
      vacancyRetry,
    );

    return () => {
      notiEsRef.current?.close();
      vacancyEsRef.current?.close();
      if (notiRetry.current)    clearTimeout(notiRetry.current);
      if (vacancyRetry.current) clearTimeout(vacancyRetry.current);
    };
  }, [user?.id]);
}
