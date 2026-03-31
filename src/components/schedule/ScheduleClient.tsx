"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronLeft, ChevronRight, Download, AlignJustify, LayoutGrid } from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type ShiftType = "AM" | "PM" | "NIGHT" | "OFF";
type ViewMode = "week" | "month";
type WeekSchedule = Record<string, ShiftType>;
type MonthSchedule = Record<string, ShiftType>; // key: `${empId}-${dayOfMonth}`

interface Employee { id: number; name: string; grade: "A" | "B" | "C"; }

// ─── Constants ───────────────────────────────────────────
const EMPLOYEES: Employee[] = [
  { id: 1, name: "김민준", grade: "A" },
  { id: 2, name: "이서연", grade: "B" },
  { id: 3, name: "박지훈", grade: "A" },
  { id: 4, name: "최유나", grade: "C" },
  { id: 5, name: "정도현", grade: "B" },
  { id: 6, name: "한소희", grade: "C" },
  { id: 7, name: "윤성민", grade: "A" },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const DATES = ["03/23", "03/24", "03/25", "03/26", "03/27", "03/28", "03/29"];
const SHIFT_CYCLE: ShiftType[] = ["AM", "PM", "NIGHT", "OFF"];

const SHIFT_META: Record<ShiftType, { label: string; time: string; bg: string; color: string; dot: string }> = {
  AM:    { label: "오전", time: "06–14", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  PM:    { label: "오후", time: "14–22", bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  NIGHT: { label: "야간", time: "22–06", bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  OFF:   { label: "휴무", time: "—",     bg: "#F9FAFB", color: "#9CA3AF", dot: "#E5E7EB" },
};

// March 2026: starts on Sunday → Mon-first offset = 6
const MONTH_START_OFFSET = 6;
const MONTH_DAYS = 31;
const CURRENT_WEEK = [23, 24, 25, 26, 27, 28, 29];

// ─── Data generators ─────────────────────────────────────
function makeWeekSchedule(): WeekSchedule {
  const s: WeekSchedule = {};
  EMPLOYEES.forEach((emp) => {
    let offCount = 0;
    DAYS.forEach((_, d) => {
      if (offCount < 2 && Math.random() < 0.28) {
        s[`${emp.id}-${d}`] = "OFF"; offCount++;
      } else {
        const opts: ShiftType[] = ["AM", "PM", "NIGHT"];
        s[`${emp.id}-${d}`] = opts[Math.floor(Math.random() * 3)];
      }
    });
  });
  return s;
}

function makeMonthSchedule(): MonthSchedule {
  const s: MonthSchedule = {};
  EMPLOYEES.forEach((emp) => {
    for (let day = 1; day <= MONTH_DAYS; day++) {
      if (Math.random() < 0.22) {
        s[`${emp.id}-${day}`] = "OFF";
      } else {
        const opts: ShiftType[] = ["AM", "PM", "NIGHT"];
        s[`${emp.id}-${day}`] = opts[Math.floor(Math.random() * 3)];
      }
    }
  });
  return s;
}

// ─── Shared Legend ───────────────────────────────────────
function Legend({ hint }: { hint: string }) {
  return (
    <div className="sch-legend">
      <div className="sch-legend-shifts">
        {(Object.entries(SHIFT_META) as [ShiftType, typeof SHIFT_META.AM][]).map(([, meta]) => (
          <div key={meta.label} className="sch-legend-item">
            <span className="sch-legend-dot" style={{ background: meta.dot }} />
            <span className="sch-legend-name">{meta.label}</span>
            <span className="sch-legend-time">{meta.time}</span>
          </div>
        ))}
      </div>
      <span className="sch-legend-hint">{hint}</span>
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────
interface WeekViewProps {
  schedule: WeekSchedule;
  genKey: number;
  hoveredRow: number | null;
  hoveredCol: number | null;
  setHoveredRow: (v: number | null) => void;
  setHoveredCol: (v: number | null) => void;
  toggleShift: (empId: number, dayIdx: number) => void;
}

function WeekView({ schedule, genKey, hoveredRow, hoveredCol, setHoveredRow, setHoveredCol, toggleShift }: WeekViewProps) {
  const coverage = DAYS.map((_, d) => ({
    active: EMPLOYEES.filter((e) => schedule[`${e.id}-${d}`] !== "OFF").length,
    hasNightSenior: EMPLOYEES.some((e) => schedule[`${e.id}-${d}`] === "NIGHT" && e.grade === "A"),
  }));
  const weeklyCount = (empId: number) => DAYS.filter((_, d) => schedule[`${empId}-${d}`] !== "OFF").length;

  return (
    <div className="sch-outer">
      <div className="sch-grid-container">
        <div className="sch-row sch-header-row">
          <div className="sch-emp-col sch-corner" />
          {DAYS.map((day, d) => (
            <div key={d} className={`sch-day-col sch-header-day ${d >= 5 ? "weekend" : ""} ${hoveredCol === d ? "col-hl" : ""}`}>
              <span className="sch-hd-name">{day}</span>
              <span className="sch-hd-date">{DATES[d]}</span>
            </div>
          ))}
          <div className="sch-week-col sch-corner">주간</div>
        </div>

        {EMPLOYEES.map((emp, eIdx) => (
          <div key={emp.id} className={`sch-row ${hoveredRow === emp.id ? "row-hl" : ""} ${hoveredRow !== null && hoveredRow !== emp.id ? "row-dim" : ""}`}>
            <div className="sch-emp-col sch-emp-label" onMouseEnter={() => setHoveredRow(emp.id)} onMouseLeave={() => setHoveredRow(null)}>
              <div className={`sch-avatar grade-${emp.grade.toLowerCase()}`}>{emp.name[0]}</div>
              <div className="sch-emp-info">
                <span className="sch-emp-name">{emp.name}</span>
                <span className={`sch-emp-grade grade-${emp.grade.toLowerCase()}`}>{emp.grade}등급</span>
              </div>
            </div>
            {DAYS.map((_, d) => {
              const meta = SHIFT_META[schedule[`${emp.id}-${d}`]];
              const dimCol = hoveredCol !== null && hoveredCol !== d && hoveredRow === null;
              return (
                <div key={d} className={`sch-day-col sch-shift-cell ${d >= 5 ? "weekend" : ""} ${hoveredCol === d ? "col-hl" : ""} ${dimCol ? "col-dim" : ""}`}
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
                  initial={{ scaleX: 0 }} animate={{ scaleX: cov.active / EMPLOYEES.length }}
                  transition={{ delay: d * 0.06 + 0.25, duration: 0.5, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
              <div className="sch-cov-bottom">
                <span className="sch-cov-count">{cov.active}<span className="sch-cov-total">/{EMPLOYEES.length}</span></span>
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

// ─── Month View ──────────────────────────────────────────
function MonthView({ schedule, genKey }: { schedule: MonthSchedule; genKey: number }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const totalCells = MONTH_START_OFFSET + MONTH_DAYS;
  const rows = Math.ceil(totalCells / 7);

  const getDaySummary = (day: number) => {
    const counts = { AM: 0, PM: 0, NIGHT: 0 };
    EMPLOYEES.forEach((emp) => {
      const s = schedule[`${emp.id}-${day}`];
      if (s !== "OFF") counts[s as keyof typeof counts]++;
    });
    return counts;
  };

  const getEmpShifts = (day: number) =>
    EMPLOYEES.map((emp) => ({ ...emp, shift: schedule[`${emp.id}-${day}`] as ShiftType }))
      .filter((e) => e.shift !== "OFF");

  return (
    <div className="sch-outer">
      {/* Day-of-week header */}
      <div className="sch-month-dow-header">
        {DAYS.map((day, i) => (
          <div key={day} className={`sch-month-dow ${i >= 5 ? "weekend" : ""}`}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="sch-month-grid">
        {Array.from({ length: rows * 7 }).map((_, cellIdx) => {
          const day = cellIdx - MONTH_START_OFFSET + 1;
          const isValid = day >= 1 && day <= MONTH_DAYS;
          const isCurWeek = CURRENT_WEEK.includes(day);
          const isWeekend = cellIdx % 7 >= 5;
          const isSelected = selectedDay === day;
          const summary = isValid ? getDaySummary(day) : null;

          return (
            <motion.div
              key={`${genKey}-cell-${cellIdx}`}
              className={`sch-month-cell ${!isValid ? "empty" : ""} ${isCurWeek ? "cur-week" : ""} ${isWeekend ? "weekend" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => isValid && setSelectedDay(isSelected ? null : day)}
              initial={isValid ? { opacity: 0, scale: 0.88, y: 4 } : {}}
              animate={isValid ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={isValid ? {
                delay: Math.floor(cellIdx / 7) * 0.055 + (cellIdx % 7) * 0.02,
                duration: 0.25,
                ease: [0.34, 1.2, 0.64, 1],
              } : {}}
              whileHover={isValid ? { scale: 1.02, zIndex: 2 } : {}}
            >
              {isValid && (
                <>
                  <div className="sch-month-top">
                    <span className={`sch-month-daynum ${isCurWeek ? "cur" : ""}`}>{day}</span>
                    {isCurWeek && <span className="sch-month-badge">이번주</span>}
                  </div>

                  <div className="sch-month-summary">
                    {(["AM", "PM", "NIGHT"] as ShiftType[]).map((type) => {
                      const count = summary![type as keyof typeof summary];
                      if (!count) return null;
                      return (
                        <div key={type} className="sch-month-summary-row" style={{ color: SHIFT_META[type].color }}>
                          <span className="sch-month-sdot" style={{ background: SHIFT_META[type].dot }} />
                          <span className="sch-month-slabel">{SHIFT_META[type].label}</span>
                          <span className="sch-month-scount">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="sch-month-detail"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {getEmpShifts(day).map((emp) => (
                          <div key={emp.id} className="sch-month-detail-row">
                            <span className="sch-month-ddot" style={{ background: SHIFT_META[emp.shift].dot }} />
                            <span className="sch-month-dname">{emp.name}</span>
                            <span className="sch-month-dshift" style={{ color: SHIFT_META[emp.shift].color }}>
                              {SHIFT_META[emp.shift].label}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
      <Legend hint="날짜 클릭으로 직원별 근무 확인" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function ScheduleClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(() => makeWeekSchedule());
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule>(() => makeMonthSchedule());
  const [genKey, setGenKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 120));
    setWeekSchedule(makeWeekSchedule());
    setMonthSchedule(makeMonthSchedule());
    setGenKey((k) => k + 1);
    await new Promise((r) => setTimeout(r, 900));
    setGenerating(false);
  };

  const toggleShift = (empId: number, dayIdx: number) => {
    if (generating) return;
    const key = `${empId}-${dayIdx}`;
    const idx = SHIFT_CYCLE.indexOf(weekSchedule[key]);
    setWeekSchedule((s) => ({ ...s, [key]: SHIFT_CYCLE[(idx + 1) % SHIFT_CYCLE.length] }));
  };

  return (
    <>
      <div className="rules-header">
        <div>
          <h2 className="rules-title">근무표</h2>
          <p className="rules-subtitle">
            {viewMode === "week" ? "셀을 클릭해 근무 유형을 직접 수정할 수 있습니다." : "날짜를 클릭해 직원별 근무를 확인할 수 있습니다."}
          </p>
        </div>
        <span className="rules-mode-badge">ADMIN</span>
      </div>

      {/* Toolbar */}
      <div className="sch-toolbar">
        <div className="sch-toolbar-left">
          <div className="sch-week-nav">
            <button className="sch-nav-btn"><ChevronLeft size={15} /></button>
            <span className="sch-week-label">
              {viewMode === "week" ? "2026년 3월 4주차" : "2026년 3월"}
            </span>
            <button className="sch-nav-btn"><ChevronRight size={15} /></button>
          </div>

          {/* View toggle */}
          <div className="sch-view-toggle">
            <button className={`sch-toggle-btn ${viewMode === "week" ? "active" : ""}`} onClick={() => setViewMode("week")}>
              <AlignJustify size={13} />
              주간
            </button>
            <button className={`sch-toggle-btn ${viewMode === "month" ? "active" : ""}`} onClick={() => setViewMode("month")}>
              <LayoutGrid size={13} />
              월간
            </button>
          </div>
        </div>

        <div className="sch-toolbar-actions">
          <motion.button className="sch-action-btn outline" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Download size={13} />
            내보내기
          </motion.button>
          <motion.button
            className="sch-action-btn primary"
            onClick={handleGenerate}
            disabled={generating}
            whileHover={!generating ? { scale: 1.02 } : {}}
            whileTap={!generating ? { scale: 0.97 } : {}}
          >
            <motion.span style={{ display: "flex", alignItems: "center" }}
              animate={generating ? { rotate: 360 } : { rotate: 0 }}
              transition={generating ? { duration: 0.7, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            >
              <RefreshCw size={13} />
            </motion.span>
            {generating ? "생성 중..." : "자동 생성"}
          </motion.button>
        </div>
      </div>

      {/* View content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {viewMode === "week" ? (
            <WeekView
              schedule={weekSchedule}
              genKey={genKey}
              hoveredRow={hoveredRow}
              hoveredCol={hoveredCol}
              setHoveredRow={setHoveredRow}
              setHoveredCol={setHoveredCol}
              toggleShift={toggleShift}
            />
          ) : (
            <MonthView schedule={monthSchedule} genKey={genKey} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
