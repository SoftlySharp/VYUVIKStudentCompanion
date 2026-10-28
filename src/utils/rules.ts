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
