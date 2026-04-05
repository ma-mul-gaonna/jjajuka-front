"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Employee,
  ShiftType,
  MonthSchedule,
  DAYS,
  SHIFT_META,
  MONTH_START_OFFSET,
  MONTH_DAYS,
  TODAY,
} from "./types";
import Legend from "./Legend";

interface MonthViewProps {
  employees: Employee[];
  schedule: MonthSchedule;
  genKey: number;
  vacancyDays?: Record<number, string[]>;
}

export default function MonthView({ employees = [], schedule, genKey, vacancyDays = {} }: MonthViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const totalCells = MONTH_START_OFFSET + MONTH_DAYS;
  const rows = Math.ceil(totalCells / 7);

  const getDaySummary = (day: number) => {
    const counts = { AM: 0, PM: 0, NIGHT: 0 };
    employees.forEach((emp) => {
      const s = schedule[`${emp.id}-${day}`];
      if (s !== "OFF") counts[s as keyof typeof counts]++;
    });
    return counts;
  };

  const getEmpShifts = (day: number) =>
    employees.map((emp) => ({ ...emp, shift: schedule[`${emp.id}-${day}`] as ShiftType }))
      .filter((e) => e.shift !== "OFF");

  return (
    <div className="sch-outer">
      {/* Day-of-week header */}
      <div className="sch-month-dow-header">
        {DAYS.map((day, i) => (
          <div key={day} className={`sch-month-dow ${i === 0 ? "sunday" : i === 6 ? "saturday" : ""}`}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="sch-month-grid">
        {Array.from({ length: rows * 7 }).map((_, cellIdx) => {
          const day = cellIdx - MONTH_START_OFFSET + 1;
          const isValid = day >= 1 && day <= MONTH_DAYS;
          const isCurWeek = day === TODAY;
          const colIdx = cellIdx % 7;
          const isSunday = colIdx === 0;
          const isSaturday = colIdx === 6;
          const isWeekend = isSunday || isSaturday;
          const isSelected = selectedDay === day;
          const summary = isValid ? getDaySummary(day) : null;
          const vacancyNames = isValid ? (vacancyDays[day] ?? []) : [];

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
                    <span className={`sch-month-daynum ${isCurWeek ? "cur" : ""} ${isSunday ? "sunday" : isSaturday ? "saturday" : ""}`}>{day}</span>
                    {isCurWeek && <span className="sch-month-badge">오늘</span>}
                  </div>

                  {vacancyNames.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
                      {vacancyNames.map((name) => (
                        <div key={name} style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          padding: "2px 6px", borderRadius: 5,
                          background: "#fef2f2", border: "1px solid #fca5a5",
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#dc2626", whiteSpace: "nowrap" }}>
                            {name} 결원
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

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
