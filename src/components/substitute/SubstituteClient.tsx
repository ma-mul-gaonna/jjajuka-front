"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Calendar, Clock, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, User, AlertCircle,
} from "lucide-react";
// import { fetchRecommendations } from "@/features/substitute/api/substituteApi";
import type { RecommendationData, ShiftType } from "@/features/substitute/api/substituteApi";

// ─── 상수 ──────────────────────────────────────────────────

const SHIFT_LABEL: Record<ShiftType, string> = {
  DAY:     "주간",
  EVENING: "오후",
  NIGHT:   "야간",
};

const SHIFT_META: Record<ShiftType, { color: string; bg: string }> = {
  DAY:     { color: "#1d4ed8", bg: "#eff6ff" },
  EVENING: { color: "#b45309", bg: "#fffbeb" },
  NIGHT:   { color: "#6d28d9", bg: "#f5f3ff" },
};

// ─── 목데이터 ───────────────────────────────────────────────

const MOCK_DATA: RecommendationData[] = [
  {
    vacancyId: 1,
    vacancyInfo: {
      memberId: 10,
      memberName: "김철수",
      scheduleId: 5,
      workDate: "2026-04-15",
      shiftType: "DAY",
      reason: "개인 사유",
    },
    recommendations: [
      {
        rank: 1,
        candidateMemberId: 12,
        candidateName: "이영희",
        matchScore: 95,
        reason: "같은 팀 소속, 해당 근무 경험 多",
        availableSchedules: [{ scheduleId: 20, workDate: "2026-04-15", shiftType: "DAY" }],
      },
      {
        rank: 2,
        candidateMemberId: 15,
        candidateName: "박민수",
        matchScore: 88,
        reason: "교대 가능 시간대 일치",
        availableSchedules: [{ scheduleId: 25, workDate: "2026-04-15", shiftType: "DAY" }],
      },
    ],
    totalCandidates: 2,
  },
  {
    vacancyId: 2,
    vacancyInfo: {
      memberId: 7,
      memberName: "이서연",
      scheduleId: 9,
      workDate: "2026-04-17",
      shiftType: "NIGHT",
      reason: "가족 경조사",
    },
    recommendations: [
      {
        rank: 1,
        candidateMemberId: 20,
        candidateName: "최현우",
        matchScore: 91,
        reason: "야간 근무 경험 풍부, 연속 근무 없음",
        availableSchedules: [{ scheduleId: 31, workDate: "2026-04-17", shiftType: "NIGHT" }],
      },
      {
        rank: 2,
        candidateMemberId: 22,
        candidateName: "정다은",
        matchScore: 74,
        reason: "주간 여유 시간 충분",
        availableSchedules: [{ scheduleId: 33, workDate: "2026-04-17", shiftType: "NIGHT" }],
      },
      {
        rank: 3,
        candidateMemberId: 24,
        candidateName: "한승민",
        matchScore: 61,
        reason: "대체 가능 시간대",
        availableSchedules: [],
      },
    ],
    totalCandidates: 3,
  },
  {
    vacancyId: 3,
    vacancyInfo: {
      memberId: 3,
      memberName: "박지호",
      scheduleId: 14,
      workDate: "2026-04-19",
      shiftType: "EVENING",
      reason: "병원 진료",
    },
    recommendations: [
      {
        rank: 1,
        candidateMemberId: 30,
        candidateName: "임소윤",
        matchScore: 89,
        reason: "오후 근무 선호, 해당 날 휴무",
        availableSchedules: [{ scheduleId: 40, workDate: "2026-04-19", shiftType: "EVENING" }],
      },
    ],
    totalCandidates: 1,
  },
];

// ─── ScoreBar ──────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: 160, flexShrink: 0 }}>
      <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 32 }}>{score}점</span>
    </div>
  );
}

// ─── VacancyCard ───────────────────────────────────────────

