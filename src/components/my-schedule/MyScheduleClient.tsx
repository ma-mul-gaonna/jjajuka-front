"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlignJustify, LayoutGrid, User, Users } from "lucide-react";
import {
  ShiftType, SHIFT_META, MONTH_START_OFFSET, MONTH_DAYS,
  CURRENT_WEEK, SHIFT_API_TO_TYPE, Employee, WeekSchedule, MonthSchedule,
} from "@/components/schedule/types";
import { useAuthStore } from "@/store/authStore";
import WeekView from "@/components/schedule/WeekView";
import MonthView from "@/components/schedule/MonthView";

type ViewMode    = "week" | "month";
type ScheduleMode = "my" | "all";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const SCHEDULE_GROUP_ID = 2;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

export default function MyScheduleClient() {
  const [view, setView]               = useState<ViewMode>("week");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("my");

  // 내 근무표 데이터
  const [weekMap, setWeekMap]   = useState<Record<string, ShiftType>>({});
  const [monthMap, setMonthMap] = useState<Record<number, ShiftType>>({});
  const [dates, setDates]       = useState<string[]>(Array(7).fill(""));

  // 전체 근무표 데이터
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({});
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule>({});
  const [genKey] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetch(`/api/schedules/work-schedules/${SCHEDULE_GROUP_ID}`)
      .then((r) => r.json())
      .then((json) => {
        const data = json.data ?? json;
        if (!data?.days) return;

        // 내 근무표
        const wMap: Record<string, ShiftType> = {};
        const mMap: Record<number, ShiftType> = {};
        const dArr: string[] = Array(7).fill("");

        // 전체 근무표
        const empMap = new Map<number, Employee>();
        const wSched: WeekSchedule = {};
        const mSched: MonthSchedule = {};

        data.days.forEach((day: { date: string; assignments: { memberId: number; memberName: string; shiftType: string }[] }) => {
          const d = new Date(day.date);
          const dayOfMonth = d.getDate();
          const dayOfWeek = d.getDay();
          const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(dayOfMonth).padStart(2, "0")}`;

          day.assignments.forEach((a) => {
            const shift = SHIFT_API_TO_TYPE[a.shiftType] ?? "OFF";

            // 전체
            if (!empMap.has(a.memberId)) {
              empMap.set(a.memberId, { id: a.memberId, name: a.memberName });
            }
            mSched[`${a.memberId}-${dayOfMonth}`] = shift;
            if (CURRENT_WEEK.includes(dayOfMonth)) {
              wSched[`${a.memberId}-${dayOfWeek}`] = shift;
            }

            // 내 것
            if (user && a.memberId !== user.id) return;
            mMap[dayOfMonth] = shift;
            if (CURRENT_WEEK.includes(dayOfMonth)) {
              const idx = CURRENT_WEEK.indexOf(dayOfMonth);
              wMap[String(idx)] = shift;
              dArr[idx] = mmdd;
            }
          });
        });

        const empList = Array.from(empMap.values());
        empList.forEach((emp) => {
          for (let d = 0; d < 7; d++) {
            if (!wSched[`${emp.id}-${d}`]) wSched[`${emp.id}-${d}`] = "OFF";
          }
          for (let day = 1; day <= MONTH_DAYS; day++) {
            if (!mSched[`${emp.id}-${day}`]) mSched[`${emp.id}-${day}`] = "OFF";
          }
        });

        setWeekMap(wMap);
        setMonthMap(mMap);
        setDates(dArr);
        setEmployees(empList);
        setWeekSchedule(wSched);
        setMonthSchedule(mSched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const weekShifts = Array.from({ length: 7 }, (_, i) => weekMap[String(i)] ?? "OFF");
  const workDays   = weekShifts.filter((s) => s !== "OFF").length;
  const amCount    = weekShifts.filter((s) => s === "AM").length;
  const pmCount    = weekShifts.filter((s) => s === "PM").length;
  const nightCount = weekShifts.filter((s) => s === "NIGHT").length;

  return (
    <>
      <div className="rules-header">
        <div>
          <h2 className="rules-title">
            {scheduleMode === "my" ? "내 근무표" : "전체 근무표"}
          </h2>
          <p className="rules-subtitle">
            {loading
              ? "불러오는 중..."
              : scheduleMode === "my"
              ? `이번 주 근무 ${workDays}일 · 오전 ${amCount} / 오후 ${pmCount} / 야간 ${nightCount}`
              : `총 ${employees.length}명`}
          </p>
        </div>

        {/* 내/전체 토글 */}
        <div className="sch-view-toggle">
          <button
            className={`sch-toggle-btn ${scheduleMode === "my" ? "active" : ""}`}
            onClick={() => setScheduleMode("my")}
          >
            <User size={13} /> 내 근무표
          </button>
          <button
            className={`sch-toggle-btn ${scheduleMode === "all" ? "active" : ""}`}
            onClick={() => setScheduleMode("all")}
          >
            <Users size={13} /> 전체 근무표
          </button>
        </div>
      </div>

      <div className="sch-toolbar">
        <div className="sch-toolbar-left">
          <div className="sch-week-nav">
            <button className="sch-nav-btn"><ChevronLeft size={15} /></button>
            <span className="sch-week-label">
              {view === "week" ? "2026년 4월 4주차" : "2026년 4월"}
            </span>
            <button className="sch-nav-btn"><ChevronRight size={15} /></button>
          </div>
          <div className="sch-view-toggle">
            <button className={`sch-toggle-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
              <AlignJustify size={13} /> 주간
            </button>
            <button className={`sch-toggle-btn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
              <LayoutGrid size={13} /> 월간
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${scheduleMode}-${view}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {scheduleMode === "my" ? (
            view === "week" ? (
              <MyWeekView shifts={weekShifts} dates={dates} loading={loading} />
            ) : (
              <MyMonthView monthMap={monthMap} loading={loading} />
            )
          ) : (
            view === "week" ? (
              <WeekView
                employees={employees}
                schedule={weekSchedule}
                genKey={genKey}
                hoveredRow={hoveredRow}
                hoveredCol={hoveredCol}
                setHoveredRow={setHoveredRow}
                setHoveredCol={setHoveredCol}
                toggleShift={() => {}}
              />
            ) : (
              <MonthView employees={employees} schedule={monthSchedule} genKey={genKey} />
            )
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// ─── 내 근무 Week View ────────────────────────────────────
function MyWeekView({ shifts, dates, loading }: { shifts: ShiftType[]; dates: string[]; loading: boolean }) {
  if (loading) return <div className="emp-empty">불러오는 중...</div>;
  return (
    <div className="mys-week-grid">
      {DAYS.map((day, i) => {
        const shift     = shifts[i];
        const meta      = SHIFT_META[shift];
        const isOff     = shift === "OFF";
        const isWeekend = i >= 5;
        return (
          <motion.div
            key={day}
            className={`mys-day-card ${isOff ? "off" : ""} ${isWeekend ? "weekend" : ""}`}
            {...fadeUp(i * 0.05)}
            whileHover={!isOff ? { y: -3 } : {}}
          >
            <div className="mys-day-top">
              <span className={`mys-day-name ${isWeekend ? "weekend" : ""}`}>{day}</span>
              <span className="mys-day-date">{dates[i]}</span>
            </div>
            {isOff ? (
              <div className="mys-off-label">휴무</div>
            ) : (
              <div className="mys-shift-info" style={{ background: meta.bg }}>
                <span className="mys-shift-label" style={{ color: meta.color }}>{meta.label}</span>
                <span className="mys-shift-time"  style={{ color: meta.color }}>{meta.time}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── 내 근무 Month View ───────────────────────────────────
function MyMonthView({ monthMap, loading }: { monthMap: Record<number, ShiftType>; loading: boolean }) {
  const totalCells = MONTH_START_OFFSET + MONTH_DAYS;
  const rows       = Math.ceil(totalCells / 7);

  if (loading) return <div className="emp-empty">불러오는 중...</div>;

  return (
    <div className="mys-month-wrap">
      <div className="sch-month-dow-header">
        {DAYS.map((day, i) => (
          <div key={day} className={`sch-month-dow ${i >= 5 ? "weekend" : ""}`}>{day}</div>
        ))}
      </div>
      <div className="mys-month-grid">
        {Array.from({ length: rows * 7 }).map((_, cellIdx) => {
          const day       = cellIdx - MONTH_START_OFFSET + 1;
          const isValid   = day >= 1 && day <= MONTH_DAYS;
          const isWeekend = cellIdx % 7 >= 5;
          const isCurWeek = CURRENT_WEEK.includes(day);
          const isToday   = day === CURRENT_WEEK[0];
          const shift     = isValid ? (monthMap[day] ?? "OFF") : null;
          const meta      = shift ? SHIFT_META[shift] : null;

          return (
            <motion.div
              key={cellIdx}
              className={`mys-month-cell ${!isValid ? "empty" : ""} ${isWeekend ? "weekend" : ""} ${isCurWeek ? "cur-week" : ""} ${isToday ? "today" : ""}`}
              initial={isValid ? { opacity: 0, scale: 0.9 } : {}}
              animate={isValid ? { opacity: 1, scale: 1 } : {}}
              transition={isValid ? { delay: Math.floor(cellIdx / 7) * 0.05 + (cellIdx % 7) * 0.015, duration: 0.22 } : {}}
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
      <div className="sch-legend">
        <div className="sch-legend-shifts">
          {(Object.entries(SHIFT_META) as [ShiftType, typeof SHIFT_META.AM][]).map(([, meta]) => (
            <div key={meta.label} className="sch-legend-item">
              <span className="sch-legend-dot"  style={{ background: meta.dot }} />
              <span className="sch-legend-name">{meta.label}</span>
              <span className="sch-legend-time">{meta.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
