"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/store/notificationStore";

interface HeaderProps {
  title: string;
  role?: "admin" | "worker";
}

const NOTI_TYPE_LABEL: Record<string, string> = {
  SWAP_RESULT:      "근무 교환",
  VACANCY_ALERT:    "결원 알림",
  REQUEST_APPROVED: "요청 승인",
  REQUEST_REJECTED: "요청 거절",
};

export default function Header({ title, role = "admin" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markOneRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) markAllRead();
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        {/* 관리자만 알림 벨 표시 */}
        {role === "admin" && (
          <div ref={dropRef} style={{ position: "relative" }}>
            <button
              className="header-icon-btn header-notification-btn"
              aria-label="알림"
              onClick={handleOpen}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="noti-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  className="noti-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="noti-header">
                    <span className="noti-title">알림</span>
                    {notifications.length > 0 && (
                      <button className="noti-clear" onClick={markAllRead}>모두 읽음</button>
                    )}
                  </div>

                  <div className="noti-list">
                    {notifications.length === 0 ? (
                      <div className="noti-empty">새로운 알림이 없습니다</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.notificationId}
                          className={`noti-item ${n.isRead ? "read" : ""}`}
                          onClick={() => markOneRead(n.notificationId)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="noti-item-top">
                            <span className="noti-type-badge">
                              {NOTI_TYPE_LABEL[n.notiType] ?? n.notiType}
                            </span>
                          </div>
                          <p className="noti-message">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="header-avatar">J</div>
      </div>
    </header>
  );
}