function VacancyCard({ data, index }: { data: RecommendationData; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [assignedCandidateId, setAssignedCandidateId] = useState<number | null>(null);
  const [closed, setClosed] = useState(false);

  const { vacancyInfo, recommendations } = data;
  const shiftMeta = SHIFT_META[vacancyInfo.shiftType];
  const isResolved = assignedCandidateId !== null || closed;

  return (
    <motion.div
      className="db-card"
      style={{ padding: 0, overflow: "hidden" }}
      {...fadeUp(0.06 + index * 0.05)}
    >
      {/* 요청 헤더 */}
      <button
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 12, padding: "16px 20px", background: "none",
          border: "none", cursor: "pointer", textAlign: "left",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: isResolved ? "#f0fdf4" : shiftMeta.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isResolved
            ? <CheckCircle2 size={18} color="#10b981" />
            : <AlertCircle size={18} color={shiftMeta.color} />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{vacancyInfo.memberName}</span>
            <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, color: shiftMeta.color, background: shiftMeta.bg }}>
              {SHIFT_LABEL[vacancyInfo.shiftType]}
            </span>
            {isResolved && (
              <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, color: "#065f46", background: "#f0fdf4" }}>
                배정 완료
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} /> {vacancyInfo.workDate}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} /> {SHIFT_LABEL[vacancyInfo.shiftType]}
            </span>
            <span>{vacancyInfo.reason}</span>
          </div>
        </div>

        <div style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* 추천 목록 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px 16px", background: "var(--surface-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Sparkles size={13} color="#6d28d9" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6d28d9" }}>
                  AI 추천 인력 {data.totalCandidates}명
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recommendations.map((c, ci) => {
                  const isSelected = assignedCandidateId === c.candidateMemberId;
                  return (
                    <motion.div
                      key={c.candidateMemberId}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ci * 0.06 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 10,
                        border: `1px solid ${isSelected ? "#bbf7d0" : "var(--border)"}`,
                        background: isSelected ? "#f0fdf4" : "var(--surface)",
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        background: ci === 0 ? "#111" : "var(--gray-100)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        color: ci === 0 ? "#fff" : "var(--text-secondary)",
                      }}>
                        {c.rank}
                      </div>

                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: "var(--gray-100)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <User size={15} color="var(--text-secondary)" />
                      </div>

                      <div style={{ width: 90, flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.candidateName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                          {c.availableSchedules.length > 0
                            ? `${c.availableSchedules[0].workDate} 가능`
                            : "일정 없음"}
                        </div>
                      </div>

                      <ScoreBar score={c.matchScore} />

                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
                        <span style={{
                          fontSize: 11, padding: "2px 7px", borderRadius: 99,
                          background: "var(--gray-100)", color: "var(--text-secondary)",
                        }}>
                          {c.reason}
                        </span>
                      </div>

                      {isResolved ? (
                        isSelected && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                            <CheckCircle2 size={14} /> 배정됨
                          </div>
                        )
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setAssignedCandidateId(c.candidateMemberId)}
                          style={{
                            flexShrink: 0, padding: "6px 14px", borderRadius: 8,
                            border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                            background: ci === 0 ? "#111" : "var(--gray-100)",
                            color: ci === 0 ? "#fff" : "var(--text-primary)",
                          }}
                        >
                          배정
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {isResolved ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, marginTop: 10,
                    padding: "8px 12px", borderRadius: 8,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                  }}
                >
                  <CheckCircle2 size={13} color="#10b981" />
                  <span style={{ fontSize: 12, color: "#065f46", fontWeight: 500 }}>
                    대체인력 배정이 완료되었습니다.
                  </span>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setClosed(true); setExpanded(false); }}
                  style={{
                    marginTop: 10, width: "100%", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px", borderRadius: 8, border: "1px solid var(--border)",
                    background: "none", cursor: "pointer", fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  <XCircle size={13} /> 배정 없이 닫기
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── SubstituteClient ──────────────────────────────────────

export default function SubstituteClient() {
  // TODO: API 연동 시 아래 주석 해제 후 MOCK_DATA 제거
  // const [dataList, setDataList] = useState<RecommendationData[]>([]);
  // useEffect(() => {
  //   Promise.all(vacancyIds.map(fetchRecommendations)).then(setDataList);
  // }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <motion.div className="rules-header" {...fadeUp(0)}>
        <div>
          <h2 className="rules-title">대체인력 추천</h2>
          <p className="rules-subtitle">AI가 근무 가능 여부, 선호도, 연속 근무를 분석해 최적 인력을 추천합니다</p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", background: "#f5f3ff", borderRadius: 8,
          border: "1px solid #ddd6fe",
        }}>
          <Sparkles size={14} color="#6d28d9" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#4c1d95" }}>AI 분석 완료</span>
        </div>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
        {MOCK_DATA.map((d, i) => (
          <VacancyCard key={d.vacancyId} data={d} index={i} />
        ))}
      </div>
    </div>
  );
}
