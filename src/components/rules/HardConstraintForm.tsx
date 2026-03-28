"use client";

import { HardConstraint } from "@/types/rules";

interface Props {
  value: HardConstraint;
  onChange: (value: HardConstraint) => void;
}

export default function HardConstraintForm({ value, onChange }: Props) {
  return (
    <div className="rule-section">
      <div className="rule-section-header">
        <span className="rule-section-dot blue" />
        <h3 className="rule-section-title">기본 운영 규칙 (Hard Constraints)</h3>
      </div>
      <p className="rule-section-desc">체크된 항목은 AI가 반드시 준수합니다.</p>

      <div className="hard-constraint-grid">
        <div className="hard-constraint-item">
          <input type="checkbox" defaultChecked className="rule-checkbox" readOnly />
          <span className="hard-constraint-label">최소 연속 휴식 시간</span>
          <div className="hard-constraint-input-wrap">
            <input
              type="number"
              min={1}
              max={24}
              value={value.minRestHours}
              onChange={(e) =>
                onChange({ ...value, minRestHours: Number(e.target.value) })
              }
              className="hard-constraint-input"
            />
            <span className="hard-constraint-unit">H</span>
          </div>
        </div>

        <div className="hard-constraint-item">
          <input type="checkbox" defaultChecked className="rule-checkbox" readOnly />
          <span className="hard-constraint-label">최대 연속 근무 제한</span>
          <div className="hard-constraint-input-wrap">
            <input
              type="number"
              min={1}
              max={30}
              value={value.maxConsecutiveDays}
              onChange={(e) =>
                onChange({ ...value, maxConsecutiveDays: Number(e.target.value) })
              }
              className="hard-constraint-input"
            />
            <span className="hard-constraint-unit">일</span>
          </div>
        </div>
      </div>
    </div>
  );
}