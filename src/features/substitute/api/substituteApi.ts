export type ShiftType = "DAY" | "EVENING" | "NIGHT";

export interface VacancyInfo {
  memberId: number;
  memberName: string;
  scheduleId: number;
  workDate: string;
  shiftType: ShiftType;
  reason: string;
}

export interface AvailableSchedule {
  scheduleId: number;
  workDate: string;
  shiftType: ShiftType;
}

export interface Recommendation {
  rank: number;
  candidateMemberId: number;
  candidateName: string;
  matchScore: number;
  reason: string;
  availableSchedules: AvailableSchedule[];
}

export interface RecommendationData {
  vacancyId: number;
  vacancyInfo: VacancyInfo;
  recommendations: Recommendation[];
  totalCandidates: number;
}

export async function fetchRecommendations(vacancyId: number): Promise<RecommendationData> {
  const res = await fetch(`/api/replacement-recommendations?vacancyId=${vacancyId}`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? "추천 인력을 불러오지 못했습니다.");
  }

  return json.data;
}
