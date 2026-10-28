/**
 * Pure domain logic and calculations for VYUVIK Student Companion
 * Decoupled from UI components for deterministic calculation and unit testing.
 */

export interface AttendanceSubject {
  id: string;
  name: string;
  code: string;
  conducted: number;
  attended: number;
  targetPercent?: number; // default 75
}

export interface AttendanceCalculation {
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  classesNeededFor75: number;
  safeBunksAvailable: number;
  scenarioText: string;
}

/**
 * Calculates student attendance statistics and scenarios deterministically.
 */
export function calculateAttendance(
  conducted: number,
  attended: number,
  targetPercentage: number = 75
): AttendanceCalculation {
  if (conducted <= 0) {
    return {
      percentage: 100,
      status: 'safe',
      classesNeededFor75: 0,
      safeBunksAvailable: 0,
      scenarioText: 'No classes conducted yet.',
    };
  }

  const validAttended = Math.min(Math.max(0, attended), conducted);
  const percentage = Math.round((validAttended / conducted) * 1000) / 10; // 1 decimal place

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  if (percentage < 65) {
    status = 'critical';
  } else if (percentage < targetPercentage) {
    status = 'warning';
  }

  // Calculate classes needed to reach target percentage:
  // (attended + x) / (conducted + x) >= target / 100
  // 100 * attended + 100 * x >= target * conducted + target * x
  // x * (100 - target) >= target * conducted - 100 * attended
  let classesNeededFor75 = 0;
  if (percentage < targetPercentage) {
    const numerator = (targetPercentage * conducted) - (100 * validAttended);
    const denominator = 100 - targetPercentage;
    classesNeededFor75 = Math.ceil(numerator / denominator);
    if (classesNeededFor75 < 0) classesNeededFor75 = 0;
  }

  // Calculate safe bunks available without dropping below target:
  // validAttended / (conducted + y) >= target / 100
  // 100 * validAttended >= target * conducted + target * y
  // y * target <= 100 * validAttended - target * conducted
  let safeBunksAvailable = 0;
  if (percentage >= targetPercentage) {
    const maxTotalClasses = Math.floor((100 * validAttended) / targetPercentage);
    safeBunksAvailable = Math.max(0, maxTotalClasses - conducted);
  }

  let scenarioText = '';
  if (percentage < targetPercentage) {
    scenarioText = `Attend next ${classesNeededFor75} class${classesNeededFor75 === 1 ? '' : 'es'} consecutively to reach ${targetPercentage}%.`;
  } else {
    scenarioText = safeBunksAvailable > 0
      ? `You can safely miss ${safeBunksAvailable} class${safeBunksAvailable === 1 ? '' : 'es'} and stay above ${targetPercentage}%.`
      : `You are on the boundary! Do not miss the next class.`;
  }

  return {
    percentage,
    status,
    classesNeededFor75,
    safeBunksAvailable,
    scenarioText,
  };
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface BudgetConfig {
  category: string;
  monthlyLimit: number;
}

/**
 * Calculates expense summary totals and category breakdowns.
 */
export function calculateExpenseSummary(
  expenses: ExpenseItem[],
  budgets: BudgetConfig[] = []
) {
  let totalSpent = 0;
  const categoryTotals: Record<string, number> = {};

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    totalSpent += amt;
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
  }

  const budgetComparison = budgets.map((b) => {
    const spent = categoryTotals[b.category] || 0;
    const remaining = b.monthlyLimit - spent;
    const percentUsed = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    return {
      category: b.category,
      limit: b.monthlyLimit,
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > b.monthlyLimit,
    };
  });

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    categoryTotals,
    budgetComparison,
  };
}

