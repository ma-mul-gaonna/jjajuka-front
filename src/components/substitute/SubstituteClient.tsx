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

type SwapStatus = "PENDING" | "ACCEPTED" | "REJECTED";

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

function swapButtonStyle(status: SwapStatus | null, isFirst: boolean) {
  if (status === "ACCEPTED") return { background: "#d1fae5", color: "#065f46" };
  if (status === "REJECTED") return { background: "#fee2e2", color: "#991b1b" };
  if (status === "PENDING")  return { background: "var(--gray-100)", color: "var(--text-secondary)" };
  return { background: isFirst ? "#111" : "var(--gray-100)", color: isFirst ? "#fff" : "var(--text-primary)" };
}

function swapButtonLabel(status: SwapStatus | null, requesting: boolean) {
  if (status === "ACCEPTED") return "배정됨";
  if (status === "REJECTED") return "거절됨";
  if (status === "PENDING")  return "요청됨";
  if (requesting)            return "요청 중...";
  return <><Send size={12} /> 요청</>;
}

function VacancyCard({
  data, index, swapMap,
}: {
  data: RecommendationResponse;
  index: number;
  swapMap: Map<string, SwapStatus>;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const [requesting, setRequesting] = useState<number | null>(null);
  const [localMap, setLocalMap] = useState<Map<number, SwapStatus>>(new Map());

  const handleRequest = async (userId: number) => {
    setRequesting(userId);
    try {
      const res = await fetch("/api/shift-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMemberId: userId, scheduleId: data.scheduleId }),
      });
      if (res.ok) {
        setLocalMap((prev) => new Map(prev).set(userId, "PENDING"));
      }
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
                    {recs.map((c, ci) => {
                      const mapKey = `${data.scheduleId}_${c.userId}`;
                      const status: SwapStatus | null = localMap.get(c.userId) ?? swapMap.get(mapKey) ?? null;
                      const isActive = status === null;
                      const btnStyle = swapButtonStyle(status, ci === 0);

                      return (
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
                            whileHover={isActive ? { scale: 1.04 } : {}}
                            whileTap={isActive ? { scale: 0.96 } : {}}
                            onClick={() => isActive && handleRequest(c.userId)}
                            disabled={requesting === c.userId}
                            style={{
                              flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                              padding: "7px 16px", borderRadius: 8, border: "none",
                              cursor: isActive ? "pointer" : "default",
                              fontSize: 12, fontWeight: 600,
                              ...btnStyle,
                            }}
                          >
                            {swapButtonLabel(status, requesting === c.userId)}
                          </motion.button>
                        </motion.div>
                      );
                    })}
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

function buildSwapMap(list: { requestSchedule: { scheduleId: number }; target: { id: number }; status: SwapStatus }[]) {
  const map = new Map<string, SwapStatus>();
  list.forEach((s) => {
    const key = `${s.requestSchedule.scheduleId}_${s.target.id}`;
    const existing = map.get(key);
    if (!existing || s.status === "ACCEPTED" || (s.status === "PENDING" && existing === "REJECTED")) {
      map.set(key, s.status);
    }
  });
  return map;
}

export default function SubstituteClient() {
  const [dataList, setDataList] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [swapMap, setSwapMap] = useState<Map<string, SwapStatus>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const [recRes, swapRes] = await Promise.all([
          fetch("/api/replacement-recommendations/exist").then((r) => r.json()).catch(() => null),
          fetch("/api/shift-swap").then((r) => r.json()).catch(() => []),
        ]);
        if (recRes) {
          const raw = recRes.data ?? recRes;
          setDataList((Array.isArray(raw) ? raw.filter(Boolean) : raw ? [raw] : []).reverse());
        }
        const list = Array.isArray(swapRes) ? swapRes : (swapRes?.data ?? []);
        setSwapMap(buildSwapMap(list));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // exist 30초마다 자동 갱신
  useEffect(() => {
    const id = setInterval(async () => {
      const json = await fetch("/api/replacement-recommendations/exist").then((r) => r.json()).catch(() => null);
      if (!json) return;
      const raw = json.data ?? json;
      const arr: RecommendationResponse[] = Array.isArray(raw) ? raw.filter(Boolean) : raw ? [raw] : [];
      if (arr.length > 0) setDataList([...arr].reverse());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const refreshSwapMap = () =>
    fetch("/api/shift-swap")
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : (json.data ?? []);
        setSwapMap(buildSwapMap(list));
      })
      .catch(() => {});

  // PENDING이 있는 동안 10초마다 swap 상태 폴링
  useEffect(() => {
    const hasPending = [...swapMap.values()].some((s) => s === "PENDING");
    if (!hasPending) return;

    const id = setInterval(refreshSwapMap, 10_000);
    return () => clearInterval(id);
  }, [swapMap]);

  // SSE vacancy-update 이벤트로 즉시 갱신
  useEffect(() => {
    window.addEventListener("swap-status-updated", refreshSwapMap);
    return () => window.removeEventListener("swap-status-updated", refreshSwapMap);
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // 1. exist 먼저 → 즉시 표시
      const existJson = await fetch("/api/replacement-recommendations/exist").then((r) => r.json()).catch(() => null);
      const existRaw = existJson?.data ?? existJson;
      const existArr: RecommendationResponse[] = Array.isArray(existRaw) ? existRaw.filter(Boolean) : (existRaw ? [existRaw] : []);
      if (existArr.length > 0) setDataList([...existArr].reverse());

      // 2. AI 분석 호출 (타임아웃 무시하고 결과만 반영)
      const recJson = await fetch("/api/replacement-recommendations").then((r) => r.json()).catch(() => null);
      const recRaw = recJson?.data ?? recJson;
      const recArr: RecommendationResponse[] = Array.isArray(recRaw) ? recRaw.filter(Boolean) : (recRaw ? [recRaw] : []);

      // 두 목록 합쳐서 vacancyId 기준 중복 제거 (recArr 우선)
      const merged = new Map<number, RecommendationResponse>();
      [...existArr, ...recArr].forEach((item) => {
        if (item?.vacancyId != null) merged.set(item.vacancyId, item);
      });
      if (merged.size > 0) setDataList([...merged.values()].reverse());

      // 3. swap 상태 갱신
      const swapRes = await fetch("/api/shift-swap").then((r) => r.json()).catch(() => []);
      const list = Array.isArray(swapRes) ? swapRes : (swapRes?.data ?? []);
      setSwapMap(buildSwapMap(list));
    } finally {
      setAnalyzing(false);
    }
  };

  const hasData = dataList.length > 0;

  return (
    <div>
      <motion.div className="rules-header" {...fadeUp(0)}>
        <div>
          <h2 className="rules-title">대체인력 추천</h2>
          <p className="rules-subtitle">AI가 근무 가능 여부, 선호도, 연속 근무를 분석해 최적 인력을 추천합니다</p>
        </div>
        {/* 결과 있을 때만 헤더에 작게 표시 */}
        {hasData && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            whileHover={!analyzing ? { scale: 1.03 } : {}}
            whileTap={!analyzing ? { scale: 0.97 } : {}}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", background: "#f5f3ff", borderRadius: 8,
              border: "1px solid #ddd6fe", cursor: analyzing ? "default" : "pointer",
              opacity: analyzing ? 0.6 : 1, fontSize: 12,
            }}
          >
            <Sparkles size={13} color="#6d28d9" />
            <span style={{ fontWeight: 600, color: "#4c1d95" }}>
              {analyzing ? "분석 중..." : "재분석"}
            </span>
          </motion.button>
        )}
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
            불러오는 중...
          </div>
        ) : !hasData ? (
          /* 데이터 없을 때 중앙에 큰 버튼 */
          <motion.div {...fadeUp(0.05)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={26} color="#6d28d9" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>대체인력 AI 분석</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>버튼을 눌러 결원에 맞는 최적 인력을 추천받으세요</div>
            </div>
            <motion.button
              onClick={handleAnalyze}
              disabled={analyzing}
              whileHover={!analyzing ? { scale: 1.04 } : {}}
              whileTap={!analyzing ? { scale: 0.97 } : {}}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 28px", background: analyzing ? "#ede9fe" : "#6d28d9",
                borderRadius: 10, border: "none",
                cursor: analyzing ? "default" : "pointer",
                fontSize: 14, fontWeight: 700, color: "#fff",
              }}
            >
              <Sparkles size={15} color="#fff" />
              {analyzing ? "분석 중..." : "AI 분석 시작"}
            </motion.button>
          </motion.div>
        ) : (
          dataList.map((d, i) => (
            <VacancyCard key={i} data={d} index={i} swapMap={swapMap} />
          ))
        )}
      </div>
    </div>
  );
}
