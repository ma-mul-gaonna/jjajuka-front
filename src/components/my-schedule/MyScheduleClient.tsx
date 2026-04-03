"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlignJustify, LayoutGrid } from "lucide-react";
import { ShiftType, SHIFT_META, MONTH_START_OFFSET, MONTH_DAYS, CURRENT_WEEK } from "@/components/schedule/types";

// ─── Mock: 내 근무 데이터 ─────────────────────────────────
type ViewMode = "week" | "month";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const DATES = ["03/23", "03/24", "03/25", "03/26", "03/27", "03/28", "03/29"];
const TODAY_IDX = 0; // 월요일 = 오늘 (mock)

const MY_WEEK: ShiftType[] = ["PM", "AM", "OFF", "NIGHT", "PM", "OFF", "OFF"];

const MY_MONTH: Record<number, ShiftType> = (() => {
  const shifts: ShiftType[] = ["AM", "PM", "NIGHT", "OFF"];
  const result: Record<number, ShiftType> = {};
  for (let d = 1; d <= MONTH_DAYS; d++) {
    if (d % 7 === 0 || d % 7 === 6) { result[d] = "OFF"; continue; }
    result[d] = shifts[d % 4];
  }
  // 이번주 반영
  CURRENT_WEEK.forEach((day, i) => { result[day] = MY_WEEK[i]; });
  return result;
})();

// ─── Helpers ─────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

// ─── Component ───────────────────────────────────────────
export default function MyScheduleClient() {
  const [view, setView] = useState<ViewMode>("week");

  const workDays = MY_WEEK.filter((s) => s !== "OFF").length;
  const amCount  = MY_WEEK.filter((s) => s === "AM").length;
  const pmCount  = MY_WEEK.filter((s) => s === "PM").length;
  const nightCount = MY_WEEK.filter((s) => s === "NIGHT").length;

  return (
    <>
      {/* Header */}
      <div className="rules-header">
        <div>
          <h2 className="rules-title">내 근무표</h2>
          <p className="rules-subtitle">이번 주 근무 {workDays}일 · 오전 {amCount} / 오후 {pmCount} / 야간 {nightCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sch-toolbar">
        <div className="sch-toolbar-left">
          <div className="sch-week-nav">
            <button className="sch-nav-btn"><ChevronLeft size={15} /></button>
            <span className="sch-week-label">
              {view === "week" ? "2026년 3월 4주차" : "2026년 3월"}
            </span>
            <button className="sch-nav-btn"><ChevronRight size={15} /></button>
          </div>
          <div className="sch-view-toggle">
            <button className={`sch-toggle-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
              <AlignJustify size={13} />
              주간
            </button>
            <button className={`sch-toggle-btn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
              <LayoutGrid size={13} />
              월간
            </button>
          </div>
        </div>
      </div>

      {/* View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {view === "week" ? (
            <WeekView />
          ) : (
            <MonthView />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// ─── Week View ───────────────────────────────────────────
function WeekView() {
  return (
    <div className="mys-week-grid">
      {DAYS.map((day, i) => {
        const shift = MY_WEEK[i];
        const meta = SHIFT_META[shift];
        const isToday = i === TODAY_IDX;
        const isOff = shift === "OFF";
        const isWeekend = i >= 5;
        return (
          <motion.div
            key={day}
            className={`mys-day-card ${isToday ? "today" : ""} ${isOff ? "off" : ""} ${isWeekend ? "weekend" : ""}`}
            {...fadeUp(i * 0.05)}
            whileHover={!isOff ? { y: -3 } : {}}
          >
            <div className="mys-day-top">
              <span className={`mys-day-name ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""}`}>{day}</span>
              <span className="mys-day-date">{DATES[i]}</span>
              {isToday && <span className="mys-today-dot" />}
            </div>
            {isOff ? (
              <div className="mys-off-label">휴무</div>
            ) : (
              <div className="mys-shift-info" style={{ background: meta.bg }}>
                <span className="mys-shift-label" style={{ color: meta.color }}>{meta.label}</span>
                <span className="mys-shift-time" style={{ color: meta.color }}>{meta.time}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Month View ──────────────────────────────────────────
function MonthView() {
  const totalCells = MONTH_START_OFFSET + MONTH_DAYS;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="mys-month-wrap">
      <div className="sch-month-dow-header">
        {DAYS.map((day, i) => (
          <div key={day} className={`sch-month-dow ${i >= 5 ? "weekend" : ""}`}>{day}</div>
        ))}
      </div>
      <div className="mys-month-grid">
        {Array.from({ length: rows * 7 }).map((_, cellIdx) => {
          const day = cellIdx - MONTH_START_OFFSET + 1;
          const isValid = day >= 1 && day <= MONTH_DAYS;
          const isWeekend = cellIdx % 7 >= 5;
          const isCurWeek = CURRENT_WEEK.includes(day);
          const isToday = day === CURRENT_WEEK[TODAY_IDX];
          const shift = isValid ? MY_MONTH[day] : null;
          const meta = shift ? SHIFT_META[shift] : null;

          return (
            <motion.div
              key={cellIdx}
              className={`mys-month-cell ${!isValid ? "empty" : ""} ${isWeekend ? "weekend" : ""} ${isCurWeek ? "cur-week" : ""} ${isToday ? "today" : ""}`}
              initial={isValid ? { opacity: 0, scale: 0.9 } : {}}
              animate={isValid ? { opacity: 1, scale: 1 } : {}}
              transition={isValid ? {
                delay: Math.floor(cellIdx / 7) * 0.05 + (cellIdx % 7) * 0.015,
                duration: 0.22,
              } : {}}
            >
              {isValid && (
                <>
                  <span className={`mys-month-num ${isToday ? "today" : ""}`}>{day}</span>
                  {shift !== "OFF" && meta && (
                    <div className="mys-month-shift" style={{ background: meta.bg, color: meta.color }}>
                      <span className="mys-month-sdot" style={{ background: meta.dot }} />
                      {meta.label}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
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
      </div>
    </div>
  );
}
