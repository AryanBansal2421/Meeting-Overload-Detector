export interface TimeBlock {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface RescheduleSlot {
  freeStart: string;
  freeEnd: string;
  durationMinutes: number;
  priority: number;
}

export interface HeatmapRow {
  hour: number;
  label: string;
  meetingMinutes: number;
  density: "none" | "low" | "medium" | "high";
}

export interface AnalysisResult {
  totalWorkMinutes: number;
  totalMeetingMinutes: number;
  totalFocusMinutes: number;
  meetingRatio: number;
  isOverloaded: boolean;
  threshold: number;
  meetings: TimeBlock[];
  focusBlocks: TimeBlock[];
  suggestedReschedules: RescheduleSlot[];
  heatmap: HeatmapRow[];
  backToBackCount: number;
}
