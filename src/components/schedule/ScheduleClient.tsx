"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronLeft, ChevronRight, Download, AlignJustify, LayoutGrid } from "lucide-react";
import {
  ViewMode,
  WeekSchedule,
  MonthSchedule,
  SHIFT_CYCLE,
  makeWeekSchedule,
  makeMonthSchedule,
} from "./types";
import WeekView from "./WeekView";
import MonthView from "./MonthView";

export default function ScheduleClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({});
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule>({});
  const [genKey, setGenKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setWeekSchedule(makeWeekSchedule());
      setMonthSchedule(makeMonthSchedule());
      setMounted(true);
    });
  }, []);

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
      {!mounted ? (
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
      )}
    </>
  );
}
