"use client";

import { motion } from "framer-motion";
import {
  Users, CalendarCheck, AlertTriangle,
  ArrowRight, Settings2, ChevronRight, Clock, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { STATS, TODAY_SHIFTS, WEEKLY_COVERAGE, VIOLATIONS, REQUESTS } from "./mockData";

const AI_INSIGHTS = [
  {
    type: "warning" as const,
    message: "이번 주 오후 근무 인력이 평균보다 2명 부족합니다. 충원을 권장합니다.",
    action: { label: "대체인력 추천 보기", href: "/admin/substitute" },
  },
  {
    type: "danger" as const,
    message: "박지훈 님의 야간 연속 근무가 4일 감지됐습니다. 규칙 위반 가능성이 있습니다.",
    action: { label: "규칙 확인", href: "/admin/rules" },
  },
  {
    type: "info" as const,
    message: "토·일 근무 커버리지가 43%로 낮습니다. 주말 근무표 재검토를 권장합니다.",
    action: { label: "근무표 보기", href: "/admin/schedule" },
  },
];

const INSIGHT_META = {
  warning: { color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  danger:  { color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  info:    { color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
};

// ─── Helpers ─────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3 },
});

// ─── Component ───────────────────────────────────────────
export default function DashboardClient() {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayStr = dayNames[today.getDay()];

  return (
    <div className="db-root">

      {/* Greeting */}
      <motion.div className="db-greeting" {...fadeUp(0)}>
        <p className="db-greeting-date">{dateStr} ({dayStr}) · 2026년 3월 4주차</p>
        <h2 className="db-greeting-title">안녕하세요, 관리자님 👋</h2>
      </motion.div>

      {/* Stats */}
      <motion.div className="db-stats" {...fadeUp(0.05)}>
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`db-stat-card ${stat.warn ? "warn" : ""}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.28 }}
            whileHover={{ y: -2 }}
          >
            <div className="db-stat-top">
              <span className="db-stat-label">{stat.label}</span>
              <stat.icon size={15} className="db-stat-icon" />
            </div>
            <div className="db-stat-value-row">
              <span className="db-stat-value">{stat.value}</span>
              <span className="db-stat-unit">{stat.unit}</span>
              {stat.trend && <span className="db-stat-trend">{stat.trend}</span>}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="db-grid">

        {/* Left column */}
        <div className="db-col-main">

          {/* Today's shifts */}
          <motion.div className="db-card" {...fadeUp(0.15)}>
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title">오늘 근무 현황</h3>
                <p className="db-card-sub">03월 30일 (월) 기준</p>
              </div>
            </div>
            <div className="db-today-grid">
              {TODAY_SHIFTS.map((shift, i) => (
                <motion.div
                  key={shift.type}
                  className="db-today-item"
                  style={{ background: shift.bg }}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  <div className="db-today-top">
                    <span className="db-today-type" style={{ color: shift.color }}>{shift.type}</span>
                    <span className="db-today-time" style={{ color: shift.color }}>{shift.time}</span>
                  </div>
                  <div className="db-today-count" style={{ color: shift.color }}>
                    {shift.count}<span className="db-today-unit">명</span>
                  </div>
                  <div className="db-today-names">
                    {shift.employees.join(" · ")}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly coverage */}
          <motion.div className="db-card" {...fadeUp(0.2)}>
            <div className="db-card-header">
              <h3 className="db-card-title">주간 커버리지</h3>
              <Link href="/admin/schedule" className="db-card-link">
                근무표 보기 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="db-coverage-chart">
              {WEEKLY_COVERAGE.map((d, i) => {
                const ratio = d.active / d.total;
                const isToday = d.day === "월";
                return (
                  <div key={d.day} className={`db-cov-col ${isToday ? "today" : ""} ${i >= 5 ? "weekend" : ""}`}>
                    <div className="db-cov-bar-wrap">
                      <div className="db-cov-bar-track">
                        <motion.div
                          className="db-cov-bar-fill"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: ratio }}
                          transition={{ delay: 0.25 + i * 0.06, duration: 0.45, ease: "easeOut" }}
                          style={{ transformOrigin: "bottom" }}
                        />
                      </div>
                    </div>
                    <span className="db-cov-count">{d.active}/{d.total}</span>
                    <span className={`db-cov-day ${isToday ? "today" : ""}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="db-col-side">

          {/* AI Insights */}
          <motion.div className="db-card" {...fadeUp(0.16)}>
            <div className="db-card-header" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={13} color="#fff" />
                </div>
                <div>
                  <h3 className="db-card-title">AI 인사이트</h3>
                  <p className="db-card-sub">패턴 분석 기반 자동 감지</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {AI_INSIGHTS.map((insight, i) => {
                const meta = INSIGHT_META[insight.type];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    style={{
                      padding: "10px 12px", borderRadius: 10,
                      background: meta.bg, border: `1px solid ${meta.border}`,
                    }}
                  >
                    <p style={{ fontSize: 12, color: meta.color, lineHeight: 1.6, marginBottom: 6 }}>
                      {insight.message}
                    </p>
                    <Link
                      href={insight.action.href}
                      style={{
                        fontSize: 11, fontWeight: 600, color: meta.color,
                        display: "inline-flex", alignItems: "center", gap: 3,
                        textDecoration: "none", opacity: 0.8,
                      }}
                    >
                      {insight.action.label} <ArrowRight size={10} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Rule violations */}
          <motion.div className="db-card" {...fadeUp(0.18)}>
            <div className="db-card-header">
              <div>
                <h3 className="db-card-title">규칙 위반 알림</h3>
                <p className="db-card-sub">{VIOLATIONS.length}건 확인 필요</p>
              </div>
              <Link href="/admin/rules" className="db-card-link">
                규칙 설정 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="db-violations">
              {VIOLATIONS.map((v, i) => (
                <motion.div
                  key={v.id}
                  className={`db-violation-item ${v.severity}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                >
                  <AlertTriangle size={13} className="db-violation-icon" />
                  <div className="db-violation-info">
                    <span className="db-violation-day">{v.day}</span>
                    <span className="db-violation-msg">{v.message}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent requests */}
          <motion.div className="db-card" {...fadeUp(0.23)}>
            <div className="db-card-header">
              <h3 className="db-card-title">최근 요청</h3>
              <Link href="/worker/requests" className="db-card-link">
                전체 보기 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="db-requests">
              {REQUESTS.map((req, i) => (
                <motion.div
                  key={req.id}
                  className="db-request-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 + i * 0.06 }}
                >
                  <div className="db-req-avatar">{req.name[0]}</div>
                  <div className="db-req-info">
                    <span className="db-req-name">{req.name}</span>
                    <span className="db-req-detail">
                      <Clock size={10} />
                      {req.type} · {req.date}
                    </span>
                  </div>
                  <span className={`db-req-status ${req.status}`}>
                    {req.status === "pending" ? "대기" : "승인"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div className="db-card" {...fadeUp(0.28)}>
            <h3 className="db-card-title" style={{ marginBottom: 12 }}>빠른 이동</h3>
            <div className="db-quick-actions">
              {[
                { label: "근무표 생성",  sub: "자동 생성 시작", href: "/admin/schedule", icon: CalendarCheck },
                { label: "규칙 설정",    sub: "제약 조건 관리",  href: "/admin/rules",    icon: Settings2 },
                { label: "직원 관리",    sub: "인원 현황 확인",  href: "/admin/employees", icon: Users },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="db-quick-btn">
                  <action.icon size={15} className="db-quick-icon" />
                  <div className="db-quick-info">
                    <span className="db-quick-label">{action.label}</span>
                    <span className="db-quick-sub">{action.sub}</span>
                  </div>
                  <ChevronRight size={14} className="db-quick-arrow" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
