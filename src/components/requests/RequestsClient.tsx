"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, FileText, ArrowLeftRight } from "lucide-react";
import { STATUS_META } from "./types";

const API_TO_SHIFT: Record<string, string> = {
  DAY:     "오전",
  MORNING: "오전",
  EVENING: "오후",
  NIGHT:   "야간",
};

interface MyScheduleItem {
  id: number;
  shiftType: string;
  status: string;
  workDate: string;
}

interface VacancyRequest {
  id: number;
  date: string;
  shiftLabel: string;
  memo: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

const EMPTY_FORM = { scheduleId: null as number | null, workDate: "", shiftLabel: "", memo: "" };

export default function RequestsClient() {
  const [requests, setRequests]     = useState<VacancyRequest[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [mySchedule, setMySchedule]           = useState<MyScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    fetch("/api/vacancy/me")
      .then((r) => r.json())
      .then((json) => {
        const list: { vacancyId: number; schedule?: { workDate: string; shiftType: string }; reason?: string; status?: string; createdAt?: string }[] =
          json.data?.vacancies ?? (Array.isArray(json) ? json : []);
        setRequests(
          list.map((v) => ({
            id:         v.vacancyId,
            date:       v.schedule?.workDate ?? "",
            shiftLabel: v.schedule?.shiftType ? (API_TO_SHIFT[v.schedule.shiftType] ?? v.schedule.shiftType) : "",
            memo:       v.reason ?? "",
            status:     (v.status ?? "PENDING").toLowerCase() as "pending" | "approved" | "rejected",
            createdAt:  (v.createdAt ?? "").slice(0, 10),
          }))
        );
      })
      .catch(() => {});
  }, []);

  const pending  = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const closeDrawer = () => { setShowDrawer(false); setForm(EMPTY_FORM); };

  const openDrawer = () => {
    setForm(EMPTY_FORM);
    setShowDrawer(true);
    setScheduleLoading(true);

    const now = new Date();
    const curYm  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevYm = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();

    fetch(`/api/work-schedules/${curYm}`)
      .then((r) => r.json())
      .then((json) => {
        const list: MyScheduleItem[] = Array.isArray(json) ? json : (json.data ?? []);
        if (list.length > 0) { setMySchedule(list); return; }
        return fetch(`/api/work-schedules/${prevYm}`)
          .then((r) => r.json())
          .then((j) => setMySchedule(Array.isArray(j) ? j : (j.data ?? [])));
      })
      .catch(() => {})
      .finally(() => setScheduleLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.scheduleId || !form.memo.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vacancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: form.scheduleId, reason: form.memo.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        const created = json.data ?? json;
        setRequests((prev) => [{
          id:         created.vacancyId ?? Date.now(),
          date:       form.workDate,
          shiftLabel: form.shiftLabel,
          memo:       form.memo.trim(),
          status:     "pending",
          createdAt:  new Date().toISOString().slice(0, 10),
        }, ...prev]);
        closeDrawer();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="rules-header">
        <div>
          <h2 className="rules-title">결원 / 대타 요청</h2>
          <p className="rules-subtitle">근무 변경이 필요할 때 요청을 등록하세요</p>
        </div>
        <motion.button className="emp-add-btn" onClick={openDrawer} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Plus size={14} /> 결원 요청 등록
        </motion.button>
      </div>

      <motion.div className="req-stats" {...fadeUp(0.04)}>
        {[
          { label: "전체",    value: requests.length },
          { label: "대기 중", value: pending,  color: "#92400E", bg: "#FFFBEB" },
          { label: "승인됨",  value: approved, color: "#065F46", bg: "#ECFDF5" },
          { label: "거절됨",  value: rejected, color: "#991B1B", bg: "#FEF2F2" },
        ].map((s, i) => (
          <motion.div key={s.label} className="emp-stat-item" style={s.bg ? { background: s.bg } : {}}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.05 }}
          >
            <span className="emp-stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</span>
            <span className="emp-stat-label">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="req-list" {...fadeUp(0.12)}>
        <AnimatePresence initial={false}>
          {requests.length === 0 ? (
            <motion.div className="emp-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              등록된 요청이 없습니다
            </motion.div>
          ) : requests.map((req, i) => {
            const statusMeta = STATUS_META[req.status];
            return (
              <motion.div key={req.id} className="req-card"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }} layout
              >
                <div className="req-card-top">
                  <span className="req-badge" style={{ color: "#DC2626", background: "#FEF2F2" }}>
                    <ArrowLeftRight size={11} /> 결원 요청
                  </span>
                  <span className="req-status" style={{ color: statusMeta.color, background: statusMeta.bg }}>
                    {statusMeta.label}
                  </span>
                </div>
                <div className="req-date">
                  <Calendar size={13} />{req.date}
                  {req.shiftLabel && <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-secondary)" }}>({req.shiftLabel})</span>}
                </div>
                {req.memo && <div className="req-memo"><FileText size={12} />{req.memo}</div>}
                <div className="req-card-footer">
                  <span className="req-created">신청일 {req.createdAt}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ── 결원 요청 등록 Drawer ──────────────────────────── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div className="emp-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.div className="emp-drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="emp-drawer-header">
                <h3 className="emp-drawer-title">결원 요청 등록</h3>
                <button className="emp-drawer-close" onClick={closeDrawer}><X size={16} /></button>
              </div>

              <div className="emp-drawer-body">
                <div className="emp-field">
                  <label className="emp-label"><Calendar size={12} /> 날짜 <span className="emp-required">*</span></label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {scheduleLoading ? (
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>근무일 불러오는 중...</span>
                    ) : mySchedule.length === 0 ? (
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>근무 일정 없음</span>
                    ) : mySchedule.map((s) => {
                      const label    = API_TO_SHIFT[s.shiftType] ?? s.shiftType;
                      const day      = s.workDate.slice(5);
                      const selected = form.scheduleId === s.id;
                      return (
                        <motion.button key={s.id} type="button"
                          onClick={() => setForm((f) => ({ ...f, scheduleId: s.id, workDate: s.workDate, shiftLabel: label }))}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          style={{
                            padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            border: selected ? "1.5px solid #111" : "1.5px solid var(--border)",
                            background: selected ? "#111" : "var(--gray-100)",
                            color: selected ? "#fff" : "var(--text-primary)",
                          }}
                        >
                          {day} <span style={{ fontWeight: 400, opacity: 0.7 }}>{label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="emp-field">
                  <label className="emp-label"><FileText size={12} /> 메모 <span className="emp-required">*</span></label>
                  <textarea
                    className="emp-input req-memo-input"
                    placeholder="사유나 추가 내용을 입력하세요"
                    value={form.memo}
                    rows={3}
                    onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="emp-drawer-footer">
                <button className="emp-cancel-btn" onClick={closeDrawer}>취소</button>
                <motion.button className="emp-submit-btn" onClick={handleSubmit}
                  disabled={!form.scheduleId || !form.memo.trim() || submitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                >
                  <Plus size={14} />
                  {submitting ? "등록 중..." : "등록하기"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
