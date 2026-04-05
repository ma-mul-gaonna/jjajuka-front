export type ShiftType = "DAY" | "EVENING" | "NIGHT" | "MORNING";

export interface AbsenceInfo {
  userId: number;
  date: string;
  shiftName: string;
}

export interface RecommendationItem {
  rank: number;
  userId: number;
  userName: string;
  score: number;
  reasons: string;
}

export interface RecommendationResponse {
  status: string;
  message: string;
  absence: AbsenceInfo;
  recommendations: RecommendationItem[];
  warnings: string[];
}

export interface VacancyItem {
  vacancyId: number;
  memberId: number;
  memberName: string;
  scheduleId: number;
  schedule: { workDate: string; shiftType: string; status: string };
  reason: string;
  status: string;
  createdAt: string;
}

export interface VacancyWithRecommendations {
  vacancy: VacancyItem;
  recommendation: RecommendationResponse | null;
}
