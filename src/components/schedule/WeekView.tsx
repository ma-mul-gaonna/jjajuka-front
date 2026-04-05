"use client";

import { motion } from "framer-motion";
import {
  Employee,
  WeekSchedule,
  DAYS,
  DATES,
  SHIFT_META,
} from "./types";
import Legend from "./Legend";

interface WeekViewProps {
  employees: Employee[];
  schedule: WeekSchedule;
  genKey: number;
  hoveredRow: number | null;
  hoveredCol: number | null;
  setHoveredRow: (v: number | null) => void;
  setHoveredCol: (v: number | null) => void;
  toggleShift: (empId: number, dayIdx: number) => void;
}

export default function WeekView({ employees = [], schedule, genKey, hoveredRow, hoveredCol, setHoveredRow, setHoveredCol, toggleShift }: WeekViewProps) {
  const coverage = DAYS.map((_, d) => ({
    active: employees.filter((e) => schedule[`${e.id}-${d}`] !== "OFF").length,
    hasNightSenior: employees.some((e) => schedule[`${e.id}-${d}`] === "NIGHT" && e.grade === "A"),
  }));
  const weeklyCount = (empId: number) => DAYS.filter((_, d) => schedule[`${empId}-${d}`] !== "OFF").length;

  return (
    <div className="sch-outer">
      <div className="sch-grid-container">
        <div className="sch-row sch-header-row">
          <div className="sch-emp-col sch-corner" />
          {DAYS.map((day, d) => (
            <div key={d} className={`sch-day-col sch-header-day ${d === 0 ? "sunday" : d === 6 ? "saturday" : ""} ${hoveredCol === d ? "col-hl" : ""}`}>
              <span className="sch-hd-name">{day}</span>
              <span className="sch-hd-date">{DATES[d]}</span>
            </div>
          ))}
          <div className="sch-week-col sch-corner">주간</div>
        </div>

        {employees.map((emp, eIdx) => (
          <div key={emp.id} className={`sch-row ${hoveredRow === emp.id ? "row-hl" : ""} ${hoveredRow !== null && hoveredRow !== emp.id ? "row-dim" : ""}`}>
            <div className="sch-emp-col sch-emp-label" onMouseEnter={() => setHoveredRow(emp.id)} onMouseLeave={() => setHoveredRow(null)}>
              <div className={`sch-avatar grade-${emp.grade?.toLowerCase() ?? "b"}`}>{emp.name[0]}</div>
              <div className="sch-emp-info">
                <span className="sch-emp-name">{emp.name}</span>
                {emp.grade && (
                  <span className={`sch-emp-grade grade-${emp.grade.toLowerCase()}`}>{emp.grade}등급</span>
                )}
              </div>
            </div>
            {DAYS.map((_, d) => {
              const meta = SHIFT_META[schedule[`${emp.id}-${d}`]];
              const dimCol = hoveredCol !== null && hoveredCol !== d && hoveredRow === null;
              return (
                <div key={d} className={`sch-day-col sch-shift-cell ${d === 0 ? "sunday" : d === 6 ? "saturday" : ""} ${hoveredCol === d ? "col-hl" : ""} ${dimCol ? "col-dim" : ""}`}
                  onMouseEnter={() => setHoveredCol(d)} onMouseLeave={() => setHoveredCol(null)}
                  onClick={() => toggleShift(emp.id, d)}
                >
                  <motion.div
                    key={`${genKey}-${emp.id}-${d}`}
                    className="sch-pill"
                    style={{ background: meta.bg, color: meta.color }}
                    initial={{ opacity: 0, scale: 0.65, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: d * 0.055 + eIdx * 0.022, duration: 0.3, ease: [0.34, 1.4, 0.64, 1] }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="sch-pill-dot" style={{ background: meta.dot }} />
                    <span className="sch-pill-label">{meta.label}</span>
                    <span className="sch-pill-time">{meta.time}</span>
                  </motion.div>
                </div>
              );
            })}
            <div className="sch-week-col sch-week-num-cell">
              <motion.span key={`week-${genKey}-${emp.id}`} className="sch-week-num"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: DAYS.length * 0.055 + eIdx * 0.022 + 0.1 }}
              >
                {weeklyCount(emp.id)}<span className="sch-week-unit">일</span>
              </motion.span>
            </div>
          </div>
        ))}

        <div className="sch-row sch-cov-row">
          <div className="sch-emp-col sch-cov-label">커버리지</div>
          {coverage.map((cov, d) => (
            <div key={d} className="sch-day-col sch-cov-cell">
              <div className="sch-cov-track">
                <motion.div key={`cov-${genKey}-${d}`} className="sch-cov-fill"
                  initial={{ scaleX: 0 }} animate={{ scaleX: cov.active / employees.length }}
                  transition={{ delay: d * 0.06 + 0.25, duration: 0.5, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
              <div className="sch-cov-bottom">
                <span className="sch-cov-count">{cov.active}<span className="sch-cov-total">/{employees.length}</span></span>
                {!cov.hasNightSenior && (
                  <motion.span className="sch-cov-warn" title="야간 A등급 미배치"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: d * 0.06 + 0.5, type: "spring", stiffness: 300 }}
                  >!</motion.span>
                )}
              </div>
            </div>
          ))}
          <div className="sch-week-col" />
        </div>
      </div>
      <Legend hint="셀 클릭으로 근무 변경 · ⚠ 야간 A등급 미배치" />
    </div>
  );
}
