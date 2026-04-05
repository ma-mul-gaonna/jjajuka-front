export interface HardConstraint {
  minRestHours: number;
  maxConsecutiveDays: number;
  maxShiftsPerDay: number;
  requiredCount: number;
}

export interface CustomRule {
  id: number;
  text: string;
}

export interface ScheduleRule {
  id: number;
  name: string;
  minStaffPerShift: number;
  maxStaffPerShift: number;
  maxConsecutiveDays: number;
  customValues: string[];
}