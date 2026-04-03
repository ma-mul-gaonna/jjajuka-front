"use client";

import { motion } from "framer-motion";
import { Grade, GRADE_META } from "./types";

interface GradeBadgeProps {
  grade: Grade;
  onClick?: () => void;
}

export default function GradeBadge({ grade, onClick }: GradeBadgeProps) {
  const meta = GRADE_META[grade];
  return (
    <motion.span
      className="emp-grade-badge"
      style={{ color: meta.color, background: meta.bg }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.08 } : {}}
      whileTap={onClick ? { scale: 0.93 } : {}}
      title={onClick ? "클릭해서 등급 변경" : undefined}
    >
      {meta.label}
    </motion.span>
  );
}
