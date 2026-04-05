"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Sparkles,
  Settings2,
  Users,
  AlignJustify,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import MonthView from "@/components/schedule/MonthView";
import WeekView from "@/components/schedule/WeekView";
import {
  Employee,
  MonthSchedule,
  WeekSchedule,
  ScheduleGroupResponse,
  SHIFT_API_TO_TYPE,
  SHIFT_CYCLE,
  ViewMode,
  CURRENT_WEEK,
  MONTH_DAYS,
} from "@/components/schedule/types";

const DEFAULT_SCHEDULE_GROUP_ID = 2;

// ─── Component ───────────────────────────────────────────
export default function HomeClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({});
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule>({});
  const [genKey] = useState(0);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    vacancyRequestCount: 0,
    vacancyAcceptCount: 0,
    vacancyRejectCount: 0,
  });

  useEffect(() => {
    const scheduleGroupId = Number(localStorage.getItem("scheduleGroupId")) || DEFAULT_SCHEDULE_GROUP_ID;
    fetch(`/api/schedules/work-schedules/${scheduleGroupId}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("[home/schedule] raw:", json);
        const data: ScheduleGroupResponse = json.data ?? json;
        if (!data?.days) { setScheduleLoaded(true); return; }

        const empMap = new Map<number, Employee>();
        const wSched: WeekSchedule = {};
        const mSched: MonthSchedule = {};

        data.days.forEach((day) => {
          const date = new Date(day.date);
          const dayOfMonth = date.getDate();
          const dayOfWeek = date.getDay();
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
        setScheduleLoaded(true);
      })
      .catch((err) => {
        console.error("[home/schedule] error:", err);
        setScheduleLoaded(true);
      });

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        const data = json.data ?? json;
        setDashboardStats({
          vacancyRequestCount: data.vacancyRequestCount ?? 0,
          vacancyAcceptCount: data.vacancyAcceptCount ?? 0,
          vacancyRejectCount: data.vacancyRejectCount ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  const toggleShift = (empId: number, dayIdx: number) => {
    const key = `${empId}-${dayIdx}`;
    const idx = SHIFT_CYCLE.indexOf(weekSchedule[key]);
    setWeekSchedule((s) => ({
      ...s,
      [key]: SHIFT_CYCLE[(idx + 1) % SHIFT_CYCLE.length],
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 결원 요청 배너 */}
      {dashboardStats.vacancyRequestCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: "22px 24px",
            borderRadius: 14,
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              flexShrink: 0,
              background: "var(--gray-100)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={24} color="#111" />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>
                미처리 결원 요청
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "3px 11px",
                  borderRadius: 99,
                  background: "#111",
                  color: "#fff",
                }}
              >
                {dashboardStats.vacancyRequestCount}건
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                margin: "0 0 10px",
                lineHeight: 1.6,
              }}
            >
              아직 배정되지 않은 결원 요청이 있습니다. 빠르게 처리하세요.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#111",
              }}
            >
              <Sparkles size={12} color="#fff" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                AI가 근무 가능 여부·선호도·연속 근무를 분석해 최적 인력을 자동
                추천합니다
              </span>
            </div>
          </div>

          <Link
            href="/admin/substitute"
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 20px",
              borderRadius: 10,
              background: "#111",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            대체인력 추천 보기 <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* 스코어보드 + 바로가기 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.28 }}
        style={{
          display: "flex", gap: 0,
          borderRadius: 12,
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* 스코어 3칸 */}
        {[
          { label: "결원 요청", value: dashboardStats.vacancyRequestCount },
          { label: "결원 요청 수락", value: dashboardStats.vacancyAcceptCount },
          { label: "결원 요청 거절", value: dashboardStats.vacancyRejectCount },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRight: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8 }}>
              {card.label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#111", lineHeight: 1, margin: 0 }}>
              {card.value}
              <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 3 }}>건</span>
            </p>
          </div>
        ))}

        {/* 바로가기 3칸 */}
        {[
          { label: "규칙 설정",     href: "/admin/rules",      icon: <Settings2 size={15} /> },
          { label: "직원 관리",     href: "/admin/employees",  icon: <Users size={15} /> },
          { label: "대체인력 추천", href: "/admin/substitute", icon: <Sparkles size={15} /> },
        ].map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              width: 80, flexShrink: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
              padding: "16px 8px",
              borderRight: i < 2 ? "1px solid var(--border)" : "none",
              textDecoration: "none",
              color: "var(--text-primary)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ display: "flex", color: "var(--text-secondary)" }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{item.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* 근무표 캘린더 */}
      <motion.div
        className="db-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.3 }}
        style={{ padding: 0, overflow: "hidden" }}
      >
        {/* 툴바 */}
        <div
          className="sch-toolbar"
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "14px 20px",
          }}
        >
          <div className="sch-toolbar-left">
            <div className="sch-week-nav">
              <button className="sch-nav-btn">
                <ChevronLeft size={15} />
              </button>
              <span className="sch-week-label">
                {viewMode === "week" ? "2026년 3월 4주차" : "2026년 3월"}
              </span>
              <button className="sch-nav-btn">
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="sch-view-toggle">
              <button
                className={`sch-toggle-btn ${viewMode === "month" ? "active" : ""}`}
                onClick={() => setViewMode("month")}
              >
                <LayoutGrid size={13} /> 월간
              </button>
              <button
                className={`sch-toggle-btn ${viewMode === "week" ? "active" : ""}`}
                onClick={() => setViewMode("week")}
              >
                <AlignJustify size={13} /> 주간
              </button>
            </div>
          </div>
        </div>

        {/* 캘린더 뷰 */}
        <div style={{ padding: "16px 20px" }}>
          {!scheduleLoaded ? (
            <div
              style={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
              로딩 중...
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {viewMode === "month" ? (
                  <MonthView
                    employees={employees}
                    schedule={monthSchedule}
                    genKey={genKey}
                  />
                ) : (
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
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
