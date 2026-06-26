export interface CalendarEvent {
  id?: string | null;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
  attendees?: Array<{ email?: string | null }> | null;
}

export interface TimeBlock {
  start: Date;
  end: Date;
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

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const WORK_MINUTES_PER_DAY = (WORK_END_HOUR - WORK_START_HOUR) * 60;

function toDate(val?: string | null): Date | null {
  if (!val) return null;
  return new Date(val);
}

function clampToWorkHours(date: Date): Date {
  const clamped = new Date(date);
  const hour = clamped.getHours();
  if (hour < WORK_START_HOUR) clamped.setHours(WORK_START_HOUR, 0, 0, 0);
  if (hour >= WORK_END_HOUR) clamped.setHours(WORK_END_HOUR, 0, 0, 0);
  return clamped;
}

function greedyMaxFocusBlocks(meetings: TimeBlock[], rangeStart: Date, rangeEnd: Date): TimeBlock[] {
  const focusBlocks: TimeBlock[] = [];
  let cursor = rangeStart;

  for (const meeting of meetings) {
    if (meeting.start > cursor) {
      const gap: TimeBlock = {
        start: new Date(cursor),
        end: new Date(meeting.start),
        durationMinutes: (meeting.start.getTime() - cursor.getTime()) / 60000,
      };
      if (gap.durationMinutes >= 25) focusBlocks.push(gap);
    }
    if (meeting.end > cursor) cursor = new Date(meeting.end);
  }

  if (cursor < rangeEnd) {
    const finalGap: TimeBlock = {
      start: new Date(cursor),
      end: new Date(rangeEnd),
      durationMinutes: (rangeEnd.getTime() - cursor.getTime()) / 60000,
    };
    if (finalGap.durationMinutes >= 25) focusBlocks.push(finalGap);
  }

  return focusBlocks;
}

class MinHeap<T> {
  private data: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  push(item: T) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  size() { return this.data.length; }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compare(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  private sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.compare(this.data[l], this.data[smallest]) < 0) smallest = l;
      if (r < n && this.compare(this.data[r], this.data[smallest]) < 0) smallest = r;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else break;
    }
  }
}

function buildRescheduleSlots(focusBlocks: TimeBlock[]): RescheduleSlot[] {
  const heap = new MinHeap<RescheduleSlot>((a, b) => b.priority - a.priority);
  for (const block of focusBlocks) {
    heap.push({
      freeStart: block.start.toISOString(),
      freeEnd: block.end.toISOString(),
      durationMinutes: block.durationMinutes,
      priority: Math.round(block.durationMinutes),
    });
  }
  const slots: RescheduleSlot[] = [];
  while (heap.size() > 0 && slots.length < 5) slots.push(heap.pop()!);
  return slots;
}

function buildHeatmap(meetings: TimeBlock[]): HeatmapRow[] {
  const minutesByHour: Record<number, number> = {};
  for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) minutesByHour[h] = 0;

  for (const m of meetings) {
    let cursor = new Date(m.start);
    while (cursor < m.end) {
      const h = cursor.getHours();
      if (h >= WORK_START_HOUR && h < WORK_END_HOUR) minutesByHour[h] = (minutesByHour[h] || 0) + 1;
      cursor = new Date(cursor.getTime() + 60000);
    }
  }

  return Object.entries(minutesByHour).map(([hour, mins]) => {
    const h = parseInt(hour);
    const density = mins === 0 ? "none" : mins < 20 ? "low" : mins < 45 ? "medium" : "high";
    return { hour: h, label: h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`, meetingMinutes: mins, density };
  });
}

export function analyzeCalendar(rawEvents: CalendarEvent[], threshold: number, rangeStart: Date, rangeEnd: Date): AnalysisResult {
  const meetings: TimeBlock[] = rawEvents
    .filter(e => e.start?.dateTime && e.end?.dateTime)
    .map(e => ({
      start: clampToWorkHours(toDate(e.start!.dateTime)!),
      end: clampToWorkHours(toDate(e.end!.dateTime)!),
      durationMinutes: 0,
    }))
    .map(e => ({ ...e, durationMinutes: (e.end.getTime() - e.start.getTime()) / 60000 }))
    .filter(e => e.durationMinutes > 0)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let backToBackCount = 0;
  for (let i = 1; i < meetings.length; i++) {
    const gap = (meetings[i].start.getTime() - meetings[i - 1].end.getTime()) / 60000;
    if (gap < 5) backToBackCount++;
  }

  const days = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / 86400000);
  const totalWorkMinutes = days * WORK_MINUTES_PER_DAY;
  const totalMeetingMinutes = meetings.reduce((sum, m) => sum + m.durationMinutes, 0);
  const totalFocusMinutes = Math.max(0, totalWorkMinutes - totalMeetingMinutes);
  const meetingRatio = totalMeetingMinutes / totalWorkMinutes;

  const focusBlocks = greedyMaxFocusBlocks(meetings, rangeStart, rangeEnd);
  const suggestedReschedules = buildRescheduleSlots(focusBlocks);
  const heatmap = buildHeatmap(meetings);

  return {
    totalWorkMinutes,
    totalMeetingMinutes: Math.round(totalMeetingMinutes),
    totalFocusMinutes: Math.round(totalFocusMinutes),
    meetingRatio: parseFloat(meetingRatio.toFixed(3)),
    isOverloaded: meetingRatio >= threshold,
    threshold,
    meetings,
    focusBlocks,
    suggestedReschedules,
    heatmap,
    backToBackCount,
  };
}
