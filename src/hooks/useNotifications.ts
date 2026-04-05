"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";

function openSSE(
  url: string,
  eventName: string,
  onMessage: (e: MessageEvent) => void,
  retryRef: { current: ReturnType<typeof setTimeout> | null },
  attempt = 0,
): EventSource {
  const MAX_RETRIES = 3;
  const es = new EventSource(url);

  es.addEventListener(eventName, onMessage as EventListener);

  es.onerror = () => {
    es.close();
    if (attempt < MAX_RETRIES) {
      retryRef.current = setTimeout(() => {
        openSSE(url, eventName, onMessage, retryRef, attempt + 1);
      }, 5000);
    }
  };

  return es;
}

export function useNotifications() {
  const { user, authority } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const vacancyEsRef = useRef<EventSource | null>(null);
  const vacancyRetry = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.id || authority !== "ADMIN") return;

    // 초기 알림 목록 fetch
    fetch(`/api/notifications`)
      .then((res) => res.ok ? res.json() : null)
      .then((body) => {
        if (body?.success) {
          setNotifications(body.data.notifications, body.data.unreadCount);
        }
      })
      .catch(() => {});

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

          // 수락/거절 시 swap 상태 갱신 이벤트 발행
          if (vacancy.status === "ACCEPTED" || vacancy.status === "REJECTED") {
            window.dispatchEvent(new CustomEvent("swap-status-updated"));
          }
        } catch {}
      },
      vacancyRetry,
    );

    return () => {
      vacancyEsRef.current?.close();
      if (vacancyRetry.current) clearTimeout(vacancyRetry.current);
    };
  }, [user?.id]);
}
