"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import {
  Employee,
  Grade,
  MemberAPI,
  mapMember,
  GRADE_ORDER,
  GRADE_META,
  EMPTY_FORM,
} from "./types";
import GradeBadge from "./GradeBadge";
import AddEmployeeDrawer from "./AddEmployeeDrawer";

export default function EmployeesClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<MemberAPI[]>;
      })
      .then((data) => setEmployees(data.map(mapMember)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<Grade | "ALL">("ALL");
  const [showPanel, setShowPanel] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Filter
  const filtered = employees.filter((e) => {
    const matchSearch = e.name.includes(search) || e.role.includes(search);
    const matchGrade = gradeFilter === "ALL" || e.grade === gradeFilter;
    return matchSearch && matchGrade;
  });

  // Stats
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    A: employees.filter((e) => e.grade === "A").length,
    B: employees.filter((e) => e.grade === "B").length,
    C: employees.filter((e) => e.grade === "C").length,
  };

  const cycleGrade = (id: number) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const idx = GRADE_ORDER.indexOf(e.grade);
        return { ...e, grade: GRADE_ORDER[(idx + 1) % GRADE_ORDER.length] };
      }),
    );
  };

  const toggleStatus = (id: number) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "active" ? "leave" : "active" }
          : e,
      ),
    );
  };

  const addEmployee = async (form: typeof EMPTY_FORM) => {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        loginId: form.loginId.trim(),
        password: form.password,
        authority: "USER",
        position: form.position.trim() || null,
        skills: form.skills,
        phoneNumber: form.phoneNumber.trim() || null,
        hireDate: form.hireDate || null,
        employmentStatus: "ACTIVE",
      }),
    });
    if (!res.ok) return;
    const created: MemberAPI = await res.json();
    setEmployees((prev) => [mapMember(created), ...prev]);
    setShowPanel(false);
  };

  const deleteEmployee = async (id: number) => {
    setDeleteId(id);
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleteId(null);
      return;
    }
    setTimeout(() => {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
    }, 280);
  };

  return (
    <>
      {/* Header */}
      <div className="rules-header">
        <div>
          <h2 className="rules-title">직원 관리</h2>
          <p className="rules-subtitle">
            등급 클릭으로 변경 · 직원 추가 및 상태 관리
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="rules-mode-badge">ADMIN</span>
          <motion.button
            className="emp-add-btn"
            onClick={() => setShowPanel(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={14} />
            직원 추가
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="emp-stats">
        {[
          { label: "전체", value: stats.total },
          { label: "재직 중", value: stats.active },
          { label: "A등급", value: stats.A, color: "#1D4ED8", bg: "#EFF6FF" },
          { label: "B등급", value: stats.B, color: "#15803D", bg: "#F0FDF4" },
          { label: "C등급", value: stats.C, color: "#6B7280", bg: "#F9FAFB" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="emp-stat-item"
            style={s.bg ? { background: s.bg } : {}}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span
              className="emp-stat-value"
              style={s.color ? { color: s.color } : {}}
            >
              {s.value}
            </span>
            <span className="emp-stat-label">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="emp-controls">
        <div className="emp-search-wrap">
          <Search size={14} className="emp-search-icon" />
          <input
            className="emp-search"
            placeholder="이름 또는 직급으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="emp-search-clear" onClick={() => setSearch("")}>
              <X size={12} />
            </button>
          )}
        </div>
        <div className="emp-filter-tabs">
          {(["ALL", "A", "B", "C"] as const).map((g) => (
            <button
              key={g}
              className={`emp-filter-tab ${gradeFilter === g ? "active" : ""}`}
              onClick={() => setGradeFilter(g)}
              style={
                gradeFilter === g && g !== "ALL"
                  ? {
                      background: GRADE_META[g as Grade].bg,
                      color: GRADE_META[g as Grade].color,
                      borderColor: GRADE_META[g as Grade].color + "40",
                    }
                  : {}
              }
            >
              {g === "ALL" ? "전체" : `${g}등급`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="emp-table-wrap">
        {/* Header */}
        <div className="emp-table-header">
          <span className="emp-col-name">직원</span>
          <span className="emp-col-grade">등급</span>
          <span className="emp-col-role">직급</span>
          <span className="emp-col-phone">연락처</span>
          <span className="emp-col-join">입사일</span>
          <span className="emp-col-status">상태</span>
          <span className="emp-col-action" />
        </div>

        {loading ? (
          <div className="emp-empty">불러오는 중...</div>
        ) : error ? (
          <div className="emp-empty" style={{ color: "#EF4444" }}>
            데이터를 불러오지 못했습니다 ({error})
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div
                className="emp-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                검색 결과가 없습니다
              </motion.div>
            ) : (
              filtered.map((emp, i) => (
                <motion.div
                  key={emp.id}
                  className={`emp-row ${emp.status === "leave" ? "leave" : ""} ${deleteId === emp.id ? "deleting" : ""}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{
                    opacity: deleteId === emp.id ? 0 : 1,
                    x: deleteId === emp.id ? 20 : 0,
                  }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                  layout
                >
                  {/* 직원 */}
                  <div className="emp-col-name emp-name-cell">
                    <div
                      className="emp-avatar"
                      style={{
                        background: GRADE_META[emp.grade].bg,
                        color: GRADE_META[emp.grade].color,
                      }}
                    >
                      {emp.name[0]}
                    </div>
                    <span className="emp-name">{emp.name}</span>
                  </div>

                  {/* 등급 */}
                  <div className="emp-col-grade">
                    <GradeBadge
                      grade={emp.grade}
                      onClick={() => cycleGrade(emp.id)}
                    />
                  </div>

                  {/* 직급 */}
                  <div className="emp-col-role">
                    <span className="emp-role">{emp.role}</span>
                  </div>

                  {/* 연락처 */}
                  <div className="emp-col-phone">
                    <span className="emp-phone">{emp.phone}</span>
                  </div>

                  {/* 입사일 */}
                  <div className="emp-col-join">
                    <span className="emp-join">{emp.joinDate}</span>
                  </div>

                  {/* 상태 */}
                  <div className="emp-col-status">
                    <motion.button
                      className={`emp-status-btn ${emp.status}`}
                      onClick={() => toggleStatus(emp.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {emp.status === "active" ? "재직" : "휴직"}
                    </motion.button>
                  </div>

                  {/* 삭제 */}
                  <div className="emp-col-action">
                    <motion.button
                      className="emp-delete-btn"
                      onClick={() => setConfirmId(emp.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={13} />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Add Employee Drawer */}
      <AddEmployeeDrawer
        open={showPanel}
        onClose={() => setShowPanel(false)}
        onAdd={addEmployee}
      />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmId !== null && (() => {
          const target = employees.find((e) => e.id === confirmId);
          return (
            <>
              <motion.div
                className="emp-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmId(null)}
              />
              <motion.div
                className="emp-confirm-modal"
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
              >
                <p className="emp-confirm-title">직원 삭제</p>
                <p className="emp-confirm-desc">
                  <strong>{target?.name}</strong> 직원을 삭제하시겠습니까?<br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="emp-confirm-actions">
                  <button
                    className="emp-cancel-btn"
                    onClick={() => setConfirmId(null)}
                  >
                    취소
                  </button>
                  <motion.button
                    className="emp-confirm-delete-btn"
                    onClick={() => {
                      deleteEmployee(confirmId);
                      setConfirmId(null);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    삭제
                  </motion.button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
