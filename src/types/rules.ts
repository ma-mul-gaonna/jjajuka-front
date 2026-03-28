export interface HardConstraint {
  minRestHours: number;
  maxConsecutiveDays: number;
}

export interface CustomRule {
  id: number;
  text: string;
}