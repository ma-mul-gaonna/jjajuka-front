"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import HardConstraintForm from "./HardConstraintForm";
import CustomRuleList from "./CustomRuleList";
import { HardConstraint, CustomRule } from "@/types/rules";

const INITIAL_RULES: CustomRule[] = [
  { id: 1, text: "야간 근무 조에는 반드시 숙련자(A등급)를 1명 이상 포함할 것" },
  { id: 2, text: "육아 중인 직원은 가급적 월요일 오전 근무에서 제외할 것" },
];

export default function RulesClient() {
  const [constraint, setConstraint] = useState<HardConstraint>({
    minRestHours: 11,
    maxConsecutiveDays: 6,
  });
  const [customRules, setCustomRules] = useState<CustomRule[]>(INITIAL_RULES);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <>
      <div className="rules-header">
        <div>
          <h2 className="rules-title">근무 규칙 및 제약 조건 설정</h2>
          <p className="rules-subtitle">
            AI가 근무표를 생성할 때 준수해야 할 규칙을 설정하세요.
          </p>
        </div>
        <span className="rules-mode-badge">ADMIN MODE</span>
      </div>

      <div className="rules-body">
        <HardConstraintForm value={constraint} onChange={setConstraint} />
        <CustomRuleList rules={customRules} onChange={setCustomRules} />
      </div>

      <div className="rules-footer">
        <button
          className="rules-generate-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          <Sparkles size={16} />
          {loading ? "생성 중..." : "규칙 적용 및 근무표 자동 생성 시작"}
        </button>
        <p className="rules-generate-hint">
          생성 버튼 클릭 시 AI가 약 10~20초간 최적의 조합을 계산합니다.
        </p>
      </div>
    </>
  );
}