"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronLeft, ChevronRight, Download, AlignJustify, LayoutGrid } from "lucide-react";
import {
  ViewMode,
  WeekSchedule,
  MonthSchedule,
  Employee,
  ScheduleGroupResponse,
  SHIFT_API_TO_TYPE,
  SHIFT_CYCLE,
  CURRENT_WEEK,
  MONTH_DAYS,
} from "./types";
import WeekView from "./WeekView";
import MonthView from "./MonthView";

const SCHEDULE_GROUP_ID = 2;

export default function ScheduleClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({});
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule>({});
  const [genKey, setGenKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const loadSchedule = async () => {
    console.log("[schedule] loadSchedule called");
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/work-schedules/${SCHEDULE_GROUP_ID}`);
      console.log("[schedule] status:", res.status);
      const json = await res.json();
      console.log("[schedule] raw response:", json);
      const data: ScheduleGroupResponse = json.data ?? json;
      console.log("[schedule] data:", data);
      if (!data?.days) return;

      // Collect unique employees and build schedule maps
      const empMap = new Map<number, Employee>();
      const wSched: WeekSchedule = {};
      const mSched: MonthSchedule = {};

      data.days.forEach((day) => {
        const date = new Date(day.date);
        const dayOfMonth = date.getDate();
        const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

        day.assignments.forEach((a) => {
          const shift = SHIFT_API_TO_TYPE[a.shiftType] ?? "OFF";
          if (!empMap.has(a.memberId)) {
            empMap.set(a.memberId, { id: a.memberId, name: a.memberName });
          }
          mSched[`${a.memberId}-${dayOfMonth}`] = shift;
          if (CURRENT_WEEK.includes(dayOfMonth)) {
            wSched[`${a.memberId}-${dayOfWeek}`] = shift;
          }
        });
      });

      const empList = Array.from(empMap.values());

      // Fill OFF for missing employee-day combinations
      empList.forEach((emp) => {
        for (let d = 0; d < 7; d++) {
          if (!wSched[`${emp.id}-${d}`]) wSched[`${emp.id}-${d}`] = "OFF";
        }
        for (let day = 1; day <= MONTH_DAYS; day++) {
          if (!mSched[`${emp.id}-${day}`]) mSched[`${emp.id}-${day}`] = "OFF";
        }
      });

      setEmployees(empList);
      setWeekSchedule(wSched);
      setMonthSchedule(mSched);
      setGenKey((k) => k + 1);
    } catch (err) {
      console.error("[schedule] error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchedule(); }, []);

  const toggleShift = (empId: number, dayIdx: number) => {
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
              {viewMode === "week" ? "2026년 4월 4주차" : "2026년 4월"}
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
            onClick={loadSchedule}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
          >
            <motion.span style={{ display: "flex", alignItems: "center" }}
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { duration: 0.7, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            >
              <RefreshCw size={13} />
            </motion.span>
            {loading ? "로딩 중..." : "새로고침"}
          </motion.button>
        </div>
      </div>

      {/* View content */}
      {loading && employees.length === 0 ? (
        <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 13 }}>
          로딩 중...
        </div>
      ) : (
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
                employees={employees}
                schedule={weekSchedule}
                genKey={genKey}
                hoveredRow={hoveredRow}
                hoveredCol={hoveredCol}
                setHoveredRow={setHoveredRow}
                setHoveredCol={setHoveredCol}
                toggleShift={toggleShift}
              />
            ) : (
              <MonthView employees={employees} schedule={monthSchedule} genKey={genKey} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
