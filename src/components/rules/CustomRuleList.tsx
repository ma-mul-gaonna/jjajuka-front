"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomRule } from "@/types/rules";

interface Props {
  rules: CustomRule[];
  onAdd: (text: string) => void;
  onDelete: (id: number) => void;
}

export default function CustomRuleList({ rules, onAdd, onDelete }: Props) {
  const [input, setInput] = useState("");

  const addRule = () => {
    const text = input.trim();
    if (!text) return;
    onAdd(text);
    setInput("");
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
        <span className="rule-section-tag purple">커스텀</span>
        <h3 className="rule-section-title">커스텀 가이드 규칙</h3>
        <span className="rule-count-badge">{rules.length}개</span>
      </div>
      <p className="rule-section-desc">
        아래 규칙은 스케줄 생성 시 우선적으로 반영됩니다.
      </p>

      <div className="custom-rule-list">
        <AnimatePresence initial={false}>
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              className="custom-rule-item"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              layout
            >
              <span className="custom-rule-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="custom-rule-text">{rule.text}</span>
              <motion.button
                className="custom-rule-delete"
                onClick={() => onDelete(rule.id)}
                aria-label="규칙 삭제"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={12} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {rules.length === 0 && (
          <div className="custom-rule-empty">
            아직 추가된 규칙이 없습니다
          </div>
        )}
      </div>

      <div className="custom-rule-input-wrap">
        <textarea
          className="custom-rule-textarea"
          placeholder="예) 마지막 주 금요일은 9~18시 근무만 허용"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={false}
        />
        <motion.button
          className="custom-rule-add-btn"
          onClick={addRule}
          disabled={false}
          whileHover={!false ? { scale: 1.02 } : {}}
          whileTap={!false ? { scale: 0.97 } : {}}
        >
          <Plus size={14} />
          {false ? "추가 중..." : "규칙 추가"}
        </motion.button>
      </div>
    </div>
  );
}
