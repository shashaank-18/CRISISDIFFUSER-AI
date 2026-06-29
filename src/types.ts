export interface TaskStep {
  title: string;
  duration: number; // in minutes
  tip: string;
  completed?: boolean;
}

export interface TimeBlock {
  blockName: string;
  durationMinutes: number;
  breakMinutes: number;
  focusArea: string;
}

export interface Task {
  id: string;
  title: string;
  deadline: string; // ISO datetime string
  importance: "Low" | "Medium" | "High";
  description: string;
  completed: boolean;
  priorityScore?: number; // 0 - 100
  survivalTier?: "CRITICAL" | "HIGH RISK" | "MODERATE" | "NORMAL";
  breakdown?: TaskStep[];
  extensionTemplate?: string;
  mitigationTip?: string;
  timeBlocks?: TimeBlock[];
  analyzing?: boolean;
  error?: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD"
  savedToday?: boolean;
  saverAlternative?: string | null;
  saverSlogan?: string | null;
  saverBenefit?: string | null;
  saving?: boolean;
}

export interface Recommendation {
  type: "CRISIS" | "STRATEGY" | "MOTIVATION" | "RESCHEDULE";
  title: string;
  description: string;
  actionLabel: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  taskId?: string;
  completed?: boolean;
}
