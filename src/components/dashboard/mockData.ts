import { Users, CalendarCheck, AlertTriangle, RefreshCw } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────
export const STATS = [
  { label: "전체 직원",       value: 7,    unit: "명", icon: Users,         trend: null },
  { label: "이번 주 근무",    value: 34,   unit: "건", icon: CalendarCheck,  trend: "+2" },
  { label: "규칙 위반",       value: 3,    unit: "건", icon: AlertTriangle,  trend: null, warn: true },
  { label: "마지막 생성",     value: "2h", unit: "전", icon: RefreshCw,      trend: null },
];

export const TODAY_SHIFTS = [
  { type: "오전", time: "06–14", count: 3, color: "#3B82F6", bg: "#EFF6FF",
    employees: ["김민준", "박지훈", "정도현"] },
  { type: "오후", time: "14–22", count: 2, color: "#22C55E", bg: "#F0FDF4",
    employees: ["이서연", "한소희"] },
  { type: "야간", time: "22–06", count: 1, color: "#8B5CF6", bg: "#F5F3FF",
    employees: ["윤성민"] },
  { type: "휴무", time: "—",     count: 1, color: "#9CA3AF", bg: "#F9FAFB",
    employees: ["최유나"] },
];

export const WEEKLY_COVERAGE = [
  { day: "월", date: "03/23", active: 6, total: 7 },
  { day: "화", date: "03/24", active: 5, total: 7 },
  { day: "수", date: "03/25", active: 7, total: 7 },
  { day: "목", date: "03/26", active: 6, total: 7 },
  { day: "금", date: "03/27", active: 5, total: 7 },
  { day: "토", date: "03/28", active: 3, total: 7 },
  { day: "일", date: "03/29", active: 2, total: 7 },
];

export const VIOLATIONS = [
  { id: 1, day: "화 03/24", message: "야간 근무에 A등급 직원 미배치", severity: "high" },
  { id: 2, day: "금 03/27", message: "야간 근무에 A등급 직원 미배치", severity: "high" },
  { id: 3, day: "토 03/28", message: "최소 연속 휴식 11시간 미달 (박지훈)", severity: "medium" },
];

export const REQUESTS = [
  { id: 1, name: "최유나", type: "대타 요청", date: "03/25 오후", status: "pending" },
  { id: 2, name: "한소희", type: "근무 교환",  date: "03/27 오전", status: "pending" },
  { id: 3, name: "이서연", type: "대타 요청", date: "03/26 야간", status: "approved" },
];
