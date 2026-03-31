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
        <span className="rule-section-tag blue">필수</span>
        <h3 className="rule-section-title">기본 운영 제약 조건</h3>
      </div>
      <p className="rule-section-desc">체크된 항목은 스케줄 생성 시 반드시 준수됩니다.</p>

      <div className="hard-constraint-grid">
        <label className="hard-constraint-item">
          <input type="checkbox" defaultChecked className="rule-checkbox" readOnly />
          <div className="hard-constraint-info">
            <span className="hard-constraint-label">최소 연속 휴식 시간</span>
            <span className="hard-constraint-hint">교대 근무 사이 최소 휴식</span>
          </div>
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
        </label>

        <label className="hard-constraint-item">
          <input type="checkbox" defaultChecked className="rule-checkbox" readOnly />
          <div className="hard-constraint-info">
            <span className="hard-constraint-label">최대 연속 근무 제한</span>
            <span className="hard-constraint-hint">연속 근무 가능 최대 일수</span>
          </div>
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
        </label>
      </div>
    </div>
  );
}
