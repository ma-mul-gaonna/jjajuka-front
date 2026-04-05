"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Calendar, Check, X } from "lucide-react";

const API_TO_SHIFT: Record<string, string> = {
  DAY:     "오전",
  MORNING: "오전",
  EVENING: "오후",
  NIGHT:   "야간",
};

interface SwapRequest {
  swapRequestId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  requestedAt: string;
  requester: { id: number; name: string };
  requestSchedule: {
    scheduleId: number;
    workDate: string;
    shiftType: string;
    scheduleStatus: string;
  };
}

interface MyScheduleItem {
  id: number;
  shiftType: string;
  status: string;
  workDate: string;
}

export default function ShiftSwapReceivedClient() {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  // 수락 모달
  const [acceptModal, setAcceptModal] = useState<SwapRequest | null>(null);
  const [mySchedules, setMySchedules] = useState<MyScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/shift-swap/received")
      .then((r) => r.json())
      .then((json) => {
        const list: SwapRequest[] = Array.isArray(json) ? json : (json.data ?? []);
        setSwapRequests(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openAcceptModal = (req: SwapRequest) => {
    setAcceptModal(req);
    setSelectedScheduleId(null);
    setScheduleLoading(true);

    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    fetch(`/api/work-schedules/${ym}`)
      .then((r) => r.json())
      .then((json) => setMySchedules(Array.isArray(json) ? json : (json.data ?? [])))
      .catch(() => {})
      .finally(() => setScheduleLoading(false));
  };

  const handleAccept = async () => {
    if (!acceptModal || !selectedScheduleId) return;
    setActing(acceptModal.swapRequestId);
    try {
      const res = await fetch(`/api/shift-swap/${acceptModal.swapRequestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapStatus: "ACCEPTED", targetScheduleId: selectedScheduleId }),
      });
      if (res.ok) {
        setSwapRequests((prev) =>
          prev.map((r) => r.swapRequestId === acceptModal.swapRequestId ? { ...r, status: "ACCEPTED" } : r)
        );
        setAcceptModal(null);
      }
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (swapRequestId: number) => {
    setActing(swapRequestId);
    try {
      const res = await fetch(`/api/shift-swap/${swapRequestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapStatus: "REJECTED" }),
      });
      if (res.ok) {
        setSwapRequests((prev) =>
          prev.map((r) => r.swapRequestId === swapRequestId ? { ...r, status: "REJECTED" } : r)
        );
      }
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      <div className="rules-header">
        <div>
          <h2 className="rules-title">받은 교대 요청</h2>
          <p className="rules-subtitle">나에게 온 근무 교대 요청을 확인하고 수락하거나 거절하세요</p>
        </div>
      </div>

      <div className="req-list">
        {loading ? (
          <div className="emp-empty">불러오는 중...</div>
        ) : swapRequests.length === 0 ? (
          <div className="emp-empty">받은 교대 요청이 없습니다</div>
        ) : (
          <AnimatePresence initial={false}>
            {swapRequests.map((req, i) => {
              const shiftLabel = API_TO_SHIFT[req.requestSchedule.shiftType] ?? req.requestSchedule.shiftType;
              const isPending  = req.status === "PENDING";
              return (
                <motion.div key={req.swapRequestId} className="req-card"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22 }} layout
                >
                  <div className="req-card-top">
                    <div className="req-badges">
                      <span className="req-badge" style={{ color: "#2563EB", background: "#EFF6FF" }}>
                        <ArrowLeftRight size={11} /> 교대 요청
                      </span>
                      <span className="req-badge" style={{ color: "#6B7280", background: "#F9FAFB" }}>
                        {req.requester.name}
                      </span>
                    </div>
                    <span className="req-status" style={
                      req.status === "ACCEPTED" ? { color: "#065F46", background: "#ECFDF5" }
                      : req.status === "REJECTED" ? { color: "#991B1B", background: "#FEF2F2" }
                      : { color: "#92400E", background: "#FFFBEB" }
                    }>
                      {req.status === "ACCEPTED" ? "수락됨" : req.status === "REJECTED" ? "거절됨" : "대기 중"}
                    </span>
                  </div>

                  <div className="req-date">
                    <Calendar size={13} /> {req.requestSchedule.workDate}
                    <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-secondary)" }}>({shiftLabel})</span>
                  </div>

                  <div className="req-created" style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    요청일 {req.requestedAt}
                  </div>

                  {isPending && (
                    <div className="req-card-footer" style={{ marginTop: 10 }}>
                      <span />
                      <div style={{ display: "flex", gap: 6 }}>
                        <motion.button className="req-cancel-btn"
                          style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
                          onClick={() => handleReject(req.swapRequestId)}
                          disabled={acting === req.swapRequestId}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        ><X size={12} />거절</motion.button>
                        <motion.button className="emp-submit-btn"
                          style={{ padding: "6px 14px", fontSize: 12 }}
                          onClick={() => openAcceptModal(req)}
                          disabled={acting === req.swapRequestId}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        >
                          <Check size={12} />
                          {acting === req.swapRequestId ? "처리 중..." : "수락"}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 수락 모달 */}
      <AnimatePresence>
        {acceptModal && (
          <>
            <motion.div className="emp-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !acting && setAcceptModal(null)}
            />
            <motion.div className="emp-confirm-modal"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              transformTemplate={({ y, scale }) => `translate(-50%, calc(-50% + ${y})) scale(${scale})`}
            >
              <p className="emp-confirm-title">교대 수락</p>
              <p className="emp-confirm-desc">
                교대할 내 근무를 선택하세요
              </p>

              <div className="emp-field" style={{ marginBottom: 16 }}>
                {scheduleLoading ? (
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>불러오는 중...</span>
                ) : mySchedules.length === 0 ? (
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>이번 달 근무가 없습니다</span>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {mySchedules.map((s) => {
                      const label    = API_TO_SHIFT[s.shiftType] ?? s.shiftType;
                      const selected = selectedScheduleId === s.id;
                      return (
                        <motion.button key={s.id} type="button"
                          onClick={() => setSelectedScheduleId(s.id)}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          style={{
                            width: 90, padding: "8px 0", borderRadius: 8,
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                            textAlign: "center" as const,
                            border: selected ? "1.5px solid #111" : "1.5px solid var(--border)",
                            background: selected ? "#111" : "var(--gray-100)",
                            color: selected ? "#fff" : "var(--text-primary)",
                          }}
                        >
                          <div>{s.workDate.slice(5)}</div>
                          <div style={{ fontWeight: 400, opacity: 0.7, fontSize: 11 }}>{label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="emp-confirm-actions">
                <button className="emp-cancel-btn" onClick={() => setAcceptModal(null)} disabled={!!acting}>취소</button>
                <motion.button
                  className="emp-submit-btn"
                  onClick={handleAccept}
                  disabled={!selectedScheduleId || !!acting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                >
                  {acting ? "처리 중..." : "수락"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
