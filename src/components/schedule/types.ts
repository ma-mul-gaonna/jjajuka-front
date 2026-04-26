// ─── Types ───────────────────────────────────────────────
export type ShiftType = "AM" | "PM" | "NIGHT" | "OFF";
export type ViewMode = "week" | "month";
export type WeekSchedule = Record<string, ShiftType>;
export type MonthSchedule = Record<string, ShiftType>; // key: `${empId}-${dayOfMonth}`

export interface Employee { id: number; name: string; grade?: "A" | "B" | "C"; }

// ─── API types ───────────────────────────────────────────
export interface ScheduleAssignment {
  scheduleId: number;
  memberId: number;
  memberName: string;
  shiftType: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleDay {
  date: string;
  dayCount: number;
  eveningCount: number;
  nightCount: number;
  assignments: ScheduleAssignment[];
}

export interface ScheduleGroupResponse {
  scheduleGroupId: number;
  scheduleYearMonth: string;
  days: ScheduleDay[];
}

export const SHIFT_API_TO_TYPE: Record<string, ShiftType> = {
  DAY:     "AM",
  EVENING: "PM",
  NIGHT:   "NIGHT",
  OFF:     "OFF",
};

// ─── Constants ───────────────────────────────────────────
export const EMPLOYEES: Employee[] = [
  { id: 1, name: "김민준", grade: "A" },
  { id: 2, name: "이서연", grade: "B" },
  { id: 3, name: "박지훈", grade: "A" },
  { id: 4, name: "최유나", grade: "C" },
  { id: 5, name: "정도현", grade: "B" },
  { id: 6, name: "한소희", grade: "C" },
  { id: 7, name: "윤성민", grade: "A" },
];

export const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
export const DATES = ["03/23", "03/24", "03/25", "03/26", "03/27", "03/28", "03/29"];
export const SHIFT_CYCLE: ShiftType[] = ["AM", "PM", "NIGHT", "OFF"];

export const SHIFT_META: Record<ShiftType, { label: string; time: string; bg: string; color: string; dot: string }> = {
  AM:    { label: "오전", time: "06–14", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  PM:    { label: "오후", time: "14–22", bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  NIGHT: { label: "야간", time: "22–06", bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  OFF:   { label: "휴무", time: "—",     bg: "#F9FAFB", color: "#9CA3AF", dot: "#E5E7EB" },
};

// April 2026: starts on Wednesday → Sun-first offset = 3 (일=0,월=1,화=2,수=3)
export const MONTH_START_OFFSET = 3;
export const MONTH_DAYS = 30;
export const CURRENT_WEEK = [20, 21, 22, 23, 24, 25, 26]; // 4/20~4/26 (이번 주)
export const TODAY = 26; // 2026-04-26 (일)

// ─── Data generators ─────────────────────────────────────
export function makeWeekSchedule(): WeekSchedule {
  const s: WeekSchedule = {};
  EMPLOYEES.forEach((emp) => {
    let offCount = 0;
    DAYS.forEach((_, d) => {
      if (offCount < 2 && Math.random() < 0.28) {
        s[`${emp.id}-${d}`] = "OFF"; offCount++;
      } else {
        const opts: ShiftType[] = ["AM", "PM", "NIGHT"];
        s[`${emp.id}-${d}`] = opts[Math.floor(Math.random() * 3)];
      }
    });
  });
  return s;
}

export function makeMonthSchedule(): MonthSchedule {
  const s: MonthSchedule = {};
  EMPLOYEES.forEach((emp) => {
    for (let day = 1; day <= MONTH_DAYS; day++) {
      if (Math.random() < 0.22) {
        s[`${emp.id}-${day}`] = "OFF";
      } else {
        const opts: ShiftType[] = ["AM", "PM", "NIGHT"];
        s[`${emp.id}-${day}`] = opts[Math.floor(Math.random() * 3)];
      }
    }
  });
  return s;
}
