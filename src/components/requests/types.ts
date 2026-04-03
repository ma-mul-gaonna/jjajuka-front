// ─── Types ───────────────────────────────────────────────
export type RequestType = "결원 요청" | "대타 요청" | "근무 교환";
export type ShiftType = "오전" | "오후" | "야간";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface ShiftRequest {
  id: number;
  type: RequestType;
  date: string;
  shift: ShiftType;
  memo: string;
  status: RequestStatus;
  createdAt: string;
}

export const EMPTY_FORM: {
  type: RequestType;
  date: string;
  shift: ShiftType;
  memo: string;
} = {
  type: "결원 요청",
  date: "",
  shift: "오전",
  memo: "",
};

// ─── Mock Data ───────────────────────────────────────────
export const INITIAL_REQUESTS: ShiftRequest[] = [
  {
    id: 1,
    type: "결원 요청",
    date: "2026-04-05",
    shift: "오전",
    memo: "개인 사정으로 출근이 어렵습니다",
    status: "pending",
    createdAt: "2026-04-01",
  },
  {
    id: 2,
    type: "대타 요청",
    date: "2026-03-27",
    shift: "야간",
    memo: "",
    status: "approved",
    createdAt: "2026-03-25",
  },
  {
    id: 3,
    type: "근무 교환",
    date: "2026-03-26",
    shift: "오후",
    memo: "이서연님과 근무 교환 희망",
    status: "rejected",
    createdAt: "2026-03-24",
  },
];

export const REQUEST_TYPE_META: Record<RequestType, { color: string; bg: string }> = {
  "결원 요청": { color: "#DC2626", bg: "#FEF2F2" },
  "대타 요청": { color: "#2563EB", bg: "#EFF6FF" },
  "근무 교환": { color: "#7C3AED", bg: "#F5F3FF" },
};

export const SHIFT_META: Record<ShiftType, { color: string; bg: string }> = {
  오전: { color: "#2563EB", bg: "#EFF6FF" },
  오후: { color: "#16A34A", bg: "#F0FDF4" },
  야간: { color: "#7C3AED", bg: "#F5F3FF" },
};

export const STATUS_META: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "대기 중", color: "#92400E", bg: "#FFFBEB" },
  approved: { label: "승인됨", color: "#065F46", bg: "#ECFDF5" },
  rejected: { label: "거절됨", color: "#991B1B", bg: "#FEF2F2" },
};
