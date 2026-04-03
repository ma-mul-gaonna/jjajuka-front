"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, User, Phone, Calendar, Shield, ChevronDown } from "lucide-react";
import { Grade, GRADE_ORDER, GRADE_META, EMPTY_FORM } from "./types";
import { useState } from "react";

interface AddEmployeeDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: typeof EMPTY_FORM) => void;
}

export default function AddEmployeeDrawer({ open, onClose, onAdd }: AddEmployeeDrawerProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!form.name.trim() || !form.role.trim()) return;
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
          {/* Backdrop */}
          <motion.div
            className="emp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          {/* Drawer */}
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
                <label className="emp-label"><User size={12} /> 이름 <span className="emp-required">*</span></label>
                <input
                  className="emp-input"
                  placeholder="홍길동"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* 등급 */}
              <div className="emp-field">
                <label className="emp-label"><Shield size={12} /> 등급 <span className="emp-required">*</span></label>
                <div className="emp-grade-select">
                  {GRADE_ORDER.map((g) => (
                    <motion.button
                      key={g}
                      className={`emp-grade-option ${form.grade === g ? "selected" : ""}`}
                      style={form.grade === g ? { background: GRADE_META[g].bg, color: GRADE_META[g].color, borderColor: GRADE_META[g].color + "60" } : {}}
                      onClick={() => setForm((f) => ({ ...f, grade: g }))}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className="emp-grade-opt-label">{g}등급</span>
                      <span className="emp-grade-opt-desc">{GRADE_META[g].desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 직무 */}
              <div className="emp-field">
                <label className="emp-label"><ChevronDown size={12} /> 직무 <span className="emp-required">*</span></label>
                <input
                  className="emp-input"
                  placeholder="예) 시니어, 미들, 주니어"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>

              {/* 연락처 */}
              <div className="emp-field">
                <label className="emp-label"><Phone size={12} /> 연락처</label>
                <input
                  className="emp-input"
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              {/* 입사일 */}
              <div className="emp-field">
                <label className="emp-label"><Calendar size={12} /> 입사일</label>
                <input
                  className="emp-input"
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="emp-drawer-footer">
              <button className="emp-cancel-btn" onClick={handleClose}>취소</button>
              <motion.button
                className="emp-submit-btn"
                onClick={handleAdd}
                disabled={!form.name.trim() || !form.role.trim()}
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
