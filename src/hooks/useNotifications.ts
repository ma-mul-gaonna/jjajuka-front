"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useNotifications() {
  const { user } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // 초기 알림 목록 fetch
    fetch(`${BASE_URL}/api/notifications?receiverId=${user.id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.success) {
          setNotifications(body.data.notifications, body.data.unreadCount);
        }
      })
      .catch(() => {
        // 백엔드 미연결 시 무시
      });

    // SSE 구독
    const es = new EventSource(
      `${BASE_URL}/api/notifications/subscribe?receiverId=${user.id}`,
      { withCredentials: true }
    );
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const notification: Notification = JSON.parse(e.data);
        addNotification(notification);
      } catch {
        // 파싱 실패 무시
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [user?.id]);
}
