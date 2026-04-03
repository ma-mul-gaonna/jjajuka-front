// ─── Types ───────────────────────────────────────────────
export type Grade = "A" | "B" | "C";
export type Status = "active" | "leave";

export interface Employee {
  id: number;
  name: string;
  grade: Grade;
  role: string;
  phone: string;
  joinDate: string;
  status: Status;
}

// ─── Mock Data ───────────────────────────────────────────
export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: "김민준", grade: "A", role: "시니어", phone: "010-1234-5678", joinDate: "2021-03-15", status: "active" },
  { id: 2, name: "이서연", grade: "B", role: "미들",   phone: "010-2345-6789", joinDate: "2022-07-01", status: "active" },
  { id: 3, name: "박지훈", grade: "A", role: "시니어", phone: "010-3456-7890", joinDate: "2020-11-20", status: "active" },
  { id: 4, name: "최유나", grade: "C", role: "주니어", phone: "010-4567-8901", joinDate: "2024-01-10", status: "active" },
  { id: 5, name: "정도현", grade: "B", role: "미들",   phone: "010-5678-9012", joinDate: "2023-04-05", status: "active" },
  { id: 6, name: "한소희", grade: "C", role: "주니어", phone: "010-6789-0123", joinDate: "2024-03-22", status: "leave"  },
  { id: 7, name: "윤성민", grade: "A", role: "시니어", phone: "010-7890-1234", joinDate: "2019-08-30", status: "active" },
];

export const GRADE_ORDER: Grade[] = ["A", "B", "C"];
export const GRADE_META: Record<Grade, { label: string; color: string; bg: string; desc: string }> = {
  A: { label: "A등급", color: "#1D4ED8", bg: "#EFF6FF", desc: "숙련자" },
  B: { label: "B등급", color: "#15803D", bg: "#F0FDF4", desc: "중급자" },
  C: { label: "C등급", color: "#6B7280", bg: "#F9FAFB", desc: "신규/초급" },
};

export const EMPTY_FORM = { name: "", grade: "C" as Grade, role: "", phone: "", joinDate: "" };
