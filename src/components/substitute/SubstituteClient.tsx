"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Calendar, Clock, Send,
  ChevronDown, ChevronUp, User, AlertCircle,
} from "lucide-react";
import type { RecommendationItem } from "@/features/substitute/api/substituteApi";

interface RecommendationResponse {
  vacancyMemberName: string;
  scheduleId: number;
  vacancyId: number;
  absence: { userId: number; date: string; shiftName: string };
  recommendations: RecommendationItem[];
  warnings: string[];
}

const SHIFT_LABEL: Record<string, string> = {
  DAY:     "주간",
  MORNING: "주간",
  EVENING: "오후",
  NIGHT:   "야간",
};

const SHIFT_META: Record<string, { color: string; bg: string }> = {
  DAY:     { color: "#1d4ed8", bg: "#eff6ff" },
  MORNING: { color: "#1d4ed8", bg: "#eff6ff" },
  EVENING: { color: "#b45309", bg: "#fffbeb" },
  NIGHT:   { color: "#6d28d9", bg: "#f5f3ff" },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
      <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 36, textAlign: "right" }}>{score}점</span>
    </div>
  );
}

function VacancyCard({ data, index }: { data: RecommendationResponse; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [requesting, setRequesting] = useState<number | null>(null);
  const [requested, setRequested] = useState<Set<number>>(new Set());

  const handleRequest = async (userId: number) => {
    setRequesting(userId);
    try {
      const res = await fetch("/api/shift-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMemberId: userId, scheduleId: data.scheduleId }),
      });
      if (res.ok) setRequested((prev) => new Set(prev).add(userId));
    } finally {
      setRequesting(null);
    }
  };

  const shiftType = data.absence?.shiftName ?? "DAY";
  const shiftMeta = SHIFT_META[shiftType] ?? SHIFT_META.DAY;
  const shiftLabel = SHIFT_LABEL[shiftType] ?? shiftType;
  const recs: RecommendationItem[] = data.recommendations ?? [];

  return (
    <motion.div className="db-card" style={{ padding: 0, overflow: "hidden" }} {...fadeUp(0.06 + index * 0.05)}>
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
          background: shiftMeta.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AlertCircle size={18} color={shiftMeta.color} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{data.vacancyMemberName}</span>
            <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, color: shiftMeta.color, background: shiftMeta.bg }}>
              {shiftLabel}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} /> {data.absence?.date}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} /> {shiftLabel}
            </span>
          </div>
        </div>

        <div style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid var(--border)", padding: "14px 20px 18px", background: "var(--surface-secondary)" }}>
              {recs.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text-secondary)", padding: "8px 0" }}>
                  추천 가능한 인력이 없습니다.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <Sparkles size={13} color="#6d28d9" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6d28d9" }}>
                      AI 추천 인력 {recs.length}명
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {recs.map((c, ci) => (
                      <motion.div
                        key={c.userId}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ci * 0.06 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 16px", borderRadius: 10,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                        }}
                      >
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                          background: ci === 0 ? "#111" : "var(--gray-100)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                          color: ci === 0 ? "#fff" : "var(--text-secondary)",
                        }}>
                          {c.rank}
                        </div>

                        <div style={{
                          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                          background: "var(--gray-100)", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <User size={16} color="var(--text-secondary)" />
                        </div>

                        <div style={{ width: 80, flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{c.userName ?? `직원 ${c.userId}`}</div>
                        </div>

                        <ScoreBar score={c.score} />

                        <div style={{
                          flex: 1, fontSize: 11,
                          padding: "4px 10px", borderRadius: 99,
                          background: "var(--gray-100)", color: "var(--text-secondary)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {c.reasons}
                        </div>

                        <motion.button
                          whileHover={!requested.has(c.userId) ? { scale: 1.04 } : {}}
                          whileTap={!requested.has(c.userId) ? { scale: 0.96 } : {}}
                          onClick={() => !requested.has(c.userId) && handleRequest(c.userId)}
                          disabled={requesting === c.userId}
                          style={{
                            flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                            padding: "7px 16px", borderRadius: 8, border: "none",
                            cursor: requested.has(c.userId) ? "default" : "pointer",
                            fontSize: 12, fontWeight: 600,
                            background: requested.has(c.userId) ? "#d1fae5" : ci === 0 ? "#111" : "var(--gray-100)",
                            color: requested.has(c.userId) ? "#065f46" : ci === 0 ? "#fff" : "var(--text-primary)",
                          }}
                        >
                          {requested.has(c.userId) ? "요청됨" : requesting === c.userId ? "요청 중..." : <><Send size={12} /> 요청</>}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SubstituteClient() {
  const [dataList, setDataList] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/replacement-recommendations/exist")
      .then((r) => r.json())
      .then((json) => {
        const raw = json.data ?? json;
        const arr = Array.isArray(raw) ? raw.filter(Boolean) : (raw ? [raw] : []);
        setDataList(arr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
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
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
            불러오는 중...
          </div>
        ) : dataList.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
            처리 중인 결원 요청이 없습니다
          </div>
        ) : (
          dataList.map((d, i) => (
            <VacancyCard key={i} data={d} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
