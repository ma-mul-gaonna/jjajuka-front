"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HardConstraintForm from "./HardConstraintForm";
import CustomRuleList from "./CustomRuleList";
import { HardConstraint, CustomRule } from "@/types/rules";

const STEPS = ["규칙 검토", "제약 조건 적용", "조합 계산", "스케줄 최적화", "완료"];

export default function RulesClient() {
  const [constraint, setConstraint] = useState<HardConstraint>({
    minRestHours: 11,
    maxConsecutiveDays: 6,
    maxShiftsPerDay: 2,
    requiredCount: 3,
  });
  const [rules, setRules] = useState<CustomRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/schedule-rules")
      .then((r) => r.json())
      .then((json) => {
        const raw = json.data ?? json;
        const arr: { minRestHours: number; maxConsecutiveDays: number; maxShiftsPerDay: number; requiredCount: number; customValues?: { id: number; value: string }[] }[] =
          Array.isArray(raw) ? raw : [raw];
        if (arr.length === 0) return;
        const first = arr[0];
        setConstraint({
          minRestHours:       first.minRestHours,
          maxConsecutiveDays: first.maxConsecutiveDays,
          maxShiftsPerDay:    first.maxShiftsPerDay,
          requiredCount:      first.requiredCount,
        });
        const vals = first.customValues ?? [];
        setRules(vals.map((cv) => ({ id: cv.id, text: cv.value })));
      })
      .catch(() => {});
  }, []);

  const handleAdd = (text: string) => {
    setRules((prev) => [...prev, { id: -Date.now(), text }]);
  };

  const handleDelete = (id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleGenerate = async () => {
    if (loading) return;
    setDone(false);
    setLoading(true);

    const now = new Date();
    const scheduleYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    for (let i = 0; i < STEPS.length - 1; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    }

    try {
      const res = await fetch("/api/schedules/work-schedules/generate-with-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleYearMonth,
          reason: `${scheduleYearMonth} 근무표 자동 생성`,
          rule: {
            minRestHours:       constraint.minRestHours,
            maxConsecutiveDays: constraint.maxConsecutiveDays,
            maxShiftsPerDay:    constraint.maxShiftsPerDay,
            requiredCount:      constraint.requiredCount,
            customValues:       rules.map((r) => r.text),
          },
          userRequests: rules.map((r) => r.text),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const groupId = (json.data ?? json).scheduleGroupId;
        if (groupId) localStorage.setItem("scheduleGroupId", String(groupId));
      }
    } catch {}

    setCurrentStep(STEPS.length - 1);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setDone(true);
    setTimeout(() => {
      setCurrentStep(-1);
      setDone(false);
      router.push("/admin/dashboard");
    }, 1500);
  };

  return (
    <>
      <motion.div
        className="rules-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h2 className="rules-title">근무 규칙 설정</h2>
          <p className="rules-subtitle">스케줄 생성 시 적용할 제약 조건과 우선 규칙을 설정하세요.</p>
        </div>
        <span className="rules-mode-badge">ADMIN</span>
      </motion.div>

      <div className="rules-body">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <HardConstraintForm value={constraint} onChange={setConstraint} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
        >
          <CustomRuleList rules={rules} onAdd={handleAdd} onDelete={handleDelete} />
        </motion.div>
      </div>

      <motion.div
        className="rules-footer"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.24 }}
      >
        <motion.button
          className={`rules-generate-btn ${done ? "done" : ""}`}
          onClick={handleGenerate}
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
        >
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.span key="done" className="rules-btn-inner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <CheckCircle size={16} /> 스케줄 생성 완료
              </motion.span>
            ) : loading ? (
              <motion.span key="loading" className="rules-btn-inner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <motion.span className="rules-spinner" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                {STEPS[currentStep] ?? "처리 중..."}
              </motion.span>
            ) : (
              <motion.span key="idle" className="rules-btn-inner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <Play size={15} fill="currentColor" /> 규칙 적용 및 스케줄 자동 생성
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {loading && (
            <motion.div className="rules-progress" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={step}
                  className={`rules-progress-step ${i < currentStep ? "completed" : i === currentStep ? "active" : ""}`}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: i <= currentStep ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span className="rules-progress-dot" animate={i === currentStep ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.6, repeat: i === currentStep ? Infinity : 0 }} />
                  {step}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !done && (
          <p className="rules-generate-hint">설정한 규칙 기준으로 최적의 조합을 계산합니다</p>
        )}
      </motion.div>
    </>
  );
}
