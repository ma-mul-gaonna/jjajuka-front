"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, User, Phone, Calendar, ChevronDown, Lock, AtSign } from "lucide-react";
import { EMPTY_FORM, POSITION_OPTIONS, GRADE_META } from "./types";
import { useState } from "react";

interface AddEmployeeDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: typeof EMPTY_FORM) => void;
}

export default function AddEmployeeDrawer({ open, onClose, onAdd }: AddEmployeeDrawerProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  const selectedPos = POSITION_OPTIONS.find((p) => p.value === form.position)!;
  const canSubmit = form.name.trim() && form.loginId.trim() && form.password.trim();

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd(form);
    setForm(EMPTY_FORM);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="emp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="emp-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="emp-drawer-header">
              <h3 className="emp-drawer-title">직원 추가</h3>
              <button className="emp-drawer-close" onClick={handleClose}>
                <X size={16} />
              </button>
            </div>

            <div className="emp-drawer-body">
              {/* 이름 */}
              <div className="emp-field">
                <label className="emp-label">
                  <User size={12} /> 이름 <span className="emp-required">*</span>
                </label>
                <input
                  className="emp-input"
                  placeholder="홍길동"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* 아이디 */}
              <div className="emp-field">
                <label className="emp-label">
                  <AtSign size={12} /> 아이디 <span className="emp-required">*</span>
                </label>
                <input
                  className="emp-input"
                  placeholder="hong123"
                  value={form.loginId}
                  onChange={(e) => setForm((f) => ({ ...f, loginId: e.target.value }))}
                />
              </div>

              {/* 비밀번호 */}
              <div className="emp-field">
                <label className="emp-label">
                  <Lock size={12} /> 비밀번호 <span className="emp-required">*</span>
                </label>
                <input
                  className="emp-input"
                  type="password"
                  placeholder="8자 이상"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>

              {/* 직급 */}
              <div className="emp-field">
                <label className="emp-label">
                  <ChevronDown size={12} /> 직급
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {POSITION_OPTIONS.map((p) => (
                    <motion.button
                      key={p.value}
                      className={`emp-grade-option ${form.position === p.value ? "selected" : ""}`}
                      style={
                        form.position === p.value
                          ? {
                              background: GRADE_META[p.grade].bg,
                              color: GRADE_META[p.grade].color,
                              borderColor: GRADE_META[p.grade].color + "60",
                            }
                          : {}
                      }
                      onClick={() => setForm((f) => ({ ...f, position: p.value }))}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className="emp-grade-opt-label">{p.label}</span>
                      <span className="emp-grade-opt-desc">{p.grade}등급</span>
                    </motion.button>
                  ))}
                </div>
                {form.position && (
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                    선택된 직급: {selectedPos.label} ({selectedPos.grade}등급)
                  </p>
                )}
              </div>

              {/* 연락처 */}
              <div className="emp-field">
                <label className="emp-label">
                  <Phone size={12} /> 연락처
                </label>
                <input
                  className="emp-input"
                  placeholder="010-0000-0000"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
              </div>

              {/* 입사일 */}
              <div className="emp-field">
                <label className="emp-label">
                  <Calendar size={12} /> 입사일
                </label>
                <input
                  className="emp-input"
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="emp-drawer-footer">
              <button className="emp-cancel-btn" onClick={handleClose}>취소</button>
              <motion.button
                className="emp-submit-btn"
                onClick={handleAdd}
                disabled={!canSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus size={14} />
                추가하기
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