export interface StudyBlockInput {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

/**
 * Validates scheduling conflicts and builds time slots for study planner.
 */
export function validateAndAllocateStudySlots(
  blocks: StudyBlockInput[],
  availableDailyMinutes: number,
  startHour: number = 17 // 5 PM
): {
  allocatedSlots: Array<{
    id: string;
    blockId: string;
    title: string;
    subject: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  }>;
  overflowBlocks: StudyBlockInput[];
  totalAllocatedMinutes: number;
} {
  let currentMinute = startHour * 60;
  let remainingDailyMinutes = Math.max(0, availableDailyMinutes);
  let totalAllocatedMinutes = 0;

  const allocatedSlots = [];
  const overflowBlocks: StudyBlockInput[] = [];

  // Sort blocks by priority: high first
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  const sorted = [...blocks].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  for (const block of sorted) {
    const dur = Math.max(15, block.durationMinutes);
    if (dur <= remainingDailyMinutes) {
      const startH = Math.floor(currentMinute / 60);
      const startM = currentMinute % 60;
      const endMinute = currentMinute + dur;
      const endH = Math.floor(endMinute / 60);
      const endM = endMinute % 60;

      const formatTime = (h: number, m: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m.toString().padStart(2, '0');
        return `${displayH}:${displayM} ${period}`;
      };

      allocatedSlots.push({
        id: `slot-${block.id}`,
        blockId: block.id,
        title: block.title,
        subject: block.subject,
        startTime: formatTime(startH, startM),
        endTime: formatTime(endH, endM),
        durationMinutes: dur,
      });

      currentMinute = endMinute + 10; // 10 min rest break
      remainingDailyMinutes -= (dur + 10);
      totalAllocatedMinutes += dur;
    } else {
      overflowBlocks.push(block);
    }
  }

  return {
    allocatedSlots,
    overflowBlocks,
    totalAllocatedMinutes,
  };
}

/**
 * Parses time string (e.g. "7:00 PM", "19:30", "11:00 AM") into minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const numPart = cleaned.replace(/[AP]M/, '').trim();
  const parts = numPart.split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into 12-hour time string (e.g. 1110 -> "6:30 PM").
 */
export function formatMinutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

export interface ScheduleBlockTime {
  id?: string;
  title?: string;
  subject?: string;
  startTime: string;
  endTime: string;
  day?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType: 'overlap' | 'fatigue_warning' | 'none';
  conflicts: string[];
  conflictingBlockTitles: string[];
  suggestedStartTime?: string;
  suggestedEndTime?: string;
}

/**
 * Validates schedule conflicts:
 * - Detects direct time overlaps on the same day
 * - Checks for cognitive fatigue if total study on that day exceeds 240 mins (4 hours)
 * - Computes clean conflict-free suggested start and end times
 */
export function checkScheduleConflict(
  newBlock: ScheduleBlockTime,
  existingBlocks: ScheduleBlockTime[]
): ConflictCheckResult {
  const newStart = parseTimeToMinutes(newBlock.startTime);
  const newEnd = parseTimeToMinutes(newBlock.endTime);
  const targetDay = newBlock.day || 'Today';

  const duration = newEnd > newStart ? newEnd - newStart : 60;
  const sameDayBlocks = existingBlocks.filter(
    (b) => (!b.day && targetDay === 'Today') || b.day === targetDay
  );

  const conflicts: string[] = [];
  const conflictingBlockTitles: string[] = [];
  let latestConflictingEnd = 0;

  for (const block of sameDayBlocks) {
    if (newBlock.id && block.id === newBlock.id) continue;
    const blockStart = parseTimeToMinutes(block.startTime);
    const blockEnd = parseTimeToMinutes(block.endTime);

    // Overlap condition: startA < endB && endA > startB
    if (newStart < blockEnd && newEnd > blockStart) {
      conflicts.push(
        `Direct collision with "${block.title || block.subject || 'Existing session'}" (${block.startTime} - ${block.endTime})`
      );
      if (block.title) conflictingBlockTitles.push(block.title);
      if (blockEnd > latestConflictingEnd) {
        latestConflictingEnd = blockEnd;
      }
    }
  }

  // Calculate total scheduled minutes on this day
  const existingDailyMinutes = sameDayBlocks.reduce((acc, b) => {
    const s = parseTimeToMinutes(b.startTime);
    const e = parseTimeToMinutes(b.endTime);
    return acc + Math.max(15, e - s);
  }, 0);

  const totalProjectedMinutes = existingDailyMinutes + duration;

  if (conflicts.length > 0) {
    const suggestedStartMin = latestConflictingEnd + 10; // 10 min recovery gap
    return {
      hasConflict: true,
      conflictType: 'overlap',
      conflicts,
      conflictingBlockTitles,
      suggestedStartTime: formatMinutesToTime(suggestedStartMin),
      suggestedEndTime: formatMinutesToTime(suggestedStartMin + duration),
    };
  }

  if (totalProjectedMinutes > 240) {
    return {
      hasConflict: true,
      conflictType: 'fatigue_warning',
      conflicts: [
        `High workload warning: Projected study duration (${Math.floor(totalProjectedMinutes / 60)}h ${totalProjectedMinutes % 60}m) exceeds 4-hour evening recommendation.`,
      ],
      conflictingBlockTitles: [],
    };
  }

  return {
    hasConflict: false,
    conflictType: 'none',
    conflicts: [],
    conflictingBlockTitles: [],
  };
}

export interface ExtractedQuestionInput {
  number?: string;
  text: string;
  marks?: number;
  unit?: string;
  topic?: string;
}

export interface CalculatedTopicFrequency {
  topic: string;
  unit?: string;
  count: number;
  totalMarks: number;
  weightPercent: number;
  weightLabel: string;
  frequencyTier: 'High Yield' | 'Important' | 'Standard';
  questionNumbers: string[];
}

/**
 * Calculates topic frequencies and weight distributions directly from extracted paper questions.
 * Ensures 100% deterministic arithmetic instead of hallucinated percentages.
 */
export function calculateTopicFrequencies(
  questions: ExtractedQuestionInput[]
): CalculatedTopicFrequency[] {
  if (!questions || questions.length === 0) return [];

  const topicMap: Record<
    string,
    {
      unit?: string;
      count: number;
      totalMarks: number;
      questionNumbers: string[];
    }
  > = {};

  let overallPaperMarks = 0;

  for (const q of questions) {
    const rawTopic = (q.topic || q.unit || 'General Concepts').trim();
    const marks = Number(q.marks) > 0 ? Number(q.marks) : 8; // default 8 marks if unassigned
    overallPaperMarks += marks;

    if (!topicMap[rawTopic]) {
      topicMap[rawTopic] = {
        unit: q.unit,
        count: 0,
        totalMarks: 0,
        questionNumbers: [],
      };
    }

    topicMap[rawTopic].count += 1;
    topicMap[rawTopic].totalMarks += marks;
    if (q.number) {
      topicMap[rawTopic].questionNumbers.push(q.number);
    }
  }

  const safeTotalMarks = Math.max(1, overallPaperMarks);

  const results: CalculatedTopicFrequency[] = Object.entries(topicMap).map(
    ([topic, data]) => {
      const weightPercent = Math.round((data.totalMarks / safeTotalMarks) * 100);
      let frequencyTier: 'High Yield' | 'Important' | 'Standard' = 'Standard';

      if (data.count >= 3 || weightPercent >= 25) {
        frequencyTier = 'High Yield';
      } else if (data.count >= 2 || weightPercent >= 15) {
        frequencyTier = 'Important';
      }

      return {
        topic,
        unit: data.unit,
        count: data.count,
        totalMarks: data.totalMarks,
        weightPercent,
        weightLabel: `${weightPercent}%`,
        frequencyTier,
        questionNumbers: data.questionNumbers,
      };
    }
  );

  // Sort descending by total marks, then count
  return results.sort((a, b) => b.totalMarks - a.totalMarks || b.count - a.count);
}

/**
 * Calculates deterministic burn rate and daily spending allowances for student budget.
 */
export function calculateDailyBurnRate(
  expenses: ExpenseItem[],
  monthlyBudget: number = 5000,
  daysElapsed: number = new Date().getDate(),
  daysInMonth: number = 30
) {
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const safeDaysElapsed = Math.max(1, daysElapsed);
  const dailyAverage = Math.round((totalSpent / safeDaysElapsed) * 100) / 100;
  const daysRemaining = Math.max(0, daysInMonth - safeDaysElapsed);
  const projectedMonthTotal = Math.round((totalSpent + dailyAverage * daysRemaining) * 100) / 100;
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const safeDailyAllowance =
    daysRemaining > 0 ? Math.round((remainingBudget / daysRemaining) * 100) / 100 : 0;
  const isPacingOverBudget = projectedMonthTotal > monthlyBudget;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    dailyAverage,
    projectedMonthTotal,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    safeDailyAllowance,
    isPacingOverBudget,
    pacingVariance: Math.round(Math.abs(projectedMonthTotal - monthlyBudget) * 100) / 100,
  };
}

