"use client";

import { useState } from "react";
import { Play, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HardConstraintForm from "./HardConstraintForm";
import CustomRuleList from "./CustomRuleList";
import { HardConstraint, CustomRule } from "@/types/rules";

const INITIAL_RULES: CustomRule[] = [
  { id: 1, text: "야간 근무 조에는 반드시 숙련자(A등급)를 1명 이상 포함할 것" },
  { id: 2, text: "육아 중인 직원은 가급적 월요일 오전 근무에서 제외할 것" },
];

const STEPS = ["규칙 검토", "제약 조건 적용", "조합 계산", "스케줄 최적화", "완료"];

export default function RulesClient() {
  const [constraint, setConstraint] = useState<HardConstraint>({
    minRestHours: 11,
    maxConsecutiveDays: 6,
  });
  const [customRules, setCustomRules] = useState<CustomRule[]>(INITIAL_RULES);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);

  const handleGenerate = async () => {
    if (loading) return;
    setDone(false);
    setLoading(true);

    for (let i = 0; i < STEPS.length - 1; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    }

    setCurrentStep(STEPS.length - 1);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setDone(true);
    setTimeout(() => { setCurrentStep(-1); setDone(false); }, 3000);
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
          <p className="rules-subtitle">
            스케줄 생성 시 적용할 제약 조건과 우선 규칙을 설정하세요.
          </p>
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
          <CustomRuleList rules={customRules} onChange={setCustomRules} />
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
              <motion.span
                key="done"
                className="rules-btn-inner"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle size={16} />
                스케줄 생성 완료
              </motion.span>
            ) : loading ? (
              <motion.span
                key="loading"
                className="rules-btn-inner"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  className="rules-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                {STEPS[currentStep] ?? "처리 중..."}
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                className="rules-btn-inner"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Play size={15} fill="currentColor" />
                규칙 적용 및 스케줄 자동 생성
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Progress Steps */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="rules-progress"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={step}
                  className={`rules-progress-step ${i < currentStep ? "completed" : i === currentStep ? "active" : ""}`}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: i <= currentStep ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    className="rules-progress-dot"
                    animate={i === currentStep ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.6, repeat: i === currentStep ? Infinity : 0 }}
                  />
                  {step}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !done && (
          <p className="rules-generate-hint">
            설정한 규칙 기준으로 최적의 조합을 계산합니다
          </p>
        )}
      </motion.div>
    </>
  );
}
