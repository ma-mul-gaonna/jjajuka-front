"use client";

import { HardConstraint } from "@/types/rules";

interface Props {
  value: HardConstraint;
  onChange: (value: HardConstraint) => void;
}

const FIELDS: {
  key: keyof HardConstraint;
  label: string;
  hint: string;
  unit: string;
  min: number;
  max: number;
}[] = [
  { key: "minRestHours",      label: "최소 연속 휴식 시간", hint: "교대 근무 사이 최소 휴식",    unit: "H",  min: 1, max: 24 },
  { key: "maxConsecutiveDays", label: "최대 연속 근무 제한", hint: "연속 근무 가능 최대 일수",    unit: "일", min: 1, max: 30 },
  { key: "maxShiftsPerDay",   label: "일일 최대 근무 횟수", hint: "하루 최대 배정 가능 근무 수", unit: "회", min: 1, max: 10 },
  { key: "requiredCount",     label: "필수 인원 수",        hint: "근무 당 최소 필수 배치 인원", unit: "명", min: 1, max: 50 },
];

export default function HardConstraintForm({ value, onChange }: Props) {
  return (
    <div className="rule-section">
      <div className="rule-section-header">
        <span className="rule-section-tag blue">필수</span>
        <h3 className="rule-section-title">기본 운영 제약 조건</h3>
      </div>
      <p className="rule-section-desc">스케줄 생성 시 반드시 준수되는 제약 조건입니다.</p>

      <div className="hard-constraint-grid">
        {FIELDS.map(({ key, label, hint, unit, min, max }) => (
          <div key={key} className="hard-constraint-item">
            <div className="hard-constraint-info">
              <span className="hard-constraint-label">{label}</span>
              <span className="hard-constraint-hint">{hint}</span>
            </div>
            <div className="hard-constraint-input-wrap">
              <input
                type="number"
                min={min}
                max={max}
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
                className="hard-constraint-input"
              />
              <span className="hard-constraint-unit">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
