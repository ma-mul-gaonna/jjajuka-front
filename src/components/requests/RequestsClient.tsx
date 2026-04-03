"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, Clock, FileText, ArrowLeftRight } from "lucide-react";
import {
  ShiftRequest,
  RequestType,
  ShiftType,
  INITIAL_REQUESTS,
  EMPTY_FORM,
  REQUEST_TYPE_META,
  SHIFT_META,
  STATUS_META,
} from "./types";

const REQUEST_TYPES: RequestType[] = ["결원 요청", "대타 요청", "근무 교환"];
const SHIFT_TYPES: ShiftType[] = ["오전", "오후", "야간"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

export default function RequestsClient() {
  const [requests, setRequests] = useState<ShiftRequest[]>(INITIAL_REQUESTS);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const pending  = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const handleSubmit = () => {
    if (!form.date) return;
    const newReq: ShiftRequest = {
      id: Date.now(),
      type: form.type,
      date: form.date,
      shift: form.shift,
      memo: form.memo.trim(),
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRequests((prev) => [newReq, ...prev]);
    setForm(EMPTY_FORM);
    setShowDrawer(false);
  };

  const cancelRequest = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <>
      {/* Header */}
      <div className="rules-header">
        <div>
          <h2 className="rules-title">결원 / 대타 요청</h2>
          <p className="rules-subtitle">근무 변경이 필요할 때 요청을 등록하세요</p>
        </div>
        <motion.button
          className="emp-add-btn"
          onClick={() => setShowDrawer(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={14} />
          요청 등록
        </motion.button>
      </div>

      {/* Stats */}
      <motion.div className="req-stats" {...fadeUp(0.04)}>
        {[
          { label: "전체",   value: requests.length, color: undefined, bg: undefined },
          { label: "대기 중", value: pending,  color: "#92400E", bg: "#FFFBEB" },
          { label: "승인됨",  value: approved, color: "#065F46", bg: "#ECFDF5" },
          { label: "거절됨",  value: rejected, color: "#991B1B", bg: "#FEF2F2" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="emp-stat-item"
            style={s.bg ? { background: s.bg } : {}}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.05 }}
          >
            <span className="emp-stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</span>
            <span className="emp-stat-label">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Request List */}
      <motion.div className="req-list" {...fadeUp(0.12)}>
        <AnimatePresence initial={false}>
          {requests.length === 0 ? (
            <motion.div className="emp-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              등록된 요청이 없습니다
            </motion.div>
          ) : (
            requests.map((req, i) => {
              const typeMeta   = REQUEST_TYPE_META[req.type];
              const shiftMeta  = SHIFT_META[req.shift];
              const statusMeta = STATUS_META[req.status];
              return (
                <motion.div
                  key={req.id}
                  className="req-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22 }}
                  layout
                >
                  {/* Top row */}
                  <div className="req-card-top">
                    <div className="req-badges">
                      <span
                        className="req-badge"
                        style={{ color: typeMeta.color, background: typeMeta.bg }}
                      >
                        <ArrowLeftRight size={11} />
                        {req.type}
                      </span>
                      <span
                        className="req-badge"
                        style={{ color: shiftMeta.color, background: shiftMeta.bg }}
                      >
                        <Clock size={11} />
                        {req.shift}
                      </span>
                    </div>
                    <span
                      className="req-status"
                      style={{ color: statusMeta.color, background: statusMeta.bg }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="req-date">
                    <Calendar size={13} />
                    {req.date}
                  </div>

                  {/* Memo */}
                  {req.memo && (
                    <div className="req-memo">
                      <FileText size={12} />
                      {req.memo}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="req-card-footer">
                    <span className="req-created">신청일 {req.createdAt}</span>
                    {req.status === "pending" && (
                      <motion.button
                        className="req-cancel-btn"
                        onClick={() => cancelRequest(req.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        취소
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              className="emp-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDrawer(false); setForm(EMPTY_FORM); }}
            />
            <motion.div
              className="emp-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="emp-drawer-header">
                <h3 className="emp-drawer-title">요청 등록</h3>
                <button
                  className="emp-drawer-close"
                  onClick={() => { setShowDrawer(false); setForm(EMPTY_FORM); }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="emp-drawer-body">
                {/* 요청 유형 */}
                <div className="emp-field">
                  <label className="emp-label"><ArrowLeftRight size={12} /> 요청 유형</label>
                  <div className="req-type-select">
                    {REQUEST_TYPES.map((t) => {
                      const meta = REQUEST_TYPE_META[t];
                      const selected = form.type === t;
                      return (
                        <motion.button
                          key={t}
                          className={`req-type-option ${selected ? "selected" : ""}`}
                          style={selected ? { background: meta.bg, color: meta.color, borderColor: meta.color + "60" } : {}}
                          onClick={() => setForm((f) => ({ ...f, type: t }))}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {t}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 날짜 */}
                <div className="emp-field">
                  <label className="emp-label"><Calendar size={12} /> 날짜 <span className="emp-required">*</span></label>
                  <input
                    className="emp-input"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>

                {/* 근무 유형 */}
                <div className="emp-field">
                  <label className="emp-label"><Clock size={12} /> 근무 유형</label>
                  <div className="req-shift-select">
                    {SHIFT_TYPES.map((s) => {
                      const meta = SHIFT_META[s];
                      const selected = form.shift === s;
                      return (
                        <motion.button
                          key={s}
                          className={`req-shift-option ${selected ? "selected" : ""}`}
                          style={selected ? { background: meta.bg, color: meta.color, borderColor: meta.color + "60" } : {}}
                          onClick={() => setForm((f) => ({ ...f, shift: s }))}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {s}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 메모 */}
                <div className="emp-field">
                  <label className="emp-label"><FileText size={12} /> 메모 (선택)</label>
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
                <button
                  className="emp-cancel-btn"
                  onClick={() => { setShowDrawer(false); setForm(EMPTY_FORM); }}
                >
                  취소
                </button>
                <motion.button
                  className="emp-submit-btn"
                  onClick={handleSubmit}
                  disabled={!form.date}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={14} />
                  등록하기
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
