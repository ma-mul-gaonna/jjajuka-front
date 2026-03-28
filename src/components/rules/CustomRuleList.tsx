"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { CustomRule } from "@/types/rules";

interface Props {
  rules: CustomRule[];
  onChange: (rules: CustomRule[]) => void;
}

export default function CustomRuleList({ rules, onChange }: Props) {
  const [input, setInput] = useState("");

  const addRule = () => {
    const text = input.trim();
    if (!text) return;
    const newRule: CustomRule = { id: Date.now(), text };
    onChange([...rules, newRule]);
    setInput("");
  };

  const deleteRule = (id: number) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addRule();
    }
  };

  return (
    <div className="rule-section">
      <div className="rule-section-header">
        <span className="rule-section-dot purple" />
        <h3 className="rule-section-title">AI 커스텀 가이드 (Custom Rules)</h3>
      </div>
      <p className="rule-section-desc">
        보라색 박스의 규칙만 AI 근무표 생성에 반영됩니다.
      </p>

      {rules.length > 0 && (
        <div className="custom-rule-list">
          {rules.map((rule) => (
            <div key={rule.id} className="custom-rule-item">
              <span className="custom-rule-text">{rule.text}</span>
              <button
                className="custom-rule-delete"
                onClick={() => deleteRule(rule.id)}
                aria-label="규칙 삭제"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="custom-rule-input-wrap">
        <div className="custom-rule-input-label">
          신규 규칙 직접 입력
          <span className="custom-rule-ai-hint">* AI가 문맥을 분석합니다</span>
        </div>
        <textarea
          className="custom-rule-textarea"
          placeholder="예) 마지막주 금요일은 9~6시까지만 근무"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        <button className="custom-rule-add-btn" onClick={addRule}>
          <Plus size={14} />
          규칙 추가
        </button>
      </div>
    </div>
  );
}