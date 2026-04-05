"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Calendar, Clock, User, ArrowLeftRight } from "lucide-react";

const API_TO_SHIFT: Record<string, string> = {
  DAY:     "오전",
  MORNING: "오전",
  EVENING: "오후",
  NIGHT:   "야간",
};

interface SwapDetail {
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

type ActionState = "idle" | "loading" | "accepted" | "rejected";

export default function ShiftSwapPage() {
  const { swapId } = useParams<{ swapId: string }>();
  const [swap, setSwap] = useState<SwapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ActionState>("idle");

  // 수락 시 내 스케줄 선택
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [mySchedules, setMySchedules] = useState<MyScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/shift-swap/received")
      .then((r) => r.json())
      .then((json) => {
        const list: SwapDetail[] = Array.isArray(json) ? json : (json.data ?? []);
        const found = list.find((s) => String(s.swapRequestId) === swapId);
        setSwap(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [swapId]);

  const openAccept = () => {
    setShowSchedulePicker(true);
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
    if (!selectedScheduleId) return;
    setAction("loading");
    try {
      const res = await fetch(`/api/shift-swap/${swapId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapStatus: "ACCEPTED", targetScheduleId: selectedScheduleId }),
      });
      if (res.ok) setAction("accepted");
      else setAction("idle");
    } catch {
      setAction("idle");
    }
  };

  const handleReject = async () => {
    setAction("loading");
    try {
      const res = await fetch(`/api/shift-swap/${swapId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapStatus: "REJECTED" }),
      });
      if (res.ok) setAction("rejected");
      else setAction("idle");
    } catch {
      setAction("idle");
    }
  };

  const shiftLabel = swap ? (API_TO_SHIFT[swap.requestSchedule.shiftType] ?? swap.requestSchedule.shiftType) : "";

  return (
    <div style={{
      minHeight: "100vh", background: "#f9fafb",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 440,
          background: "#fff", borderRadius: 16,
          border: "1.5px solid #e5e7eb",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ArrowLeftRight size={15} color="#2563eb" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>교대 요청</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>근무 교대 요청이 왔어요</h1>
        </div>

        {/* 콘텐츠 */}
        <div style={{ padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "24px 0" }}>
              불러오는 중...
            </div>
          ) : !swap ? (
            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "24px 0" }}>
              요청을 찾을 수 없습니다.
            </div>
          ) : (
            <>
              {/* 요청자 */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", borderRadius: 10,
                background: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={18} color="#6b7280" />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>요청자</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{swap.requester.name}</div>
                </div>
              </div>

              {/* 근무 정보 */}
              <div style={{
                padding: "14px 16px", borderRadius: 10,
                background: "#eff6ff", border: "1px solid #bfdbfe", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Calendar size={13} color="#2563eb" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1e40af" }}>{swap.requestSchedule.workDate}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={13} color="#2563eb" />
                  <span style={{ fontSize: 13, color: "#1e40af" }}>{shiftLabel} 근무</span>
                </div>
              </div>

              {/* 스케줄 선택 (수락 클릭 후) */}
              <AnimatePresence>
                {showSchedulePicker && action === "idle" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden", marginBottom: 16 }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 8 }}>
                      교대할 내 근무를 선택하세요
                    </p>
                    {scheduleLoading ? (
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>불러오는 중...</span>
                    ) : mySchedules.length === 0 ? (
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>이번 달 근무가 없습니다</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {mySchedules.map((s) => {
                          const label    = API_TO_SHIFT[s.shiftType] ?? s.shiftType;
                          const selected = selectedScheduleId === s.id;
                          return (
                            <motion.button key={s.id}
                              onClick={() => setSelectedScheduleId(s.id)}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                              style={{
                                width: 90, padding: "8px 0", borderRadius: 8,
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                                textAlign: "center" as const,
                                border: selected ? "1.5px solid #111" : "1.5px solid #e5e7eb",
                                background: selected ? "#111" : "#f9fafb",
                                color: selected ? "#fff" : "#111",
                              }}
                            >
                              <div>{s.workDate.slice(5)}</div>
                              <div style={{ fontWeight: 400, opacity: 0.7, fontSize: 11 }}>{label}</div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 버튼 / 결과 */}
              <AnimatePresence mode="wait">
                {action === "accepted" ? (
                  <motion.div key="accepted"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "14px", borderRadius: 10,
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      color: "#065f46", fontWeight: 600, fontSize: 14,
                    }}
                  >
                    <CheckCircle2 size={18} color="#10b981" /> 수락 완료
                  </motion.div>
                ) : action === "rejected" ? (
                  <motion.div key="rejected"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "14px", borderRadius: 10,
                      background: "#fef2f2", border: "1px solid #fecaca",
                      color: "#991b1b", fontWeight: 600, fontSize: 14,
                    }}
                  >
                    <XCircle size={18} color="#ef4444" /> 거절 완료
                  </motion.div>
                ) : swap.status !== "PENDING" ? (
                  <motion.div key="already"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      textAlign: "center", padding: "14px", borderRadius: 10,
                      background: "#f9fafb", color: "#6b7280", fontSize: 13,
                    }}
                  >
                    이미 처리된 요청입니다 ({swap.status === "ACCEPTED" ? "수락됨" : "거절됨"})
                  </motion.div>
                ) : (
                  <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: "flex", gap: 10 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleReject}
                      disabled={action === "loading"}
                      style={{
                        flex: 1, padding: "13px", borderRadius: 10,
                        border: "1.5px solid #fecaca", background: "#fef2f2",
                        color: "#991b1b", fontSize: 14, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <XCircle size={15} /> 거절
                    </motion.button>
                    {showSchedulePicker ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleAccept}
                        disabled={!selectedScheduleId || action === "loading"}
                        style={{
                          flex: 1, padding: "13px", borderRadius: 10,
                          border: "none",
                          background: selectedScheduleId ? "#111" : "#e5e7eb",
                          color: selectedScheduleId ? "#fff" : "#9ca3af",
                          fontSize: 14, fontWeight: 600, cursor: selectedScheduleId ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <CheckCircle2 size={15} /> {action === "loading" ? "처리 중..." : "수락 확인"}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={openAccept}
                        style={{
                          flex: 1, padding: "13px", borderRadius: 10,
                          border: "none", background: "#111",
                          color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <CheckCircle2 size={15} /> 수락
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
